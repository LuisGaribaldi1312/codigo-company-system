// ============================================================
// Aplicación Principal - API REST
// Código Company - Sistema Integral
// ============================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================
// MIDDLEWARES DE SEGURIDAD
// ============================================================

// Helmet - Configuración de headers de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"]
        }
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// CORS - Configuración segura
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Rate Limiting global
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // límite de solicitudes
    message: {
        success: false,
        message: 'Demasiadas solicitudes, por favor intente nuevamente en unos minutos'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Rate limiting específico para login (protección contra fuerza bruta)
const loginLimiter = rateLimit({
    windowMs: 60000, // 1 minuto
    max: 5, // 5 intentos por minuto
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Por favor espere un minuto.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Body parser - límite de tamaño
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

// Registro de solicitudes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================================
// RUTAS
// ============================================================

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const clientesRoutes = require('./routes/clientes.routes');
const serviciosRoutes = require('./routes/servicios.routes');
const tecnicosRoutes = require('./routes/tecnicos.routes');
const evidenciasRoutes = require('./routes/evidencias.routes');

// Rutas base
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Código Company - Sistema Integral de Gestión Ambiental y Control de Plagas',
        version: 'v0.1.0',
        endpoints: {
            auth: '/api/auth',
            clientes: '/api/clientes',
            servicios: '/api/servicios',
            tecnicos: '/api/tecnicos',
            evidencias: '/api/evidencias'
        }
    });
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/tecnicos', tecnicosRoutes);
app.use('/api/evidencias', evidenciasRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============================================================
// MANEJO DE ERRORES
// ============================================================

// 404 - Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado'
    });
});

// Manejo de errores general
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // No revelar detalles internos en producción
    const isDevelopment = NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        success: false,
        message: isDevelopment ? err.message : 'Error interno del servidor',
        ...(isDevelopment && { stack: err.stack })
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, () => {
    console.log(`
===============================================
  🚀 Código Company API Server
===============================================
  Environment:   ${NODE_ENV}
  Port:          ${PORT}
  Database:      ${process.env.DB_NAME || 'codigo_company'}
  Status:        Running
===============================================
    `);
});

module.exports = app;