const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER || 'neondb_owner',
    password: process.env.DB_PASSWORD || 'npg_e4WPqoNbdC2s',
    host: process.env.DB_HOST || 'ep-lively-firefly-a2bmasqy.eu-central-1.aws.neon.tech',
    database: process.env.DB_NAME || 'neondb',
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error if connection takes longer than 2 seconds
});

// Test database connection
async function connectDatabase() {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database successfully');

        // Test query
        const result = await client.query('SELECT NOW()');
        console.log('Database time:', result.rows[0].now);

        // Ensure transactions table exists
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS transactions (
                TransactionId VARCHAR(255) PRIMARY KEY,
                Cedula VARCHAR(255) NOT NULL,
                Estado_trans VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                Precio_total DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await client.query(createTableQuery);
        console.log('Database schema verified successfully');

        client.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
}

// Execute query with error handling
async function executeQuery(text, params = []) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`Query executed in ${duration}ms`);

        // Log query details in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Query:', text.replace(/\s+/g, ' ').trim());
            if (params.length > 0) {
                console.log('Parameters:', params);
            }
        }

        return result;
    } catch (error) {
        const duration = Date.now() - start;
        console.error(`Query execution failed after ${duration}ms:`, error.message);
        console.error('Failed query:', text.replace(/\s+/g, ' ').trim());
        if (params.length > 0) {
            console.error('Query parameters:', params);
        }
        throw error;
    }
}

// Get pool status
function getPoolStatus() {
    return {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
    };
}

module.exports = {
    pool,
    connectDatabase,
    executeQuery,
    getPoolStatus
};