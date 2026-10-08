// ============================================================
// Rutas de Evidencias
// Código Company - Sistema Integral
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorize } = require('../middlewares/auth');

/**
 * @route GET /api/evidencias
 * @desc Listar evidencias (filtradas)
 * @access AUTH
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { servicio_id } = req.query;
        let query = `SELECT e.*, s.titulo as servicio_titulo, 
                            c.nombre as cliente_nombre, t.nombre as tecnico_nombre
                     FROM evidencias e
                     LEFT JOIN servicios s ON e.servicio_id = s.id
                     LEFT JOIN clientes c ON e.cliente_id = c.id
                     LEFT JOIN Tecnicos t ON e.tecnico_id = t.id`;
        const params = [];
        const conditions = [];
        let paramIndex = 1;

        // Si es técnico, solo ve sus evidencias
        if (req.user.rol === 'TECNICO') {
            const tecnico = await db.query('SELECT id FROM Tecnicos WHERE usuario_id = $1', [req.user.id]);
            if (tecnico.rows.length > 0) {
                conditions.push(`e.tecnico_id = $${paramIndex++}`);
                params.push(tecnico.rows[0].id);
            } else {
                return res.json({ success: true, data: [] });
            }
        }


/**
 * @route GET /api/evidencias/:id
 * @desc Obtener evidencia por ID
 * @access AUTH (con control de acceso)
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT e.*, s.titulo as servicio_titulo, 
                    c.nombre as cliente_nombre, t.nombre as tecnico_nombre
             FROM evidencias e
             LEFT JOIN servicios s ON e.servicio_id = s.id
             LEFT JOIN clientes c ON e.cliente_id = c.id
             LEFT JOIN Tecnicos t ON e.tecnico_id = t.id
             WHERE e.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Evidencia no encontrada' });

        const evidencia = result.rows[0];

        // Si es técnico, solo ve sus evidencias
        if (req.user.rol === 'TECNICO') {
            const tecnico = await db.query('SELECT id FROM Tecnicos WHERE usuario_id = $1', [req.user.id]);
            if (tecnico.rows.length > 0 && evidencia.tecnico_id != tecnico.rows[0].id) {
                return res.status(403).json({ success: false, message: 'No tienes permiso' });
            }
        }

        res.json({ success: true, data: evidencia });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

/**
 * @route POST /api/evidencias
 * @desc Crear evidencia (registro de foto)
 * @access TECNICO, ADMIN
 */
router.post('/', authenticateToken, authorize('TECNICO', 'ADMIN', 'SUPERADMIN', 'SUPERVISOR'), async (req, res) => {
    try {
        const { servicio_id, foto_url, tipo_evidencia, observaciones, latitud, longitud } = req.body;

        if (!servicio_id || !foto_url || !tipo_evidencia) {
            return res.status(400).json({ success: false, message: 'Datos incompletos: servicio_id, foto_url y tipo_evidencia son requeridos' });
        }

        // Obtener técnico
        let tecnico_id = null;
        if (req.user.rol === 'TECNICO') {
            const tecnico = await db.query('SELECT id FROM Tecnicos WHERE usuario_id = $1', [req.user.id]);
            if (tecnico.rows.length > 0) {
                tecnico_id = tecnico.rows[0].id;
            }
        } else {
            tecnico_id = req.body.tecnico_id;
        }

        // Obtener cliente del servicio
        const servicio = await db.query('SELECT cliente_id FROM servicios WHERE id = $1', [servicio_id]);
        const cliente_id = servicio.rows[0]?.cliente_id || null;

        const result = await db.query(
            `INSERT INTO evidencias 
             (servicio_id, tecnico_id, cliente_id, foto_url, tipo_evidencia, 
              fecha, hora, latitud, longitud, observaciones, estado_sincronizacion)
             VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_TIME, $6, $7, $8, $9)
             RETURNING *`,
            [servicio_id, tecnico_id, cliente_id, foto_url, tipo_evidencia, latitud, longitud, observaciones, 'pendiente']
        );

        // Registrar en auditoría
        await db.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id) VALUES ($1, $2, $3, $4)',
            [req.user.id, 'CREACION_EVIDENCIA', 'evidencias', result.rows[0].id]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

/**
 * @route GET /api/evidencias/servicio/:servicioId
 * @desc Obtener todas las evidencias de un servicio
 * @access AUTH
 */
router.get('/servicio/:servicioId', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT e.* FROM evidencias e WHERE e.servicio_id = $1 ORDER BY e.creado_en',
            [req.params.servicioId]
        );

        // Verificar permisos
        if (req.user.rol === 'TECNICO') {
            const tecnico = await db.query('SELECT id FROM Tecnicos WHERE usuario_id = $1', [req.user.id]);
            const servicio = await db.query('SELECT tecnico_id FROM servicios WHERE id = $1', [req.params.servicioId]);
            
            if (tecnico.rows.length > 0 && servicio.rows.length > 0) {
                if (servicio.rows[0].tecnico_id != tecnico.rows[0].id) {
                    return res.status(403).json({ success: false, message: 'No tienes permiso' });
                }
            }
        }

        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

module.exports = router;