/**
 * Global error handling middleware.
 * Must be registered LAST among all middleware/routes.
 */
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled error:', err);

    // MySQL duplicate-entry error
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'A record with this value already exists.',
        });
    }

    // MySQL foreign-key constraint failure
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            message: 'Referenced record does not exist.',
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({ success: false, message });
};

export default errorHandler;
