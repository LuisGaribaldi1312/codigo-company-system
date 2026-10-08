# 🚀 Guía de Inicio Rápido

## Requisitos Previos

1. Node.js v18+ (https://nodejs.org/)
2. npm (vino con Node.js)
3. Git instalado
4. Cuenta de GitHub
5. Cuenta de Supabase (https://supabase.com) - Gratis

---

## 1. Configuración de la Base de Datos

### Opción A: Supabase (Recomendado para producción)

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. En la consola SQL, ejecuta el archivo `database/schema.sql`
4. Copia las credenciales de conexión (Settings → Database)

### Opción B: PostgreSQL Local

1. Instala PostgreSQL (https://www.postgresql.org/download/)
2. Crea una base de datos:
```bash
createdb codigo_company
psql -d codigo_company -f database/schema.sql
```

---

## 2. Configuración del Backend

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/codigo-company-system.git
cd codigo-company-system/backend

# 2. Instala dependencias
npm install

# 3. Copia el archivo de entorno
cp .env.example .env

# 4. Configura las variables de entorno
# Edita .env con tus credenciales de base de datos
```

Ejemplo de `.env`:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=codigo_company
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=una_clave_secreta_muy_fuerte
PORT=3000
NODE_ENV=development
```

### 5. Inicia el servidor

```bash
npm run dev
```

La API estará disponible en: `http://localhost:3000`

---

## 3. Configuración de la Web Pública

La web pública no requiere instalación. Simplemente abre `web-publica/index.html` en tu navegador.

Para desarrollo con Live Server (VSCode):
1. Instala la extensión "Live Server"
2. Haz click derecho en `web-publica/index.html`
3. Selecciona "Open with Live Server"

---

## 4. Primeros Pasos

1. **Crear rol de superadmin:**
```bash
# Conecta a PostgreSQL y ejecuta:
psql -d codigo_company -c "INSERT INTO roles (nombre, descripcion, permisos) VALUES ('SUPERADMIN', 'Acceso completo', '{\"all\": true}');";
```

2. **Crear usuario admin:**
```bash
# Registra un usuario usando la API:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Admin Principal","email":"admin@codigocompany.com","password":"tu_password_123","rol_id":1}'
```

3. **Iniciar sesión:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@codigocompany.com","password":"tu_password_123"}'
```

---

## 5. Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Lint
npm run lint
npm run lint:fix
```

---

## 6. Deploy a Producción

### Backend (Railway.app)
1. Crea una cuenta en https://railway.app
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno (consulta `backend/RAILWAY.md`)
4. ¡Deploy automático!

### Web Pública (GitHub Pages)
1. Sube los archivos de `web-publica/` a tu repositorio
2. Ve a Settings → Pages
3. Selecciona la carpeta `web-publica/`
4. ¡Listo!

---

## 7. Próximos Pasos

- [ ] Configurar AppSheet con la API REST
- [ ] Crear el panel administrativo
- [ ] Configurar Supabase Storage para fotos
- [ ] Configurar notificaciones push
- [ ] Agregar pruebas automatizadas
- [ ] Configurar CI/CD con GitHub Actions

---

## ❓ Problemas Comunes

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté corriendo
- Revisa las credenciales en `.env`
- En Windows: verifica que el puerto 5432 no esté bloqueado

### Error de CORS
- Agrega tu dominio a `CORS_ORIGIN` en `.env`
- En desarrollo, puedes usar `*`

### Error de JWT
- Asegúrate de que `JWT_SECRET` sea una cadena larga y segura
- Verifica que el token no haya expirado

---

## 📞 Soporte

Para reportar bugs o solicitar ayuda:
- Email: contacto@codigocompany.com
- WhatsApp: 984 268 2364