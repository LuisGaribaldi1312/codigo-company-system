# 🏗️ Arquitectura del Sistema

## 📋 Información del Proyecto

- **Nombre:** Código Company - Sistema Integral
- **Tipo:** Sistema de Gestión Ambiental y Control de Plagas
- **Versión:** v0.1.0
- **Fecha:** Octubre 2026

---

## 🏛️ Arquitectura General

```
Internet
    ↓
[CORS + Rate Limiting] ← Helmet (Headers de seguridad)
    ↓
[JWT Auth Middleware] ← Verifica token de acceso
    ↓
[Role-based Authorization] ← Verifica permisos por rol
    ↓
[Input Validation] ← express-validator sanitiza entradas
    ↓
[Database Query] ← Pool de conexiones + queries parametrizadas
```

### Tecnologías por Capa

| Capa | Componente | Tecnología | Justificación |
|------|-----------|------------|---------------|
| **Frontend Web** | Página pública | HTML5 + CSS3 (Vanilla) + JS | Gratis, rápido, SEO-friendly |
| **Frontend Admin** | Panel | HTML5 + CSS3 (Vanilla) + JS | Consistencia con móvil |
| **Backend** | API RESTful | Node.js + Express.js | Gratis, flexible, comunidad activa |
| **Base de Datos** | PostgreSQL | Supabase (Plan gratuito) | Hasta 500MB |
| **Almacenamiento** | Fotos/Evidencias | Supabase Storage | Integrado con Supabase |
| **Mobile** | App móvil | AppSheet | Obligatorio - genera APK/iOS |
| **Deploy Web** | Hosting | GitHub Pages | CDN global gratis |
| **Deploy API** | Hosting | Railway.app | Créditos gratuitos |

---

## 🔄 Arquitectura Offline-First

### Sincronización con AppSheet

```
AppSheet Mobile (Offline)
    │
    │ [Local Storage]
    │   - Formularios
    │   - Fotos (locales)
    │   - Estado de sincronización
    │
    │ [Network Status]
    │
    │ Con conexión:
    │   → POST /api/evidencias (estado: 'pendiente')
    │   → PATCH /api/servicios/:id/estado
    │   → POST /api/auth/sync (sync masivo)
    │
    ▼
Backend API → PostgreSQL
```

### Estados de Sincronización

| Estado | Descripción |
|--------|-------------|
| `sincronizado` | Datos actualizados en la nube |
| `pendiente` | Cambios locales sin enviar |
| `sincronizando` | En proceso de envío |
| `error` | Fallo en sync, reintento programado |

### Conflictos de Datos

- Timestamps por operación + UUID único
- Prioridad: última modificación válida
- Notificación al administrador ante discrepancias

---

## 🔐 Arquitectura de Seguridad

### Capas de Seguridad

1. **Helmet** - Configuración de headers de seguridad
2. **CORS** - Control de origenes permitidos
3. **Rate Limiting** - Protección contra ataques de fuerza bruta
4. **JWT** - Autenticación basada en tokens
5. **Bcrypt** - Hash de contraseñas (12 rounds)
6. **Input Validation** - Sanitización con express-validator

### Roles y Permisos

| Rol | Nivel | Descripción |
|-----|-------|-------------|
| SUPERADMIN | 100 | Todo acceso, configuración global |
| ADMIN | 80 | CRUD completo de clientes, servicios, técnicos |
| SUPERVISOR | 60 | Ver asignaciones, KPIs por zona |
| TÉCNICO | 40 | Solo servicios asignados, evidencias propias |

---

## 📋 Endpoints Principales

| Categoría | Endpoint | Método | Auth |
|-----------|----------|--------|------|
| Auth | `/api/auth/register` | POST | No |
| Auth | `/api/auth/login` | POST | No |
| Auth | `/api/auth/me` | GET | Sí |
| Clientes | `/api/clientes` | GET, POST | ADMIN, SUPERADMIN |
| Servicios | `/api/servicios` | GET, POST | AUTH |
| Técnicos | `/api/tecnicos` | GET, POST | ADMIN, SUPERADMIN |
| Evidencias | `/api/evidencias` | GET, POST | AUTH |

---

## 📁 Estructura de Archivos

```
codigo-company-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── app.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── web-publica/
│   ├── assets/css/
│   ├── assets/js/
│   ├── assets/images/
│   └── index.html
├── app-sheet/
├── database/
│   ├── schema.sql
│   └── migrations/
├── docs/
└── README.md
```

---

## 🚀 Deployment Strategy

### Backend (Railway.app)
1. Crear cuenta en Railway.app
2. Conectar repositorio de GitHub
3. Configurar variables de entorno
4. Deploy automático en push a `main`

### Web Pública (GitHub Pages)
1. Subir archivos a rama `gh-pages`
2. Configurar en Settings → Pages
3. CDN global automática

### Base de Datos (Supabase)
1. Crear proyecto en Supabase
2. Ejecutar `schema.sql`
3. Configurar Storage para fotos

---

## ⚠️ Consideraciones

### Ventajas
- ✅ 100% gratuito para iniciar
- ✅ Fácil de mantener y escalar
- ✅ Separación clara de responsabilidades
- ✅ API REST estándar
- ✅ Compatibilidad con AppSheet

### Limitaciones
- ❌ Requiere configuración manual de Supabase
- ❌ Necesario crear cuenta en Railway.app
- ❌ La web pública es estática (sin SSR)
| **Auth** | JWT + Bcrypt | jsonwebtoken + bcryptjs | Estándar de la industria |
| **Testing** | Tests | Jest + Supertest | Fácil de usar, gratuito |