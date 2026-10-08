// ============================================================
// Controlador de Clientes
// Código Company - Sistema Integral
// ============================================================

const db = require('../config/database');

// ========================================
// Listar clientes
// ========================================
const listarClientes = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, nombre, empresa, telefono, whatsapp, email, direccion, 
                    tipo_cliente, tipo_inmueble, proximo_servicio, creado_en
             FROM clientes 
             ORDER BY creado_en DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// ========================================
// Obtener cliente por ID
// ========================================
const obtenerCliente = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
};

// ========================================
// Crear cliente
// ========================================
const crearCliente = async (req, res) => {
    try {
        const { nombre, empresa, telefono, whatsapp, email, direccion, 
                tipo_cliente, tipo_inmueble, referencia_ubicacion, observaciones } = req.body;

        const result = await db.query(
            `INSERT INTO clientes 
             (nombre, empresa, telefono, whatsapp, email, direccion, tipo_cliente, tipo_inmueble, referencia_ubicacion, observaciones)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [nombre, empresa, telefono, whatsapp, email?.toLowerCase(), direccion, tipo_cliente, tipo_inmueble, referencia_ubicacion, observaciones]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
};

// ========================================
// Actualizar cliente
// ========================================
const actualizarCliente = async (req, res) => {
    try {
        const { nombre, empresa, telefono, whatsapp, email, direccion, 
                tipo_cliente, tipo_inmueble, referencia_ubicacion, observaciones } = req.body;

        const result = await db.query(
            `UPDATE clientes SET 
             nombre = $1, empresa = $2, telefono = $3, whatsapp = $4, email = $5, direccion = $6,
             tipo_cliente = $7, tipo_inmueble = $8, referencia_ubicacion = $9, observaciones = $10
             WHERE id = $11 RETURNING *`,
            [nombre, empresa, telefono, whatsapp, email?.toLowerCase(), direccion, tipo_cliente, tipo_inmueble, referencia_ubicacion, observaciones, req.params.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
};

// ========================================
// Eliminar cliente (soft delete)
// ========================================
const eliminarCliente = async (req, res) => {
    try {
        await db.query(
            "UPDATE clientes SET nombre = nombre || ' (ELIMINADO)' WHERE id = $1 AND nombre NOT LIKE '%(ELIMINADO)%'",
            [req.params.id]
        );
        res.json({ success: true, message: 'Cliente desactivado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
};

module.exports = {
    listarClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};