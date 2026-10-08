# 🏢 Código Company - Sistema Integral

> **Sistema integral de Gestión Ambiental y Control de Plagas**
> 
> *Gestión Ambiental y Control de Plagas*

## 📋 Descripción

Ecosistema digital completo para la empresa **Código Company**, especializada en servicios de fumigación, control de plagas, prevención, monitoreo, inspección y recorridos.

### Componentes del Sistema

1. **Página Web Pública** - Sitio institucional profesional
2. **Sistema Web Administrativo** - Panel de control completo
3. **Aplicación Móvil** - AppSheet para técnicos (Android/iOS)
4. **Base de Datos Centralizada** - PostgreSQL vía Supabase
5. **API RESTful** - Backend Node.js + Express
6. **Sistema de Autenticación** - JWT + Bcrypt
7. **Sistema de Roles** - SUPERADMIN, ADMIN, SUPERVISOR, TÉCNICO

## 🎨 Identidad Corporativa

| Color | Código | Uso |
|-------|--------|-----|
| Blanco Crema | `#fdf8f0` | 70% - Fondo principal |
| Crema Claro | `#faf0e6` | Matices secundarios |
| Negro | `#1a1a1a` | 15% - Texto principal |
| Negro Claro | `#2d2d2d` | Texto secundario |
| Verde Hoja | `#2d8659` | 15% - Acento principal |
| Verde Claro | `#4caf50` | Acento secundario |
| Verde Muy Claro | `#81c784` | Detalles y botones |

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|------------|
| **Frontend Web** | HTML5, CSS3, JavaScript (Vanilla) |
| **Frontend Admin** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js + Express.js |
| **Base de Datos** | PostgreSQL (Supabase) |
| **Almacenamiento** | Supabase Storage |
| **Autenticación** | JWT + Bcrypt |
| **Deploy Web** | GitHub Pages |
| **Deploy Backend** | Railway.app |
| **Control de Versiones** | Git + GitHub |

## 🚀 Inicio Rápido

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- Cuenta en [Supabase](https://supabase.com/) (gratuita)

### Instalación del Backend

```bash
cd backend
npm install
# Copiar .env.example a .env y configurar
cp .env.example .env
npm run dev
```

### Ejecución del Frontend

```bash
cd web-publica
# Abrir index.html en el navegador o usar Live Server
```

## 📁 Estructura del Proyecto

```
codigo-company-system/
├── backend/                 # API REST
├── web-publica/            # Sitio web público
├── app-sheet/             # Configuración de AppSheet
├── database/              # Esquema y migraciones
├── docs/                  # Documentación
└── README.md
```

## 🔒 Seguridad

- Todas las contraseñas se almacenan con hash (Bcrypt)
- JWT con expiración de sesión
- Rate limiting en endpoints sensibles
- Validación y sanitización de entradas
- CORS configurado
- Headers de seguridad HTTP

## 📄 Licencia

Propiedad de Código Company - Todos los derechos reservados.

## 👥 Créditos

Desarrollado por el equipo de arquitectura de Código Company.

---
*Versión: v0.1.0*
