// ============================================================
// Rutas de Clientes
// Código Company - Sistema Integral
// ============================================================

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorize } = require('../middlewares/auth');

// ========================================
// Middleware de validación
// ========================================
const validarCliente = [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('telefono').optional().trim()
];

// ========================================
// Rutas
// ========================================

/**
 * @route GET /api/clientes
 * @desc Listar clientes
 * @access ADMIN, SUPERADMIN
 */
router.get('/', authenticateToken, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
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
});

/**
 * @route GET /api/clientes/:id
 * @desc Obtener cliente por ID
 * @access AUTH
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

/**
 * @route POST /api/clientes
 * @desc Crear cliente
 * @access ADMIN, SUPERADMIN
 */
router.post('/', authenticateToken, authorize('ADMIN', 'SUPERADMIN'), validarCliente, async (req, res) => {
    try {
        const { nombre, empresa, telefono, whatsapp, email, direccion, tipo_cliente, tipo_inmueble, referencia_ubicacion, observaciones } = req.body;

        const result = await db.query(
            `INSERT INTO clientes 
             (nombre, empresa, telefono, whatsapp, email, direccion, tipo_cliente, tipo_inmueble, referencia_ubicacion, observaciones)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [nombre, empresa, telefono, whatsapp, email?.toLowerCase(), direccion, tipo_cliente, tipo_inmueble, referencia_ubicacion, observaciones]
        );

        await db.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, 'CREACION_CLIENTE', 'clientes', result.rows[0].id, JSON.stringify(result.rows[0])]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * @route PUT /api/clientes/:id
 * @desc Actualizar cliente
 * @access ADMIN, SUPERADMIN
 */
router.put('/:id', authenticateToken, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
    try {
        const { nombre, empresa, telefono, whatsapp, email, direccion, tipo_cliente, tipo_inmueble, referencia_ubicacion, observaciones } = req.body;

        const result = await db.query(
            `UPDATE clientes SET 
             nombre = $1, empresa = $2, telefono = $3, whatsapp = $4, email = $5, direccion = $6,
             tipo_cliente = $7, tipo_inmueble = $8, referencia_ubicacion = $9, observaciones = $10
             WHERE id = $11 RETURNING *`,
            [nombre, empresa, telefono, whatsapp, email?.toLowerCase(), direccion, tipo_cliente, tipo_inmueble, referencia_ubicacion, observaciones, req.params.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });

        await db.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, 'MODIFICACION_CLIENTE', 'clientes', req.params.id, JSON.stringify(result.rows[0])]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

/**
 * @route DELETE /api/clientes/:id
 * @desc Eliminar cliente (soft delete)
 * @access SUPERADMIN
 */
router.delete('/:id', authenticateToken, authorize('SUPERADMIN'), async (req, res) => {
    try {
        const result = await db.query('UPDATE clientes SET nombre = nombre || \' (ELIMINADO)\' WHERE id = $1 AND nombre NOT LIKE \'%(ELIMINADO)\' RETURNING id', [req.params.id]);
        // Nota: No se elimina físicamente por política de datos
        res.json({ success: true, message: 'Cliente desactivado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

module.exports = router;