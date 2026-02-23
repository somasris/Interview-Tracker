import pool from '../config/db.js';
import { sendSuccess } from '../utils/response.js';

// ── GET /api/dashboard/stats ─────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Total applications and final_result breakdown
        const [[totals]] = await pool.query(
            `SELECT
         COUNT(*)                                          AS total_applications,
         SUM(final_result = 'offer')                      AS total_offers,
         SUM(final_result = 'rejected')                   AS total_rejections,
         SUM(final_result = 'pending')                    AS total_pending,
         ROUND(
           SUM(final_result = 'offer') / NULLIF(COUNT(*), 0) * 100, 1
         )                                                AS success_rate
       FROM applications
       WHERE user_id = ?`,
            [userId]
        );

        // Monthly application counts for the last 12 months
        const [monthly] = await pool.query(
            `SELECT
         DATE_FORMAT(application_date, '%Y-%m') AS month,
         COUNT(*)                               AS count,
         SUM(final_result = 'offer')            AS offers,
         SUM(final_result = 'rejected')         AS rejections
       FROM applications
       WHERE user_id = ?
         AND application_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(application_date, '%Y-%m')
       ORDER BY month ASC`,
            [userId]
        );

        // Recent applications (last 5)
        const [recent] = await pool.query(
            `SELECT a.id, a.company_name, a.job_title, a.final_result,
              a.application_date, s.stage_name AS current_stage_name
       FROM applications a
       LEFT JOIN stages s ON a.current_stage_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC
       LIMIT 5`,
            [userId]
        );

        // Active pipeline (applications with ongoing stages)
        const [[{ active_pipeline }]] = await pool.query(
            `SELECT COUNT(*) AS active_pipeline
       FROM applications
       WHERE user_id = ? AND final_result = 'pending'`,
            [userId]
        );

        return sendSuccess(res, 200, 'Dashboard stats retrieved', {
            total_applications: Number(totals.total_applications),
            total_offers: Number(totals.total_offers),
            total_rejections: Number(totals.total_rejections),
            total_pending: Number(totals.total_pending),
            success_rate: Number(totals.success_rate) || 0,
            active_pipeline: Number(active_pipeline),
            monthly,
            recent_applications: recent,
        });
    } catch (err) {
        next(err);
    }
};
