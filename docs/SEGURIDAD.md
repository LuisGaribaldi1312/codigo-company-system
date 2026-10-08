# 🔒 Documentación de Seguridad

> **Código Company - Sistema Integral de Gestión Ambiental y Control de Plagas**

---

## 📋 Principios de Seguridad

1. **Security by Design** - Seguridad desde el diseño
2. **Defensa en Profundidad** - Múltiples capas de protección
3. **Principio de Menor Privilegio** - Acceso mínimo necesario
4. **Validación de Entradas** - Nunca confiar en datos del usuario
5. **Secrets Management** - Variables de entorno, nunca en código

---

## 🔐 Autenticación

### JWT (JSON Web Tokens)

- **Algoritmo:** HS256
- **Expiración:** 24 horas (access token)
- **Refresh Token:** 7 días
- **Refresh automático:** El frontend puede renovar tokens automáticamente

### Bcrypt

- **Rounds:** 12 (balance entre seguridad y rendimiento)
- **Salt:** Generado automáticamente
- **Almacenamiento:** Solo el hash se guarda en la base de datos

### Password Policy

- Mínimo 8 caracteres
- No se permite el acceso si el usuario está inactivo
- Registro de intentos fallidos

---

## 🛡️ Protección contra Ataques Comunes

### XSS (Cross-Site Scripting)

```javascript
// Helmet configura CSP (Content Security Policy)
// No se permite inline scripts en la web pública
```

**Medidas:**
- ✅ Helmet con CSP
- ✅ Sanitización de inputs con express-validator
- ✅ No se permite `innerHTML` no sanitizado

### CSRF (Cross-Site Request Forgery)

```javascript
// CORS configurado con credenciales
// Token JWT requerido para todas las operaciones
```

**Medidas:**
- ✅ CORS restrictivo en producción
- ✅ JWT en header Authorization
- ✅ SameSite cookies

### SQL Injection

**Medidas:**
- ✅ Queries parametrizadas con `pg`
- ✅ Nunca usar string concatenation para queries
- ✅ Input validation con express-validator

### Rate Limiting

| Recurso | Límite | Ventana |
|---------|--------|---------|
| API general | 100 requests | 15 minutos |
| Login | 5 intentos | 1 minuto |

---

## 🔒 Autorización (RBAC)

### Roles y Permisos

| Rol | Nivel | Permisos |
|-----|-------|----------|
| **SUPERADMIN** | 100 | Todo acceso, configuración global |
| **ADMIN** | 80 | CRUD clientes, servicios, técnicos, reportes |
| **SUPERVISOR** | 60 | Ver asignaciones, KPIs por zona |
| **TECNICO** | 40 | Solo servicios asignados, evidencias propias |

### Middleware de Autorización

```javascript
// Verificar rol
authorize('ADMIN', 'SUPERADMIN')

// Verificar permiso específico
checkPermission('servicios', 'all')
```

---

## 🔒 Seguridad de la Base de Datos

### Privilegios
- Usuario de aplicación con permisos mínimos
- No se elimina físicamente (soft delete con estado)
- Hash de contraseñas (nunca texto plano)

### Cifrado
- **En reposo:** PostgreSQL con SSL/TSL
- **En tránsito:** HTTPS/TLS para todas las conexiones
- **Storage:** Supabase Storage con acceso restringido

### Auditoría
- Todas las operaciones críticas se registran
- Log de logins (exitosos y fallidos)
- Log de auditoría para cambios de datos

---

## 🔐 Seguridad de la Aplicación Móvil (AppSheet)

### Tokens
- Almacenados en Keychain (iOS) / Keystore (Android)
- Expiración corta de tokens
- Refresh automático

### Datos Sensibles
- Fotos comprimidas antes de enviar (<=1MB)
- Cifrado local en dispositivo
- Borrado seguro al cerrar sesión

### Offline
- Cifrado local de datos
- Expiración de tokens
- Limpieza segura de datos sensibles

---

## ⚠️ Variables de Entorno

### Variables Requeridas

```bash
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=codigo_company
DB_USER=postgres
DB_PASSWORD=

# JWT
JWT_SECRET=clave_secreta_muy_fuerte
JWT_EXPIRES_IN=24h

# Servidor
PORT=3000
NODE_ENV=production

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

### Best Practices

- ✅ Nunca commitejar archivos `.env`
- ✅ Usar secrets management en producción
- ✅ Rotar claves JWT cada 6 meses
- ✅ Nunca exponer secretos en logs

---

## 🔍 Monitoreo y Logging

### Logs Registrados
- ✅ Solicitudes HTTP
- ✅ Errores del servidor
- ✅ Intentos de login fallidos
- ✅ Cambios de estado de servicios
- ✅ Sincronizaciones

### No se Registran
- ❌ Contraseñas
- ❌ Tokens
- ❌ Datos personales sensibles

---

## 🛠️ Headers de Seguridad (Helmet)

| Header | Valor |
|--------|-------|
| Content-Security-Policy | Restringe fuentes de contenido |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Strict-Transport-Security | max-age=31536000; includeSubDomains |
| Referrer-Policy | strict-origin-when-cross-origin |

---

## 📋 Checklist de Seguridad

| # | Item | ✓ Completado |
|---|------|-------------|
| 1 | HTTPS en producción | ✅ |
| 2 | JWT con expiración | ✅ |
| 3 | Bcrypt para passwords | ✅ |
| 4 | Rate limiting | ✅ |
| 5 | Helmet security headers | ✅ |
| 6 | CORS configurado | ✅ |
| 7 | Input validation | ✅ |
| 8 | Queries parametrizadas | ✅ |
| 9 | Variables de entorno | ✅ |
| 10 | Auditoría de accesos | ✅ |
| 11 | Soft delete | ✅ |
| 12 | No logs de datos sensibles | ✅ |
| 13 | Token revocation | ✅ |
| 14 | Password policy (mín. 8 chars) | ✅ |
| 15 | Refresh token rotation | ✅ |