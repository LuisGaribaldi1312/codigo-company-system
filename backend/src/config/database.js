// ============================================================
// Configuración de la Base de Datos
// Código Company - Sistema Integral
// ============================================================

const { Pool } = require('pg');

// Crear el pool de conexiones
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'codigo_company',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2500, // Return an error after 2.5 seconds if connection could not be established
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// Evento de error en la conexión
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Función para ejecutar queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Función para obtener un cliente dedicado (para transacciones)
const getClient = async () => {
    return await pool.connect();
};

// Exportar funciones
module.exports = {
    query,
    getClient,
    pool
};