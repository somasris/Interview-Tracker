import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';

/**
 * Middleware: verifies the JWT token from Authorization header.
 * Attaches decoded user payload to req.user on success.
 */
const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 401, 'No token provided. Access denied.');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, email, name }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return sendError(res, 401, 'Token has expired. Please log in again.');
        }
        return sendError(res, 401, 'Invalid token. Access denied.');
    }
};

export default auth;
