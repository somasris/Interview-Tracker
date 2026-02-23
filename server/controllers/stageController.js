import { body } from 'express-validator';
import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

// ── Validation rules ─────────────────────────────────────────────────
export const stageRules = [
    body('stage_name').trim().notEmpty().withMessage('Stage name is required'),
    body('stage_order').optional().isInt({ min: 1 }).withMessage('stage_order must be a positive integer'),
];

export const updateStageRules = [
    body('stage_name').optional().trim().notEmpty().withMessage('Stage name cannot be empty'),
    body('feedback_notes').optional(),
    body('result').optional().isIn(['pending', 'pass', 'fail']).withMessage('result must be pending, pass, or fail'),
];

// ── Helper: verify application belongs to current user ────────────────
const verifyAppOwnership = async (appId, userId) => {
    const [rows] = await pool.query(
        'SELECT id, current_stage_id FROM applications WHERE id = ? AND user_id = ?',
        [appId, userId]
    );
    return rows.length > 0 ? rows[0] : null;
};

// ── GET /api/applications/:id/stages ──────────────────────────────────
export const getStages = async (req, res, next) => {
    try {
        const app = await verifyAppOwnership(req.params.id, req.user.id);
        if (!app) return sendError(res, 404, 'Application not found.');

        const [stages] = await pool.query(
            'SELECT * FROM stages WHERE application_id = ? ORDER BY stage_order ASC',
            [req.params.id]
        );

        return sendSuccess(res, 200, 'Stages retrieved', stages);
    } catch (err) {
        next(err);
    }
};

// ── POST /api/applications/:id/stages ────────────────────────────────
export const addStage = async (req, res, next) => {
    try {
        const app = await verifyAppOwnership(req.params.id, req.user.id);
        if (!app) return sendError(res, 404, 'Application not found.');

        const { stage_name, stage_order, feedback_notes, result = 'pending' } = req.body;

        // Auto-assign order if not provided (append after last)
        let order = stage_order;
        if (!order) {
            const [[{ maxOrder }]] = await pool.query(
                'SELECT MAX(stage_order) AS maxOrder FROM stages WHERE application_id = ?',
                [req.params.id]
            );
            order = (maxOrder || 0) + 1;
        }

        const [result2] = await pool.query(
            `INSERT INTO stages (application_id, stage_name, stage_order, feedback_notes, result)
       VALUES (?, ?, ?, ?, ?)`,
            [req.params.id, stage_name, order, feedback_notes || null, result]
        );

        // If this is the very first stage, set it as current
        if (!app.current_stage_id) {
            await pool.query(
                'UPDATE applications SET current_stage_id = ? WHERE id = ?',
                [result2.insertId, req.params.id]
            );
        }

        const [newStage] = await pool.query('SELECT * FROM stages WHERE id = ?', [result2.insertId]);
        return sendSuccess(res, 201, 'Stage added', newStage[0]);
    } catch (err) {
        next(err);
    }
};

// ── PUT /api/stages/:id ───────────────────────────────────────────────
export const updateStage = async (req, res, next) => {
    try {
        // Ensure the stage belongs to one of the current user's applications
        const [rows] = await pool.query(
            `SELECT s.* FROM stages s
       JOIN applications a ON s.application_id = a.id
       WHERE s.id = ? AND a.user_id = ?`,
            [req.params.id, req.user.id]
        );
        if (rows.length === 0) return sendError(res, 404, 'Stage not found.');

        const stage = rows[0];
        const {
            stage_name = stage.stage_name,
            stage_order = stage.stage_order,
            feedback_notes = stage.feedback_notes,
            result = stage.result,
        } = req.body;

        await pool.query(
            `UPDATE stages SET stage_name = ?, stage_order = ?, feedback_notes = ?, result = ?
       WHERE id = ?`,
            [stage_name, stage_order, feedback_notes, result, req.params.id]
        );

        const [updated] = await pool.query('SELECT * FROM stages WHERE id = ?', [req.params.id]);
        return sendSuccess(res, 200, 'Stage updated', updated[0]);
    } catch (err) {
        next(err);
    }
};

// ── PATCH /api/stages/:id/complete ───────────────────────────────────
export const completeStage = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT s.*, a.user_id, a.id AS app_id FROM stages s
       JOIN applications a ON s.application_id = a.id
       WHERE s.id = ? AND a.user_id = ?`,
            [req.params.id, req.user.id]
        );
        if (rows.length === 0) return sendError(res, 404, 'Stage not found.');

        const { result = 'pass', feedback_notes } = req.body;

        await pool.query(
            `UPDATE stages SET is_completed = 1, completed_at = NOW(), result = ?, feedback_notes = ?
       WHERE id = ?`,
            [result, feedback_notes || null, req.params.id]
        );

        const [updated] = await pool.query('SELECT * FROM stages WHERE id = ?', [req.params.id]);
        return sendSuccess(res, 200, 'Stage marked as completed', updated[0]);
    } catch (err) {
        next(err);
    }
};

// ── PATCH /api/applications/:id/move-next ────────────────────────────
export const moveToNextStage = async (req, res, next) => {
    try {
        const app = await verifyAppOwnership(req.params.id, req.user.id);
        if (!app) return sendError(res, 404, 'Application not found.');

        if (!app.current_stage_id) {
            return sendError(res, 400, 'This application has no stages defined.');
        }

        // Get current stage's order
        const [[currentStage]] = await pool.query(
            'SELECT stage_order FROM stages WHERE id = ?',
            [app.current_stage_id]
        );

        // Find the next stage
        const [nextStages] = await pool.query(
            `SELECT id FROM stages
       WHERE application_id = ? AND stage_order > ? AND is_completed = 0
       ORDER BY stage_order ASC LIMIT 1`,
            [req.params.id, currentStage.stage_order]
        );

        if (nextStages.length === 0) {
            return sendError(res, 400, 'No more stages. This is the final stage.');
        }

        const nextStageId = nextStages[0].id;
        await pool.query(
            'UPDATE applications SET current_stage_id = ? WHERE id = ?',
            [nextStageId, req.params.id]
        );

        const [[nextStage]] = await pool.query('SELECT * FROM stages WHERE id = ?', [nextStageId]);
        return sendSuccess(res, 200, 'Moved to next stage', { current_stage: nextStage });
    } catch (err) {
        next(err);
    }
};

// ── DELETE /api/stages/:id ────────────────────────────────────────────
export const deleteStage = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT s.*, a.user_id, a.current_stage_id FROM stages s
       JOIN applications a ON s.application_id = a.id
       WHERE s.id = ? AND a.user_id = ?`,
            [req.params.id, req.user.id]
        );
        if (rows.length === 0) return sendError(res, 404, 'Stage not found.');

        const stage = rows[0];

        // If deleting the current stage, reassign current_stage_id
        if (stage.current_stage_id === stage.id) {
            const [sibling] = await pool.query(
                `SELECT id FROM stages WHERE application_id = ? AND id != ? ORDER BY stage_order ASC LIMIT 1`,
                [stage.application_id, stage.id]
            );
            const newCurrentId = sibling.length > 0 ? sibling[0].id : null;
            await pool.query(
                'UPDATE applications SET current_stage_id = ? WHERE id = ?',
                [newCurrentId, stage.application_id]
            );
        }

        await pool.query('DELETE FROM stages WHERE id = ?', [req.params.id]);
        return sendSuccess(res, 200, 'Stage deleted');
    } catch (err) {
        next(err);
    }
};
