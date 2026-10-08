-- ============================================================
-- BASE DE DATOS CÓDIGO COMPANY
-- Sistema Integral de Gestión Ambiental y Control de Plagas
-- Esquema: PostgreSQL
-- Versión: v0.1.0
-- ============================================================

-- ============================================================
-- TABLAS MAESTRAS
-- ============================================================

-- Roles del sistema
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    permisos JSONB DEFAULT '{}',
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usuarios del sistema (admin, supervisor, técnico)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INTEGER REFERENCES roles(id),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'bloqueado')),
    ultima_sesion TIMESTAMP WITH TIME ZONE,
    token_refresh VARCHAR(255),
    token_refresh_expira TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Técnicos (vinculados a usuarios)
CREATE TABLE IF NOT EXISTS Tecnicos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    nombre VARCHAR(100) NOT NULL,
    foto_url VARCHAR(255),
    telefono VARCHAR(20),
    email VARCHAR(150) UNIQUE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    especialidades TEXT[],
    zona VARCHAR(100),
    app_sheet_user_id VARCHAR(100),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    empresa VARCHAR(150),
    telefono VARCHAR(20),

-- Plagas
CREATE TABLE IF NOT EXISTS plagas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre_comercial VARCHAR(100) NOT NULL,
    ingrediente_activo VARCHAR(150),
    tipo VARCHAR(50) CHECK (tipo IN ('insecticida', 'rodenticida', 'fungicida', 'hierbicida', 'repelente', 'otro')),
    presentacion VARCHAR(100),
    unidad VARCHAR(20),
    concentracion VARCHAR(50),
    registro_sanitario VARCHAR(100),
    ficha_tecnica_url VARCHAR(255),
    hoja_seguridad_url VARCHAR(255),
    stock_minimo DECIMAL(10,2) DEFAULT 0,
    stock_actual DECIMAL(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tipos de servicio
CREATE TABLE IF NOT EXISTS tipos_servicio (
    id SERIAL PRIMARY KEY,

-- Servicios
CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    tecnico_id INTEGER REFERENCES Tecnicos(id),
    tipo_servicio_id INTEGER REFERENCES tipos_servicio(id),
    plaga_id INTEGER REFERENCES plagas(id),
    titulo VARCHAR(200),
    direccion TEXT,
    telefono_contacto VARCHAR(20),
    fecha DATE,
    hora TIME,
    area DECIMAL(10,2),
    instrucciones TEXT,
    observaciones TEXT,
    prioridad VARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
    estado VARCHAR(20) DEFAULT 'programado' CHECK (estado IN ('programado', 'asignado', 'confirmado', 'en_camino', 'en_sitio', 'en_proceso', 'pendiente', 'finalizado', 'cancelado', 'reprogramado', 'cerrado')),
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    duracion_minutos INTEGER,
    resultado TEXT,
    recomendaciones TEXT,
    proximo_servicio_fecha DATE,
    proximo_servicio_observaciones TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Evidencias fotográficas
CREATE TABLE IF NOT EXISTS evidencias (
    id SERIAL PRIMARY KEY,
    servicio_id INTEGER REFERENCES servicios(id),
    tecnico_id INTEGER REFERENCES Tecnicos(id),
    cliente_id INTEGER REFERENCES clientes(id),
    foto_url VARCHAR(255) NOT NULL,
    foto_thumbnail VARCHAR(255),
    foto_size_kb DECIMAL(10,2),
    tipo_evidencia VARCHAR(30) NOT NULL CHECK (tipo_evidencia IN ('antes', 'durante', 'despues', 'plaga', 'area_tratada', 'producto', 'equipo', 'resultado', 'adicional')),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    observaciones TEXT,
    estado_sincronizacion VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_sincronizacion IN ('sincronizado', 'pendiente', 'sincronizando', 'error')),
    metadata JSONB,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agendas (citas y recorridos)
CREATE TABLE IF NOT EXISTS agendas (
    id SERIAL PRIMARY KEY,
    servicio_id INTEGER REFERENCES servicios(id),
    cliente_id INTEGER REFERENCES clientes(id),
    tecnico_id INTEGER REFERENCES Tecnicos(id),

-- Solicitudes de cotización
CREATE TABLE IF NOT EXISTS solicitudes_cotizacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    empresa VARCHAR(150),
    telefono VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(150),
    direccion TEXT,
    tipo_inmueble VARCHAR(50),
    tipo_servicio_id INTEGER REFERENCES tipos_servicio(id),
    plaga_id INTEGER REFERENCES plagas(id),
    descripcion TEXT,
    area_aproximada DECIMAL(10,2),
    fecha_preferida DATE,
    horario_preferido VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'nueva' CHECK (estado IN ('nueva', 'en_revision', 'contactado', 'programada', 'atendida', 'cerrada', 'rechazada')),
    foto_urls TEXT[],
    notas_admin TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo_notificacion VARCHAR(30) CHECK (tipo_notificacion IN ('servicio', 'mensaje', 'cita', 'recordatorio', 'incidencia', 'sistema')),
    leida BOOLEAN DEFAULT false,
    url_destino VARCHAR(255),
    datos_adicionales JSONB,

-- Registro de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    registro_id INTEGER,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_origen VARCHAR(50),
    user_agent TEXT,
    dispositivo VARCHAR(100),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registro de logins
CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    email VARCHAR(150),
    ip_origen VARCHAR(50),
    user_agent TEXT,
    dispositivo VARCHAR(100),
    exito BOOLEAN NOT NULL,
    error_mensaje TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_tecnicos_usuario ON Tecnicos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tecnicos_zona ON Tecnicos(zona);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_servicios_cliente ON servicios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicios_tecnico ON servicios(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_servicios_estado ON servicios(estado);
CREATE INDEX IF NOT EXISTS idx_servicios_fecha ON servicios(fecha);
CREATE INDEX IF NOT EXISTS idx_evidencias_servicio ON evidencias(servicio_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_tipo ON evidencias(tipo_evidencia);
CREATE INDEX IF NOT EXISTS idx_evidencias_sync ON evidencias(estado_sincronizacion);
CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario ON mensajes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_creado ON login_logs(creado_en);

-- ============================================================
-- FUNCIONES HELPER
-- ============================================================


-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Insertar roles iniciales
INSERT INTO roles (nombre, descripcion, permisos) VALUES
    ('SUPERADMIN', 'Acceso completo al sistema', '{"all": true}'),
    ('ADMIN', 'Administrador general', '{"clientes": "all", "servicios": "all", "tecnicos": "all"}'),
    ('SUPERVISOR', 'Supervisor de zona', '{"servicios": "view_assign", "reportes": true}'),
    ('TECNICO', 'Técnico de campo', '{"servicios": "own", "evidencias": "own"}')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar plagas iniciales
INSERT INTO plagas (nombre, descripcion, orden) VALUES
    ('Cucarachas', 'Control de cucarachas', 1),
    ('Hormigas', 'Control de hormigas', 2),
    ('Mosquitos', 'Control de mosquitos', 3),
    ('Moscas', 'Control de moscas', 4),
    ('Termitas', 'Control de termitas', 5),
    ('Roedores', 'Control de roedores', 6),
    ('Chinches', 'Control de chinches', 7),
    ('Pulgas', 'Control de pulgas', 8),
    ('Garrapatas', 'Control de garrapatas', 9),
    ('Avispas', 'Control de avispas', 10),
    ('Abejas', 'Control de abejas', 11),
    ('Aves', 'Control de aves', 12),
    ('Otras', 'Otros plaga', 13)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar tipos de servicio
INSERT INTO tipos_servicio (nombre, descripcion) VALUES
    ('Fumigación', 'Servicio de fumigación completa'),
    ('Control de Plagas', 'Control de plagas específicas'),
    ('Prevención', 'Servicios de prevención y mantenimiento'),
    ('Monitoreo', 'Monitoreo de áreas críticas'),
    ('Inspección', 'Inspección y diagnóstico'),
    ('Recorrido', 'Recorrido de verificación')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar configuraciones iniciales
INSERT INTO configuraciones (clave, valor, tipo, descripcion) VALUES
    ('empresa_nombre', 'Código Company', 'text', 'Nombre de la empresa'),
    ('empresa_email', 'contacto@codigocompany.com', 'text', 'Correo de contacto'),
    ('empresa_telefono1', '9842682364', 'text', 'Número de contacto 1'),
    ('empresa_telefono2', '9841724610', 'text', 'Número de contacto 2'),
    ('empresa_whatsapp', '9842682364', 'text', 'WhatsApp principal'),
    ('empresa_direccion', 'Por configurar', 'text', 'Dirección de la empresa'),
    ('foto_max_size_mb', '1', 'number', 'Tamaño máximo de fotos en MB'),
    ('sync_auto_activado', 'true', 'boolean', 'Sincronización automática activada')
ON CONFLICT (clave) DO NOTHING;

-- Insertar redes sociales
INSERT INTO redes_sociales (nombre, url, orden) VALUES
    ('WhatsApp', 'https://wa.me/529842682364', 1),
    ('Facebook', '#', 2),
    ('Instagram', '#', 3),
    ('LinkedIn', '#', 4)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar secuencia inicial para offline IDs
INSERT INTO secuencias_offline (tabla_destino, ultimo_id_bigint, prefijo) VALUES
    ('servicios', 100000, 'SER'),
    ('evidencias', 100000, 'EVI'),
    ('actividades_servicio', 100000, 'ACT'),
    ('mensajes', 100000, 'MSG')
ON CONFLICT DO NOTHING;

COMMIT;
-- Función para actualizar automáticamente el timestamp de modificación
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modificado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER trigger_actualizar_usuarios
    BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trigger_actualizar_clientes
    BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trigger_actualizar_tecnicos
    BEFORE UPDATE ON Tecnicos FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trigger_actualizar_servicios
    BEFORE UPDATE ON servicios FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- Registro de sincronización
CREATE TABLE IF NOT EXISTS sync_logs (
    id SERIAL PRIMARY KEY,
    tecnico_id INTEGER REFERENCES Tecnicos(id),
    tipo_registro VARCHAR(50),
    registro_id INTEGER,
    accion VARCHAR(50) CHECK (accion IN ('insert', 'update', 'delete')),
    estado VARCHAR(20) CHECK (estado IN ('pending', 'procesando', 'completado', 'error')),
    error_mensaje TEXT,
    datos_enviados JSONB,
    respuesta_servidor JSONB,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completado_en TIMESTAMP WITH TIME ZONE
);

-- Tabla para control de secuencias offline
CREATE TABLE IF NOT EXISTS secuencias_offline (
    id SERIAL PRIMARY KEY,
    tabla_destino VARCHAR(100) NOT NULL,
    ultimo_id_bigint BIGINT DEFAULT 100000,
    prefijo VARCHAR(10) DEFAULT 'OFF',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    leida_en TIMESTAMP WITH TIME ZONE
);

-- Certificaciones
CREATE TABLE IF NOT EXISTS certificaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    logo_url VARCHAR(255),
    fecha_obtencion DATE,
    fecha_vencimiento DATE,
    entidad_emisora VARCHAR(150),
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Convenios/Empresas asociadas
CREATE TABLE IF NOT EXISTS convenios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    logo_url VARCHAR(255),
    descripcion TEXT,
    tipo_convenio VARCHAR(50) CHECK (tipo_convenio IN ('asociacion', 'socio', 'distribuidor', 'proveedor')),
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Redes sociales
CREATE TABLE IF NOT EXISTS redes_sociales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icono VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
    titulo VARCHAR(100),
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME,
    direccion TEXT,
    estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'confirmada', 'cancelada', 'completada', 'reprogramada')),
    tipo_evento VARCHAR(30) CHECK (tipo_evento IN ('servicio', 'inspeccion', 'visita', 'reunion', 'otro')),
    recordatorio_enviado BOOLEAN DEFAULT false,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mensajes/Comunicación
CREATE TABLE IF NOT EXISTS mensajes (
    id SERIAL PRIMARY KEY,
    remitente_id INTEGER REFERENCES usuarios(id),
    destinatario_id INTEGER REFERENCES usuarios(id),
    servicio_id INTEGER REFERENCES servicios(id),
    titulo VARCHAR(200),
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    tipo_mensaje VARCHAR(20) DEFAULT 'mensaje' CHECK (tipo_mensaje IN ('mensaje', 'notificacion', 'aviso', 'instruccion')),
    prioridad VARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    leido_en TIMESTAMP WITH TIME ZONE
);

-- Detalles de servicio (historial de cambios)
CREATE TABLE IF NOT EXISTS historial_servicio (
    id SERIAL PRIMARY KEY,
    servicio_id INTEGER REFERENCES servicios(id),
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20),
    usuario_id INTEGER REFERENCES usuarios(id),
    observacion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Actividades durante el servicio
CREATE TABLE IF NOT EXISTS actividades_servicio (
    id SERIAL PRIMARY KEY,
    servicio_id INTEGER REFERENCES servicios(id),
    plaga_id INTEGER REFERENCES plagas(id),
    area VARCHAR(100),
    producto_id INTEGER REFERENCES productos(id),
    cantidad DECIMAL(10,2),
    unidad VARCHAR(20),
    metodo_aplicacion VARCHAR(50),
    observaciones TEXT,
    incidencias TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Configuraciones de la empresa
CREATE TABLE IF NOT EXISTS configuraciones (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(20) DEFAULT 'text' CHECK (tipo IN ('text', 'number', 'boolean', 'json')),
    descripcion TEXT,
    modificable BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
    whatsapp VARCHAR(20),
    email VARCHAR(150),
    direccion TEXT,
    tipo_cliente VARCHAR(30) CHECK (tipo_cliente IN ('residencial', 'comercial', 'empresarial', 'industrial')),
    tipo_inmueble VARCHAR(50),
    referencia_ubicacion TEXT,
    observaciones TEXT,
    historial_servicios TEXT,
    proximo_servicio DATE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);