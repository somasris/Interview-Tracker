import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

/**
 * Middleware: runs after express-validator rules.
 * Collects errors and short-circuits the request if any are found.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map(e => e.msg);
        return sendError(res, 422, messages[0], { errors: errors.array() });
    }
    next();
};

export default validate;
