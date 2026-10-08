# 📚 API RESTful - Documentación

> **Base URL:** `https://api.codigocompany.com` (o `http://localhost:3000` en desarrollo)

## Autenticación

Todas las peticiones requieren enviar el token JWT en el header:

```
Authorization: Bearer <access_token>
```

El token expira cada 24 horas. Usa `POST /api/auth/refresh-token` para renovarlo.

---

## 📋 Índice de Endpoints

| Método | Endpoint | Auth | Role | Descripción |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | No | - | Registrar usuario |
| POST | `/api/auth/login` | No | - | Iniciar sesión |
| POST | `/api/auth/refresh-token` | No | - | Renovar token |
| POST | `/api/auth/logout` | Sí | - | Cerrar sesión |
| POST | `/api/auth/change-password` | Sí | - | Cambiar contraseña |
| POST | `/api/auth/forgot-password` | No | - | Recuperar contraseña |
| POST | `/api/auth/reset-password` | No | - | Restablecer contraseña |
| GET | `/api/auth/me` | Sí | - | Datos del usuario |
| GET | `/api/clientes` | Sí | ADMIN, SUPERADMIN | Listar clientes |
| GET | `/api/clientes/:id` | Sí | - | Obtener cliente |
| POST | `/api/clientes` | Sí | ADMIN, SUPERADMIN | Crear cliente |
| PUT | `/api/clientes/:id` | Sí | ADMIN, SUPERADMIN | Actualizar cliente |
| DELETE | `/api/clientes/:id` | Sí | SUPERADMIN | Eliminar cliente |
| GET | `/api/servicios` | Sí | - | Listar servicios |
| GET | `/api/servicios/:id` | Sí | - | Obtener servicio |
| POST | `/api/servicios` | Sí | ADMIN, SUPERADMIN | Crear servicio |
| PUT | `/api/servicios/:id/estado` | Sí | - | Actualizar estado |
| PUT | `/api/servicios/:id/assign` | Sí | ADMIN, SUPERADMIN | Asignar técnico |
| GET | `/api/tecnicos` | Sí | ADMIN, SUPERADMIN, SUPERVISOR | Listar técnicos |
| GET | `/api/tecnicos/:id` | Sí | - | Obtener técnico |
| GET | `/api/tecnicos/mis-servicios` | Sí | TECNICO | Mis servicios |
| GET | `/api/evidencias` | Sí | - | Listar evidencias |
| GET | `/api/evidencias/:id` | Sí | - | Obtener evidencia |
| POST | `/api/evidencias` | Sí | TECNICO, ADMIN | Crear evidencia |
| GET | `/api/evidencias/servicio/:servicioId` | Sí | - | Evidencias de servicio |

---

## 🔐 Autenticación

### POST `/api/auth/register`

Registrar un nuevo usuario.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@codigocompany.com",
  "password": "password123",
  "rol_id": 2
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@codigocompany.com",
    "rol_id": 2,
    "estado": "activo",
    "creado_en": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST `/api/auth/login`

Iniciar sesión y obtener tokens.

**Body:**
```json
{
  "email": "juan@codigocompany.com",
  "password": "password123"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@codigocompany.com",
      "rol": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### POST `/api/auth/refresh-token`

Renovar token de acceso usando refresh token.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/auth/logout`

Cerrar sesión. Requiere token de acceso.

---

## 👥 Clientes

### GET `/api/clientes`

Listar todos los clientes.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan Pérez",
      "empresa": "Tech Corp",
      "telefono": "9841234567",
      "whatsapp": "9841234567",
      "email": "juan@email.com",
      "direccion": "Av. Reforma 123",
      "tipo_cliente": "comercial",
      "tipo_inmueble": "oficina",
      "proximo_servicio": "2024-01-20",
      "creado_en": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### POST `/api/clientes`

Crear un nuevo cliente.

**Body:**
```json
{
  "nombre": "Maria López",
  "empresa": "López & Asociados",
  "telefono": "9849876543",
  "whatsapp": "9849876543",
  "email": "maria@email.com",
  "direccion": "Calle 123 #45-67",
  "tipo_cliente": "residencial",
  "tipo_inmueble": "casa",
  "observaciones": "Cuidado con perros"
}
```

---

## 🛠️ Servicios

### GET `/api/servicios`

Listar servicios. Si el rol es TÉCNICO, solo devuelve sus servicios.

### PUT `/api/servicios/:id/estado`

Actualizar el estado de un servicio.

**Body:**
```json
{
  "estado": "en_proceso",
  "observaciones": "Servicio iniciado correctamente"
}
```

**States válidos:**
`programado`, `asignado`, `confirmado`, `en_camino`, `en_sitio`, `en_proceso`, `pendiente`, `finalizado`, `cancelado`, `reprogramado`, `cerrado`

---

## 📷 Evidencias

### POST `/api/evidencias`

Crear una nueva evidencia fotográfica.

**Body:**
```json
{
  "servicio_id": 1,
  "foto_url": "https://supabase.co/storage/v1/fotos/servicio_1_001.jpg",
  "tipo_evidencia": "antes",
  "observaciones": "Plaga visible en esquina trasera",
  "latitud": 19.4326,
  "longitud": -99.1332
}
```

**Tipos válidos:** `antes`, `durante`, `despues`, `plaga`, `area_tratada`, `producto`, `equipo`, `resultado`, `adicional`

---

## 📊 Formato de Respuesta

### Respuesta Exitosa
```json
{
  "success": true,
  "data": {},
  "message": "Descripción opcional"
}
```

### Error
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

---

## ⚠️ Rate Limiting

- **General:** 100 requests por 15 minutos por IP
- **Login:** 5 intentos por minuto por IP
- **Responses:** 429 Too Many Requests