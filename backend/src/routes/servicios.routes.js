// ============================================================
// Rutas de Servicios
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
 * @route GET /api/servicios
 * @desc Listar servicios
 * @access AUTH (filtrado por rol)
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        let result;
        
        if (req.user.rol === 'TECNICO') {
            const tecnico = await db.query('SELECT id FROM Tecnicos WHERE usuario_id = $1', [req.user.id]);
            if (tecnico.rows.length > 0) {
                result = await db.query(
                    `SELECT s.*, c.nombre as cliente_nombre, c.empresa, t.nombre as tecnico_nombre, 
                            ts.nombre as tipo_servicio, p.nombre as plaga_nombre
                     FROM servicios s
                     LEFT JOIN clientes c ON s.cliente_id = c.id
                     LEFT JOIN Tecnicos t ON s.tecnico_id = t.id
                     LEFT JOIN tipos_servicio ts ON s.tipo_servicio_id = ts.id
                     LEFT JOIN plagas p ON s.plaga_id = p.id
                     WHERE s.tecnico_id = $1 ORDER BY s.fecha DESC`,
                    [tecnico.rows[0].id]
                );
            } else {
                result = { rows: [] };
            }
        } else {

/**
 * @route GET /api/servicios/:id
 * @desc Obtener servicio por ID
 * @access AUTH
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT s.*, c.nombre as cliente_nombre, c.empresa, c.telefono, c.whatsapp, c.direccion,
                    t.nombre as tecnico_nombre, t.telefono as tecnico_telefono,
                    ts.nombre as tipo_servicio, p.nombre as plaga_nombre, p.descripcion as plaga_descripcion
             FROM servicios s
             LEFT JOIN clientes c ON s.cliente_id = c.id
             LEFT JOIN Tecnicos t ON s.tecnico_id = t.id
             LEFT JOIN tipos_servicio ts ON s.tipo_servicio_id = ts.id
             LEFT JOIN plagas p ON s.plaga_id = p.id
             WHERE s.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Servicio no encontrado' });

        const servicio = result.rows[0];

        // Verificar que el técnico solo vea sus servicios
        if (req.user.rol === 'TECNICO') {
            const tecnico = await db.query('SELECT id FROM Tecnicos WHERE usuario_id = $1', [req.user.id]);
            if (tecnico.rows.length > 0 && servicio.tecnico_id != tecnico.rows[0].id) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para ver este servicio' });
            }
        }

        res.json({ success: true, data: servicio });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

/**
 * @route POST /api/servicios
 * @desc Crear servicio
 * @access ADMIN, SUPERADMIN
 */
router.post('/', authenticateToken, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
    try {
        const { cliente_id, tecnico_id, tipo_servicio_id, plaga_id, titulo, direccion, 
                telefono_contacto, fecha, hora, area, instrucciones, observaciones, prioridad } = req.body;

        const result = await db.query(
            `INSERT INTO servicios 
             (cliente_id, tecnico_id, tipo_servicio_id, plaga_id, titulo, direccion, telefono_contacto, 
              fecha, hora, area, instrucciones, observaciones, prioridad, estado)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             RETURNING *`,
            [cliente_id, tecnico_id, tipo_servicio_id, plaga_id, titulo, direccion, telefono_contacto, 
             fecha, hora, area, instrucciones, observaciones, prioridad || 'normal', 'programado']
        );

        await db.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, 'CREACION_SERVICIO', 'servicios', result.rows[0].id, JSON.stringify({ cliente_id, tecnico_id, estado: 'programado' })]
        );


/**
 * @route PUT /api/servicios/:id/estado
 * @desc Actualizar estado de servicio
 * @access AUTH
 */
router.put('/:id/estado', authenticateToken, async (req, res) => {
    try {
        const { estado, observaciones } = req.body;

        const allowedEstados = ['programado', 'asignado', 'confirmado', 'en_camino', 'en_sitio', 
                                 'en_proceso', 'pendiente', 'finalizado', 'cancelado', 'reprogramado', 'cerrado'];
        
        if (!allowedEstados.includes(estado)) {
            return res.status(400).json({ success: false, message: 'Estado inválido' });
        }

        const servicioActual = await db.query('SELECT * FROM servicios WHERE id = $1', [req.params.id]);
        if (servicioActual.rows.length === 0) return res.status(404).json({ success: false, message: 'Servicio no encontrado' });

        const servicio = servicioActual.rows[0];

        // Verificar permisos
        if (req.user.rol === 'TECNICO') {
            const tecnico = await db.query('SELECT id FROM Tecnicos WHERE usuario_id = $1', [req.user.id]);
            if (tecnico.rows.length > 0 && servicio.tecnico_id != tecnico.rows[0].id) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para modificar este servicio' });
            }
        }

        const result = await db.query(
            'UPDATE servicios SET estado = $1, modificado_en = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [estado, req.params.id]
        );

        // Registrar historial
        await db.query(
            'INSERT INTO historial_servicio (servicio_id, estado_anterior, estado_nuevo, usuario_id, observacion) VALUES ($1, $2, $3, $4, $5)',
            [req.params.id, servicio.estado, estado, req.user.id, observaciones]
        );

        await db.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id) VALUES ($1, $2, $3, $4)',
            [req.user.id, 'CAMBIO_ESTADO_SERVICIO', 'servicios', req.params.id]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

/**
 * @route PUT /api/servicios/:id/assign
 * @desc Asignar técnico a servicio
 * @access ADMIN, SUPERADMIN
 */
router.put('/:id/assign', authenticateToken, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
    try {
        const { tecnico_id } = req.body;

        const result = await db.query(
            'UPDATE servicios SET tecnico_id = $1, estado = $2 WHERE id = $3 RETURNING *',
            [tecnico_id, 'asignado', req.params.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Servicio no encontrado' });

        await db.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, 'ASIGNACION_SERVICIO', 'servicios', req.params.id, JSON.stringify({ tecnico_id })]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

module.exports = router;
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});
            result = await db.query(
                `SELECT s.*, c.nombre as cliente_nombre, c.empresa, t.nombre as tecnico_nombre,
                        ts.nombre as tipo_servicio, p.nombre as plaga_nombre
                 FROM servicios s
                 LEFT JOIN clientes c ON s.cliente_id = c.id
                 LEFT JOIN Tecnicos t ON s.tecnico_id = t.id
                 LEFT JOIN tipos_servicio ts ON s.tipo_servicio_id = ts.id
                 LEFT JOIN plagas p ON s.plaga_id = p.id
                 ORDER BY s.fecha DESC, s.hora DESC`
            );
        }

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});