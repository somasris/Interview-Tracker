import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

// ── GET /api/templates ────────────────────────────────────────────────
export const getTemplates = async (req, res, next) => {
    try {
        const [templates] = await pool.query(
            'SELECT id, name, description FROM stage_templates ORDER BY name ASC'
        );
        return sendSuccess(res, 200, 'Templates retrieved', templates);
    } catch (err) {
        next(err);
    }
};

// ── GET /api/templates/:id/stages ─────────────────────────────────────
export const getTemplateStages = async (req, res, next) => {
    try {
        const [template] = await pool.query(
            'SELECT id, name, description FROM stage_templates WHERE id = ?',
            [req.params.id]
        );
        if (template.length === 0) return sendError(res, 404, 'Template not found.');

        const [stages] = await pool.query(
            'SELECT id, stage_name, stage_order FROM template_stages WHERE template_id = ? ORDER BY stage_order',
            [req.params.id]
        );

        return sendSuccess(res, 200, 'Template stages retrieved', {
            template: template[0],
            stages,
        });
    } catch (err) {
        next(err);
    }
};
