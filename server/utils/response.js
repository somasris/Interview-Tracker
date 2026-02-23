/**
 * Standardised API response helpers.
 * Keeps controller code clean and response shapes consistent.
 */

export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
    const payload = { success: true, message };
    if (data !== null) payload.data = data;
    return res.status(statusCode).json(payload);
};

export const sendError = (res, statusCode = 500, message = 'Server Error', extra = null) => {
    const payload = { success: false, message };
    if (extra !== null) Object.assign(payload, extra);
    return res.status(statusCode).json(payload);
};
