// ============================================================
// Rutas de Técnicos
// Código Company - Sistema Integral
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorize } = require('../middlewares/auth');

// ========================================
// Rutas
// ========================================

/**
 * @route GET /api/tecnicos
 * @desc Listar técnicos
 * @access ADMIN, SUPERADMIN, SUPERVISOR
 */
router.get('/', authenticateToken, authorize('ADMIN', 'SUPERADMIN', 'SUPERVISOR'), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT t.*, u.nombre as usuario_nombre, u.email as usuario_email, 
             r.nombre as rol_nombre
             FROM Tecnicos t
             LEFT JOIN usuarios u ON t.usuario_id = u.id
             LEFT JOIN roles r ON u.rol_id = r.id
             ORDER BY t.nombre`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

/**
 * @route GET /api/tecnicos/:id
 * @desc Obtener técnico por ID
 * @access AUTH
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT t.*, u.nombre as usuario_nombre, u.email as usuario_email
             FROM Tecnicos t
             LEFT JOIN usuarios u ON t.usuario_id = u.id
             WHERE t.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Técnico no encontrado' });

        // Si es técnico, solo puede verse a sí mismo
        if (req.user.rol === 'TECNICO') {
            if (result.rows[0].usuario_id !== req.user.id) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para ver este técnico' });
            }
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

/**
 * @route POST /api/tecnicos
 * @desc Crear técnico
 * @access ADMIN, SUPERADMIN
 */
router.post('/', authenticateToken, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
    try {
        const { nombre, telefono, email, zona, especialidades, usuario_id, app_sheet_user_id } = req.body;

        const result = await db.query(
            `INSERT INTO Tecnicos 
             (nombre, telefono, email, zona, especialidades, usuario_id, app_sheet_user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [nombre, telefono, email?.toLowerCase(), zona, especialidades, usuario_id, app_sheet_user_id]
        );

        await db.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, 'CREACION_TECNICO', 'Tecnicos', result.rows[0].id, JSON.stringify(result.rows[0])]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

/**
 * @route GET /api/tecnicos/mis-servicios
 * @desc Obtener servicios del técnico autenticado
 * @access TECNICO
 */
router.get('/mis-servicios', authenticateToken, authorize('TECNICO'), async (req, res) => {
    try {
        const tecnico = await db.query('SELECT id FROM Tecnicos WHERE usuario_id = $1', [req.user.id]);
        
        if (tecnico.rows.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const result = await db.query(
            `SELECT s.*, c.nombre as cliente_nombre, c.direccion, c.telefono, c.whatsapp,
                    ts.nombre as tipo_servicio, p.nombre as plaga_nombre
             FROM servicios s
             LEFT JOIN clientes c ON s.cliente_id = c.id
             LEFT JOIN tipos_servicio ts ON s.tipo_servicio_id = ts.id
             LEFT JOIN plagas p ON s.plaga_id = p.id
             WHERE s.tecnico_id = $1 AND s.estado IN ('programado', 'asignado', 'confirmado', 'en_camino', 'en_sitio', 'en_proceso', 'pendiente')
             ORDER BY s.fecha, s.hora`,
            [tecnico.rows[0].id]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

module.exports = router;