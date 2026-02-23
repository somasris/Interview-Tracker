import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

// ── Validation rules ─────────────────────────────────────────────────
export const registerRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginRules = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

// ── Helpers ──────────────────────────────────────────────────────────
const signToken = (user) =>
    jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

// ── Controllers ──────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check for existing user
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        if (existing.length > 0) {
            return sendError(res, 409, 'An account with this email already exists.');
        }

        // Hash password (10 rounds is the recommended balance of speed vs. security)
        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, password_hash]
        );

        const user = { id: result.insertId, email, name };
        const token = signToken(user);

        return sendSuccess(res, 201, 'Account created successfully', { token, user });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query(
            'SELECT id, name, email, password_hash FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return sendError(res, 401, 'Invalid email or password.');
        }

        const dbUser = rows[0];
        const passwordMatch = await bcrypt.compare(password, dbUser.password_hash);

        if (!passwordMatch) {
            return sendError(res, 401, 'Invalid email or password.');
        }

        const user = { id: dbUser.id, email: dbUser.email, name: dbUser.name };
        const token = signToken(user);

        return sendSuccess(res, 200, 'Logged in successfully', { token, user });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/auth/me  – returns the current authenticated user
 */
export const getMe = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) return sendError(res, 404, 'User not found.');
        return sendSuccess(res, 200, 'User retrieved', rows[0]);
    } catch (err) {
        next(err);
    }
};
