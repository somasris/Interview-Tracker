import 'dotenv/config';
import mysql from 'mysql2/promise';

// Create a connection pool for efficient DB access
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'interview_tracker_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
});

// Test the connection at startup
pool.getConnection()
    .then(conn => {
        console.log('✅  MySQL connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('❌  MySQL connection failed:', err.message);
        process.exit(1);
    });

export default pool;
