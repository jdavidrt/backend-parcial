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
        console.log('✅ Connected to PostgreSQL database successfully');

        // Test query
        const result = await client.query('SELECT NOW()');
        console.log('🕒 Database time:', result.rows[0].now);

        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
}

// Execute query with error handling
async function executeQuery(text, params = []) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log("🔍 Query executed in ms");
        return result;
    } catch (error) {
        console.error('❌ Query execution failed:', error.message);
        throw error;
    }
}

module.exports = {
    pool,
    connectDatabase,
    executeQuery
};
