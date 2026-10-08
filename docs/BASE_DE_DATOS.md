# 📊 Base de Datos - Documentación

> **Motor:** PostgreSQL 14+  
> **Proveedor:** Supabase  
> **Versión del esquema:** v0.1.0

---

## 📋 Descripción de Tablas Principales

### Tabla: `roles`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL (PK) | ID único autoincremental |
| nombre | VARCHAR(50) | SUPERADMIN, ADMIN, SUPERVISOR, TECNICO |
| descripcion | TEXT | Descripción del rol |
| permisos | JSONB | Permisos específicos por módulo |
| activo | BOOLEAN | Estado activo del rol |
| creado_en | TIMESTAMP | Fecha de creación |
| modificado_en | TIMESTAMP | Fecha de última modificación |

### Tabla: `usuarios`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL (PK) | ID único autoincremental |
| nombre | VARCHAR(100) | Nombre completo |
| email | VARCHAR(150) | Email único |
| password_hash | VARCHAR(255) | Hash de contraseña (Bcrypt) |
| rol_id | INTEGER (FK) | Referencia a roles |
| estado | VARCHAR(20) | activo, inactivo, bloqueado |
| token_refresh | VARCHAR(255) | Refresh token almacenado |
| ultima_sesion | TIMESTAMP | Última sesión activa |
| creado_en | TIMESTAMP | Fecha de creación |

### Tabla: `Tecnicos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL (PK) | ID único |
| usuario_id | INTEGER (FK) | Referencia a usuarios |
| nombre | VARCHAR(100) | Nombre del técnico |
| foto_url | VARCHAR(255) | URL de foto de perfil |
| telefono | VARCHAR(20) | Teléfono de contacto |
| email | VARCHAR(150) | Email único |
| estado | VARCHAR(20) | activo, inactivo, suspendido |
| especialidades | TEXT[] | Array de especialidades |
| zona | VARCHAR(100) | Zona de trabajo |
| app_sheet_user_id | VARCHAR(100) | ID de usuario en AppSheet |

### Tabla: `clientes`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL (PK) | ID único |
| nombre | VARCHAR(100) | Nombre completo |
| empresa | VARCHAR(150) | Empresa |
| telefono | VARCHAR(20) | Teléfono de contacto |
| whatsapp | VARCHAR(20) | WhatsApp |
| email | VARCHAR(150) | Email |
| direccion | TEXT | Dirección completa |
| tipo_cliente | VARCHAR(30) | residencial, comercial, empresarial |
| tipo_inmueble | VARCHAR(50) | Tipo de inmueble |
| proximo_servicio | DATE | Próxima fecha de servicio |

### Tabla: `servicios`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL (PK) | ID único |
| cliente_id | INTEGER (FK) | Cliente asociado |
| tecnico_id | INTEGER (FK) | Técnico asignado |
| tipo_servicio_id | INTEGER (FK) | Tipo de servicio |
| plaga_id | INTEGER (FK) | Plaga identificada |
| estado | VARCHAR(20) | Estado del servicio |
| fecha | DATE | Fecha programada |
| hora | TIME | Hora programada |
| fecha_inicio | TIMESTAMP | Inicio del servicio |
| fecha_fin | TIMESTAMP | Fin del servicio |

### Tabla: `evidencias`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL (PK) | ID único |
| servicio_id | INTEGER (FK) | Servicio asociado |
| tecnico_id | INTEGER (FK) | Técnico que capturó |
| cliente_id | INTEGER (FK) | Cliente asociado |
| foto_url | VARCHAR(255) | URL de la foto |
| tipo_evidencia | VARCHAR(30) | antes, durante, despues, etc. |
| estado_sincronizacion | VARCHAR(20) | sincronizado, pendiente, error |
| latitud | DECIMAL | Coordenadas GPS |
| longitud | DECIMAL | Coordenadas GPS |

---

## 🔧 Índices de Rendimiento

- `idx_usuarios_email` - Búsqueda por email
- `idx_usuarios_rol` - Filtrado por rol
- `idx_tecnicos_usuario` - Técnico por usuario
- `idx_tecnicos_zona` - Técnico por zona
- `idx_clientes_email` - Búsqueda por email
- `idx_servicios_cliente` - Servicios por cliente
- `idx_servicios_tecnico` - Servicios por técnico
- `idx_servicios_estado` - Filtrado por estado
- `idx_servicios_fecha` - Servicios por fecha
- `idx_evidencias_servicio` - Evidencias por servicio
- `idx_evidencias_sync` - Evidencias por estado de sync
- `idx_mensajes_destinatario` - Mensajes por destinatario
- `idx_notificaciones_usuario` - Notificaciones por usuario
- `idx_auditoria_usuario` - Auditoría por usuario
- `idx_auditoria_creado` - Auditoría por fecha
- `idx_login_logs_creado` - Logs de login por fecha
- `idx_sync_logs_creado` - Logs de sync por fecha

---

## 🔄 Triggers

```sql
-- Función para actualizar timestamp de modificación
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modificado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers automáticos
CREATE TRIGGER trigger_actualizar_usuarios BEFORE UPDATE ON usuarios;
CREATE TRIGGER trigger_actualizar_clientes BEFORE UPDATE ON clientes;
CREATE TRIGGER trigger_actualizar_tecnicos BEFORE UPDATE ON Tecnicos;
CREATE TRIGGER trigger_actualizar_servicios BEFORE UPDATE ON servicios;
```

---

## 📋 Comandos Útiles

```sql
-- Ver todos los roles
SELECT * FROM roles ORDER BY id;

-- Ver usuarios activos
SELECT u.id, u.nombre, u.email, r.nombre as rol 
FROM usuarios u JOIN roles r ON u.rol_id = r.id 
WHERE u.estado = 'activo';

-- Servicios pendientes por técnico
SELECT s.id, s.titulo, s.fecha, c.nombre as cliente 
FROM servicios s 
JOIN clientes c ON s.cliente_id = c.id 
WHERE s.estado IN ('programado', 'asignado') 
AND s.tecnico_id = 1 ORDER BY s.fecha;

-- Evidencias pendientes de sync
SELECT e.id, e.tipo_evidencia, e.creado_en
FROM evidencias e 
WHERE e.estado_sincronizacion = 'pendiente'
ORDER BY e.creado_en DESC;

-- Últimos logs de auditoría
SELECT a.accion, u.nombre, a.tabla_afectada, a.creado_en
FROM auditoria a 
LEFT JOIN usuarios u ON a.usuario_id = u.id
ORDER BY a.creado_en DESC LIMIT 50;

-- Contar servicios por estado
SELECT estado, COUNT(*) as total 
FROM servicios 
GROUP BY estado 
ORDER BY total DESC;

-- Técnicos con más servicios finalizados
SELECT t.nombre, COUNT(s.id) as servicios_total
FROM Tecnicos t 
JOIN servicios s ON t.id = s.tecnico_id 
WHERE s.estado = 'finalizado'
GROUP BY t.id, t.nombre 
ORDER BY servicios_total DESC;
```

---

## 🔄 Migraciones

Las migraciones se colocan en `/database/migrations/` y siguen el formato:
```
YYYYMMDDHHMMSS_descripcion.sql
```

Ejecutar migración:
```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/20240115000000_create_table_x.sql
```
| metadata | JSONB | Metadatos adicionales