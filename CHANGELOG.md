# 📝 CHANGELOG

## [v0.1.0] - 2026-10-10

### ✅ Agregado

#### Backend (API RESTful)
- **Servidor Express.js** con configuración de seguridad completa
  - Helmet (headers de seguridad)
  - CORS configurado
  - Rate limiting (100 req/15min global, 5/min para login)
  - Input validation con express-validator
  - Body parser con límite de 10MB
  - Manejo de errores con environment-aware responses

- **Base de Datos (PostgreSQL)**
  - 13 tablas: roles, usuarios, técnicos, clientes, plagas, productos, tipos_servicio, servicios, evidencias, agendas, mensajes, auditoría, sync_logs
  - Índices de rendimiento en campos críticos
  - Triggers para actualización automática de timestamps
  - Datos iniciales: 4 roles, 13 plagas, 6 tipos de servicio, configuraciones base

- **Autenticación**
  - Registro de usuarios con hash Bcrypt (12 rounds)
  - Login con email/password
  - Refresh token (7 días) + Access token (24 horas)
  - Cierre de sesión con revocación de tokens
  - Cambio de contraseña
  - Recuperación de contraseña por email

- **API Endpoints**
  - `/api/auth/*` - Registro, login, logout, refresh, recuperación
  - `/api/clientes/*` - CRUD completo (admin/superadmin)
  - `/api/servicios/*` - CRUD + cambio de estado + asignación técnico
  - `/api/tecnicos/*` - CRUD + mis-servicios (técnico)
  - `/api/evidencias/*` - CRUD + listado por servicio

- **Middleware de Seguridad**
  - Autenticación JWT con verificación de estado
  - Autorización basada en roles (RBAC)
  - Chequeo de permisos por módulo

- **Auditoría**
  - Registro de creación/modificación/eliminación
  - Log de logins (exitosos y fallidos)
  - Log de sincronizaciones

#### Web Pública
- Página principal (index.html)
  - Hero section con call-to-action
  - Sección "Sobre Nosotros"
  - Catálogo de servicios
  - Catálogo de plagas
  - Sección de sectores (residencial, comercial, empresarial)
  - Formulario de cotización
  - Información de contacto con mapa
  - Footer completo con redes sociales

- **Estilos CSS (Vanilla)**
  - Variables CSS con colores corporativos:
    - 70% Blanco crema (#fdf8f0)
    - 15% Negro (#1a1a1a)
    - 15% Verde hoja (#2d8659)
  - Diseño responsive mobile-first
  - Animaciones suaves (hover, scroll)
  - Modo dark automático (prefers-color-scheme)

- **JavaScript (Vanilla)**
  - Navegación móvil con toggle
  - Smooth scroll
  - Highlight de navegación activa
  - WhatsApp integration
  - Formulario de cotización con validación
  - Sistema de notificaciones
  - Carga de configuración dinámica
  - Reveal on Scroll con Intersection Observer

- **Página de Política de Privacidad**
  - Información completa de manejo de datos
  - Derechos del usuario
  - Información de contacto

#### Documentación
- `docs/ARQUITECTURA.md` - Arquitectura del sistema
- `docs/API.md` - Documentación completa de la API
- `docs/BASE_DE_DATOS.md` - Esquema de base de datos
- `docs/SEGURIDAD.md` - Estrategia de seguridad
- `docs/INICIO_RAPIDO.md` - Guía de inicio rápido

#### AppSheet
- `app-sheet/config.md` - Configuración de integración

#### DevOps
- `backend/RAILWAY.md` - Guía de deployment en Railway.app
- `.gitignore` y `.gitattributes` configurados
- Estructura de carpetas modular

### 🎨 Colores Corporativos

| Color | Hex | Uso |
|-------|-----|-----|
| Blanco Crema | `#fdf8f0` | 70% - Fondo principal |
| Crema Claro | `#faf0e6` | Matiz crema |
| Crema Muy Claro | `#fdf0e0` | Matiz claro |
| Negro | `#1a1a1a` | 15% - Texto principal |
| Negro Claro | `#2d2d2d` | Texto secundario |
| Negro Muy Claro | `#404040` | Texto secundario |
| Verde Hoja | `#2d8659` | 15% - Acento principal |
| Verde Claro | `#4caf50` | Acento secundario |
| Verde Muy Claro | `#81c784` | Detalles |
| Verde Pálido | `#c8e6c9` | Bordes/fondos suaves |

### ✅ Verificado

- [x] Todas las dependencias del backend instaladas
- [x] Módulos del backend cargan sin errores
- [x] Schema de base de datos completo y válido
- [x] Rutas de API definidas y documentadas
- [x] Web pública con diseño responsive
- [x] Colores corporativos implementados correctamente
- [x] Documentación completa
- [x] Repository initialized and committed