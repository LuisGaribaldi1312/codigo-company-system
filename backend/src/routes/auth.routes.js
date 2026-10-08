// ============================================================
// Rutas de Autenticación
// Código Company - Sistema Integral
// ============================================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth');

// ========================================
// Middleware de validación
// ========================================

// Validación para registro
const validarRegistro = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede excedar 100 caracteres'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('El email es requerido')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('rol_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de rol inválido')
];

// Validación para login
const validarLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('El email es requerido')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
];

// Validación para cambio de contraseña
const validarChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    body('newPassword')
        .notEmpty()
        .withMessage('La nueva contraseña es requerida')
        .isLength({ min: 8 })
        .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
];

// Validación para recuperación
const validarRecovery = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('El email es requerido')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail()
];

// ========================================
// Rutas públicas
// ========================================

/**
 * @route POST /api/auth/register
 * @desc Registrar nuevo usuario
 * @access SUPERADMIN, ADMIN
 */
router.post('/register', validarRegistro, authController.register);

/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión
 * @access Publico
 */
router.post('/login', validarLogin, authController.login);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refrescar token de acceso
 * @access Publico
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route POST /api/auth/forgot-password
 * @desc Solicitar recuperación de contraseña
 * @access Publico
 */
router.post('/forgot-password', validarRecovery, authController.forgotPassword);

/**
 * @route POST /api/auth/reset-password
 * @desc Restablecer contraseña
 * @access Publico
 */
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Token es requerido'),
    body('newPassword').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
], authController.resetPassword);

// ========================================
// Rutas protegidas
// ========================================

/**
 * @route GET /api/auth/me
 * @desc Obtener información del usuario autenticado
 * @access Privado
 */
router.get('/me', authenticateToken, authController.getMe);

/**
 * @route POST /api/auth/change-password
 * @desc Cambiar contraseña
 * @access Privado
 */
router.post('/change-password', validarChangePassword, authenticateToken, authController.changePassword);

/**
 * @route POST /api/auth/logout
 * @desc Cerrar sesión
 * @access Privado
 */
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;