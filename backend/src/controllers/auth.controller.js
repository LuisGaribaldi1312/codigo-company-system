// ============================================================
// Controlador de Autenticación
// Código Company - Sistema Integral
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateTokens, verifyToken } = require('../config/jwt');

const saltRounds = 12;

// ============================================================
// Registro de usuario (SUPERADMIN y ADMIN)
// ============================================================
const register = async (req, res) => {
    try {
        const { nombre, email, password, rol_id } = req.body;

        // Validar campos requeridos
        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, email y contraseña son requeridos'
            });
        }

        // Verificar si el email ya existe
        const existingUser = await db.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Crear usuario
        const result = await db.query(
            `INSERT INTO usuarios (nombre, email, password_hash, rol_id, estado) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, nombre, email, rol_id, estado, creado_en`,
            [nombre, email.toLowerCase(), passwordHash, rol_id || 2, 'activo']
        );

        const nuevoUsuario = result.rows[0];

        // Registrar en auditoría
        await db.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos) VALUES ($1, $2, $3, $4, $5)',
            [nuevoUsuario.id, 'CREACION_USUARIO', 'usuarios', nuevoUsuario.id, 
             JSON.stringify({ nombre, email, rol_id })]
        );

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                rol_id: nuevoUsuario.rol_id,
                estado: nuevoUsuario.estado,
                creado_en: nuevoUsuario.creado_en
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// ============================================================
// Inicio de sesión
// ============================================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        const result = await db.query(
            `SELECT u.id, u.nombre, u.email, u.password_hash, u.rol_id, u.estado, r.nombre as rol_nombre
             FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.email = $1`,
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            await db.query(
                'INSERT INTO login_logs (email, ip_origen, user_agent, exito, error_mensaje) VALUES ($1, $2, $3, $4, $5)',
                [email.toLowerCase(), req.ip, req.get('user-agent'), false, 'Usuario no encontrado']
            );
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const usuario = result.rows[0];

        if (usuario.estado !== 'activo') {
            return res.status(401).json({ success: false, message: 'Usuario inactivo o bloqueado' });
        }

        const passwordValid = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValid) {
            await db.query(
                'INSERT INTO login_logs (usuario_id, email, ip_origen, user_agent, exito, error_mensaje) VALUES ($1, $2, $3, $4, $5, $6)',
                [usuario.id, email, req.ip, req.get('user-agent'), false, 'Contraseña incorrecta']
            );
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const { accessToken, refreshToken } = generateTokens(usuario.id, usuario.rol_nombre);

        await db.query(
            'UPDATE usuarios SET token_refresh = $1, token_refresh_expira = $2, ultima_sesion = CURRENT_TIMESTAMP WHERE id = $3',
            [refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), usuario.id]
        );

                res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol_nombre },
                accessToken,
                refreshToken,
                expiresIn: '24h'
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
};

// ============================================================
// Refrescar token
// ============================================================
const refreshTokenCtrl = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) return res.status(401).json({ success: false, message: 'Refresh token requerido' });

        const decoded = verifyToken(token);
        if (!decoded || decoded.type !== 'refresh') {
            return res.status(403).json({ success: false, message: 'Refresh token inválido' });
        }

        const result = await db.query(
            'SELECT u.id, u.email, u.token_refresh_expira, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = $1 AND u.token_refresh = $2',
            [decoded.userId, token]
        );

        if (result.rows.length === 0) return res.status(403).json({ success: false, message: 'Refresh token inválido' });

        const usuario = result.rows[0];
        if (new Date() > new Date(usuario.token_refresh_expira)) {
            return res.status(403).json({ success: false, message: 'Refresh token expirado' });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(usuario.id, usuario.rol_nombre);
        await db.query(
            'UPDATE usuarios SET token_refresh = $1, token_refresh_expira = $2 WHERE id = $3',
            [newRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), usuario.id]
                );

        res.json({ success: true, message: 'Token renovado', data: { accessToken, refreshToken: newRefreshToken, expiresIn: '24h' } });
    } catch (error) {
        console.error('Error en refresh token:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
};

// ============================================================
// Cerrar sesión
// ============================================================
const logout = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (token && req.user) {
            await db.query('UPDATE usuarios SET token_refresh = NULL, token_refresh_expira = NULL WHERE id = $1', [req.user.id]);
        }
        res.json({ success: true, message: 'Sesión cerrada' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
};

// ============================================================
// Ver información del usuario
// ============================================================
const getMe = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT u.id, u.nombre, u.email, r.nombre as rol, u.estado, u.creado_en FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
};

// ============================================================
// Cambiar contraseña
// ============================================================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Contraseñas requeridas' });
        if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Mínimo 8 caracteres' });

        const result = await db.query('SELECT password_hash FROM usuarios WHERE id = $1', [req.user.id]);
        const passwordValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
        if (!passwordValid) return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });

        await db.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(newPassword, saltRounds), req.user.id]);
                res.json({ success: true, message: 'Contraseña actualizada' });
    } catch (error) {
        console.error('Error en changePassword:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
};

// ============================================================
// Recuperación de contraseña
// ============================================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email requerido' });

        const result = await db.query('SELECT id FROM usuarios WHERE email = $1 AND estado = $2', [email.toLowerCase(), 'activo']);
        if (result.rows.length > 0) {
            const resetToken = jwt.sign({ userId: result.rows[0].id, type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            await db.query('UPDATE usuarios SET token_refresh = $1 WHERE id = $2', [resetToken, result.rows[0].id]);
            console.log(`Reset token: ${resetToken}`);
        }
        res.json({ success: true, message: 'Si el email está registrado, recibirá instrucciones' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
};

// ============================================================
// Restablecer contraseña
// ============================================================
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Datos requeridos' });
        if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Mínimo 8 caracteres' });

        const decoded = verifyToken(token);
        if (!decoded || decoded.type !== 'reset') return res.status(403).json({ success: false, message: 'Token inválido' });

        const result = await db.query('SELECT id FROM usuarios WHERE id = $1 AND token_refresh = $2', [decoded.userId, token]);
        if (result.rows.length === 0) return res.status(403).json({ success: false, message: 'Token inválido' });

        await db.query('UPDATE usuarios SET password_hash = $1, token_refresh = NULL WHERE id = $2', [await bcrypt.hash(newPassword, saltRounds), result.rows[0].id]);
        res.json({ success: true, message: 'Contraseña restablecida' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
};

module.exports = {
    register,
    login,
    refreshToken: refreshTokenCtrl,
    logout,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword
};

/* Fin del archivo */
