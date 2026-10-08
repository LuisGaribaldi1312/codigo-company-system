// ============================================================
// Middleware de Autenticación
// Código Company - Sistema Integral
// ============================================================

const { verifyToken } = require('../config/jwt');
const db = require('../config/database');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        // Verificar token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        // Verificar que el token sea de acceso (no refresh)
        if (decoded.type !== 'access') {
            return res.status(403).json({
                success: false,
                message: 'Tipo de token inválido'
            });
        }

        // Obtener usuario de la base de datos
        const userResult = await db.query(
            'SELECT id, nombre, email, rol_id FROM usuarios WHERE id = $1 AND estado = $2',
            [decoded.userId, 'activo']
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }

        // Agregar usuario a la solicitud
        req.user = {
            id: userResult.rows[0].id,
            nombre: userResult.rows[0].nombre,
            email: userResult.rows[0].email,
            rol_id: userResult.rows[0].rol_id,
            rol: decoded.rol
        };

        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Middleware para verificar rol
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        // Si el rol del usuario está en la lista de roles permitidos
        if (allowedRoles.includes(req.user.rol)) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso'
            });
        }
    };
};

// Middleware para verificar permisos específicos
const checkPermission = (modulo, accion) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado'
                });
            }

            // Obtener permisos del rol
            const roleResult = await db.query(
                'SELECT permisos FROM roles WHERE id = $1',
                [req.user.rol_id]
            );

            if (roleResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            const permisos = roleResult.rows[0].permisos;

            // Verificar si el rol tiene acceso a todo
            if (permisos.all === true) {
                return next();
            }

            // Verificar permiso específico
            if (permisos[modulo] && (permisos[modulo] === 'all' || permisos[modulo] === accion)) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        } catch (error) {
            console.error('Error en verificación de permisos:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
};

module.exports = {
    authenticateToken,
    authorize,
    checkPermission
};