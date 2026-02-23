import { body } from 'express-validator';
import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

// ── Validation rules ─────────────────────────────────────────────────
export const applicationRules = [
    body('company_name').trim().notEmpty().withMessage('Company name is required'),
    body('job_title').trim().notEmpty().withMessage('Job title is required'),
    body('application_date').isISO8601().withMessage('Valid application date required'),
    body('final_result')
        .optional()
        .isIn(['pending', 'offer', 'rejected'])
        .withMessage('final_result must be pending, offer, or rejected'),
    body('salary_min').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('salary_min must be a positive number'),
    body('salary_max').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('salary_max must be a positive number'),
    body('job_link').optional({ nullable: true }).isURL().withMessage('job_link must be a valid URL'),
];

// ── GET /api/applications ─────────────────────────────────────────────
export const getApplications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { search, result, page = 1, limit = 10 } = req.query;

        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const params = [userId];
        let where = 'WHERE a.user_id = ?';

        if (search) {
            where += ' AND (a.company_name LIKE ? OR a.job_title LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (result && ['pending', 'offer', 'rejected'].includes(result)) {
            where += ' AND a.final_result = ?';
            params.push(result);
        }

        // Count total for pagination
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM applications a ${where}`,
            params
        );

        // Fetch paginated rows with current stage name
        const [rows] = await pool.query(
            `SELECT a.*, s.stage_name AS current_stage_name
       FROM applications a
       LEFT JOIN stages s ON a.current_stage_id = s.id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
            [...params, parseInt(limit, 10), offset]
        );

        return sendSuccess(res, 200, 'Applications retrieved', {
            applications: rows,
            pagination: {
                total: Number(total),
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                pages: Math.ceil(Number(total) / parseInt(limit, 10)),
            },
        });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/applications/:id ─────────────────────────────────────────
export const getApplication = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT a.*, s.stage_name AS current_stage_name
       FROM applications a
       LEFT JOIN stages s ON a.current_stage_id = s.id
       WHERE a.id = ? AND a.user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (rows.length === 0) return sendError(res, 404, 'Application not found.');
        return sendSuccess(res, 200, 'Application retrieved', rows[0]);
    } catch (err) {
        next(err);
    }
};

// ── POST /api/applications ────────────────────────────────────────────
export const createApplication = async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const {
            company_name, job_title, location, application_date,
            salary_min, salary_max, job_link, notes,
            final_result = 'pending',
            // Stage seeding options
            template_id,       // id of a stage_template to copy
            stages: stagesInput, // array of { stage_name, stage_order }
        } = req.body;

        // 1. Insert application (no current_stage_id yet)
        const [appResult] = await conn.query(
            `INSERT INTO applications
         (user_id, company_name, job_title, location, application_date,
          salary_min, salary_max, job_link, notes, final_result)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id, company_name, job_title, location || null, application_date,
                salary_min || null, salary_max || null, job_link || null, notes || null,
                final_result,
            ]
        );
        const appId = appResult.insertId;

        // 2. Seed stages from template or manual input
        let stagesToInsert = [];

        if (template_id) {
            // Copy stages from the selected template
            const [tStages] = await conn.query(
                'SELECT stage_name, stage_order FROM template_stages WHERE template_id = ? ORDER BY stage_order',
                [template_id]
            );
            stagesToInsert = tStages;
        } else if (Array.isArray(stagesInput) && stagesInput.length > 0) {
            stagesToInsert = stagesInput.map((s, i) => ({
                stage_name: s.stage_name,
                stage_order: s.stage_order ?? i + 1,
            }));
        }

        let firstStageId = null;
        if (stagesToInsert.length > 0) {
            for (const stage of stagesToInsert) {
                const [stageResult] = await conn.query(
                    `INSERT INTO stages (application_id, stage_name, stage_order)
           VALUES (?, ?, ?)`,
                    [appId, stage.stage_name, stage.stage_order]
                );
                if (firstStageId === null) firstStageId = stageResult.insertId;
            }
            // Set current_stage_id to the first stage
            await conn.query(
                'UPDATE applications SET current_stage_id = ? WHERE id = ?',
                [firstStageId, appId]
            );
        }

        await conn.commit();

        // Fetch the newly created application
        const [newApp] = await conn.query(
            `SELECT a.*, s.stage_name AS current_stage_name
       FROM applications a
       LEFT JOIN stages s ON a.current_stage_id = s.id
       WHERE a.id = ?`,
            [appId]
        );

        return sendSuccess(res, 201, 'Application created', newApp[0]);
    } catch (err) {
        await conn.rollback();
        next(err);
    } finally {
        conn.release();
    }
};

// ── PUT /api/applications/:id ─────────────────────────────────────────
export const updateApplication = async (req, res, next) => {
    try {
        const {
            company_name, job_title, location, application_date,
            salary_min, salary_max, job_link, notes, final_result,
        } = req.body;

        // Ensure the application belongs to the current user
        const [existing] = await pool.query(
            'SELECT id FROM applications WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (existing.length === 0) return sendError(res, 404, 'Application not found.');

        await pool.query(
            `UPDATE applications SET
         company_name = ?, job_title = ?, location = ?, application_date = ?,
         salary_min = ?, salary_max = ?, job_link = ?, notes = ?, final_result = ?
       WHERE id = ? AND user_id = ?`,
            [
                company_name, job_title, location || null, application_date,
                salary_min || null, salary_max || null, job_link || null,
                notes || null, final_result || 'pending',
                req.params.id, req.user.id,
            ]
        );

        const [updated] = await pool.query(
            `SELECT a.*, s.stage_name AS current_stage_name
       FROM applications a
       LEFT JOIN stages s ON a.current_stage_id = s.id
       WHERE a.id = ?`,
            [req.params.id]
        );

        return sendSuccess(res, 200, 'Application updated', updated[0]);
    } catch (err) {
        next(err);
    }
};

// ── DELETE /api/applications/:id ──────────────────────────────────────
export const deleteApplication = async (req, res, next) => {
    try {
        const [existing] = await pool.query(
            'SELECT id FROM applications WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (existing.length === 0) return sendError(res, 404, 'Application not found.');

        await pool.query('DELETE FROM applications WHERE id = ?', [req.params.id]);

        return sendSuccess(res, 200, 'Application deleted successfully');
    } catch (err) {
        next(err);
    }
};
