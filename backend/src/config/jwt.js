// ============================================================
// Configuración de JWT
// Código Company - Sistema Integral
// ============================================================

const jwt = require('jsonwebtoken');

// Configuración de tokens
const config = {
    jwtSecret: process.env.JWT_SECRET || 'tu_clave_secreta_jwt_muy_fuerte_aqui_cambiar_en_produccion',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

// Función para generar token de acceso
const generateAccessToken = (userId, rol) => {
    return jwt.sign(
        { 
            userId, 
            rol,
            type: 'access'
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );
};

// Función para generar token de refresh
const generateRefreshToken = (userId, rol) => {
    return jwt.sign(
        { 
            userId, 
            rol,
            type: 'refresh'
        },
        config.jwtSecret,
        { expiresIn: config.jwtRefreshExpiresIn }
    );
};

// Función para verificar token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        return null;
    }
};

// Función para generar ambos tokens
const generateTokens = (userId, rol) => {
    const accessToken = generateAccessToken(userId, rol);
    const refreshToken = generateRefreshToken(userId, rol);
    return { accessToken, refreshToken };
};

module.exports = {
    config,
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    verifyToken
};