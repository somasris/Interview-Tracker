import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';

// Route imports
import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';
import stageRoutes from './routes/stages.js';
import templateRoutes from './routes/templates.js';
import dashboardRoutes from './routes/dashboard.js';

// Global error handler
import errorHandler from './middleware/errorHandler.js';

// DB import triggers connection test on startup
import './config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Health check ──────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Interview Tracker API is running 🚀' });
});

// ── 404 handler ───────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

// ── Global error handler (must be last) ───────────────────────────────
app.use(errorHandler);

// ── Cron: reminder notifications (runs every hour) ────────────────────
import pool from './config/db.js';

cron.schedule('0 * * * *', async () => {
    try {
        // Mark reminders as sent if their scheduled time has passed
        const [result] = await pool.query(
            `UPDATE reminders SET is_sent = 1
       WHERE is_sent = 0 AND reminder_date <= NOW()`
        );
        if (result.affectedRows > 0) {
            console.log(`🔔 Cron: Processed ${result.affectedRows} reminder(s)`);
        }
    } catch (err) {
        console.error('Cron error:', err.message);
    }
});

// ── Start server ──────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
