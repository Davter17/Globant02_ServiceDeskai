# Testing Guide - Service Desk Application

## 📋 Tabla de Contenido

- [Descripción General](#descripción-general)
- [Configuración del Entorno](#configuración-del-entorno)
- [Instalación de Dependencias](#instalación-de-dependencias)
- [Estructura de Tests](#estructura-de-tests)
- [Ejecutar Tests](#ejecutar-tests)
- [Coverage Reports](#coverage-reports)
- [Debugging Tests](#debugging-tests)

---

## 📖 Descripción General

Esta aplicación incluye una suite completa de tests que cubren:

- **Tests Unitarios**: Modelos (User), utilidades (JWT)
- **Tests de Integración**: Endpoints de API (Auth, Reports, Users, Offices)
- **Tests de RBAC**: Control de acceso basado en roles
- **Coverage Target**: Mínimo 70% en todas las métricas (branches, functions, lines, statements)

### Stack de Testing

- **Jest** v29.7.0 - Framework de testing
- **Supertest** v6.3.3 - Tests de API HTTP
- **mongodb-memory-server** - Base de datos en memoria para tests

---

## ⚙️ Configuración del Entorno

### Prerrequisitos

```bash
# Verificar instalaciones
node --version   # v16+ recomendado
npm --version    # v8+ recomendado
```

### Variables de Entorno

Los tests utilizan configuración específica definida en `src/__tests__/setup.js`:

```javascript
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key-for-testing-only
JWT_REFRESH_SECRET=test-jwt-refresh-secret-key-for-testing
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

**No** es necesario crear un archivo `.env.test` - las variables se configuran automáticamente.

---

## 📦 Instalación de Dependencias

### Instalar todas las dependencias de testing

```bash
cd backend

# Instalar dependencias principales
npm install

# Instalar mongodb-memory-server (si no está instalado)
npm install --save-dev mongodb-memory-server
```

### Verificar dependencias instaladas

```bash
npm list jest supertest mongodb-memory-server
```

Deberías ver:

```
├── jest@29.7.0
├── supertest@6.3.3
└── mongodb-memory-server@9.x.x
```

---

## 🗂️ Estructura de Tests

```
backend/src/__tests__/
├── setup.js                      # Configuración global de Jest
├── helpers/
│   └── database.js               # Helper para MongoDB in-memory
├── fixtures/
│   └── index.js                  # Datos de prueba reutilizables
├── unit/
│   ├── user.model.test.js        # Tests del modelo User
│   └── jwt.utils.test.js         # Tests de utilidades JWT
└── integration/
    ├── auth.test.js              # Tests de autenticación
    ├── reports.test.js           # Tests de reportes
    └── rbac.test.js              # Tests de permisos RBAC
```

### Fixtures Disponibles

#### Users
```javascript
fixtures.users.admin       // Admin user
fixtures.users.servicedesk // Service desk user
fixtures.users.user        // Regular user
fixtures.users.inactive    // Inactive user
```

#### Offices
```javascript
fixtures.offices.main      // Main office (New York)
fixtures.offices.branch    // Branch office (Los Angeles)
```

#### Reports
```javascript
fixtures.reports.hardware  // Hardware issue (high priority)
fixtures.reports.software  // Email issue (medium priority)
fixtures.reports.network   // Network issue (critical priority)
```

---

## 🧪 Ejecutar Tests

### Todos los tests con coverage

```bash
npm test
```

### Solo tests (sin coverage)

```bash
npm test -- --coverage=false
```

### Tests específicos

```bash
# Un archivo específico
npm test -- user.model.test.js

# Tests de integración
npm test -- integration/

# Tests unitarios
npm test -- unit/

# Por patrón de nombre
npm test -- --testNamePattern="should login successfully"
```

### Modo watch (desarrollo)

```bash
npm test -- --watch

# Watch solo archivos modificados
npm test -- --watchAll=false
```

### Verbose mode (más detalles)

```bash
npm test -- --verbose
```

---

## 📊 Coverage Reports

### Generar reporte de coverage

```bash
npm test
```

El reporte se genera automáticamente en:
- **Terminal**: Resumen en consola
- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`

### Ver reporte HTML

```bash
# Linux
xdg-open coverage/lcov-report/index.html

# macOS
open coverage/lcov-report/index.html

# Windows
start coverage/lcov-report/index.html
```

### Interpretar métricas de coverage

El proyecto requiere **mínimo 70%** en todas las métricas:

```
Coverage Summary:
---------------------
Statements   : 85.5% ( 342/400 )
Branches     : 78.2% ( 156/200 )
Functions    : 82.3% ( 123/150 )
Lines        : 84.8% ( 339/400 )
```

- **Statements**: Líneas de código ejecutadas
- **Branches**: if/else, switch, ternarios ejecutados
- **Functions**: Funciones llamadas
- **Lines**: Líneas totales ejecutadas

---

## 🐛 Debugging Tests

### Con breakpoints (Node Inspector)

```bash
# 1. Agregar breakpoint en el código
debugger;

# 2. Ejecutar con inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# 3. Abrir Chrome DevTools
chrome://inspect
```

### Logs y output

```bash
# Deshabilitar mock de console (en setup.js)
# Comentar estas líneas:
# global.console.log = jest.fn();
# global.console.debug = jest.fn();
# ...

# O ejecutar con NODE_ENV diferente
NODE_ENV=development npm test
```

### Tests fallidos

```bash
# Ver solo tests fallidos
npm test -- --onlyFailures

# Detener al primer error
npm test -- --bail

# Mostrar stack trace completo
npm test -- --verbose
```

---

## 📋 Tests Disponibles

### Unit Tests

#### `user.model.test.js` (220+ líneas)
- Validación de modelo User
- Hashing de contraseñas
- Método matchPassword()
- Gestión de refresh tokens
- Estadísticas de usuarios
- Índices de base de datos

#### `jwt.utils.test.js` (150+ líneas)
- Generación de access tokens
- Generación de refresh tokens
- Verificación de tokens
- Extracción de tokens de headers
- Manejo de tokens expirados
- Seguridad de tokens

### Integration Tests

#### `auth.test.js` (430+ líneas)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me

**Tests:**
- Registro exitoso
- Validación de campos
- Login con credenciales correctas/incorrectas
- Refresh token flow
- Logout y limpieza de tokens
- Usuario inactivo
- Emails case-insensitive

#### `reports.test.js` (650+ líneas)
- POST /api/reports
- GET /api/reports (con filtros y paginación)
- GET /api/reports/:id
- PUT /api/reports/:id
- DELETE /api/reports/:id
- POST /api/reports/:id/assign
- POST /api/reports/:id/resolve
- POST /api/reports/:id/rate
- GET /api/reports/stats

**Tests:**
- CRUD completo de reportes
- Filtros por status, priority, category
- Paginación
- Asignación a servicedesk
- Resolución de reportes
- Rating de reportes
- Estadísticas
- Permisos por rol

#### `rbac.test.js` (550+ líneas)
- Tests exhaustivos de permisos

**Admin puede:**
- ✅ Gestionar usuarios (CRUD completo)
- ✅ Cambiar roles
- ✅ Gestionar oficinas (CRUD)
- ✅ Ver y eliminar reportes
- ✅ Ver estadísticas globales

**Servicedesk puede:**
- ✅ Ver todos los reportes
- ✅ Asignar reportes
- ✅ Resolver reportes
- ✅ Ver estadísticas globales
- ✅ Ver oficinas
- ❌ Gestionar usuarios
- ❌ Gestionar oficinas
- ❌ Eliminar reportes

**User puede:**
- ✅ Crear reportes
- ✅ Ver propios reportes
- ✅ Actualizar propios reportes
- ✅ Calificar propios reportes resueltos
- ✅ Ver oficinas
- ❌ Ver reportes de otros usuarios
- ❌ Asignar/resolver reportes
- ❌ Gestionar usuarios/oficinas
- ❌ Eliminar reportes

---

## 🔍 Troubleshooting

### Error: "Cannot find module 'mongodb-memory-server'"

```bash
npm install --save-dev mongodb-memory-server
```

### Error: "Port already in use"

Los tests usan una base de datos en memoria, no deberías tener problemas de puertos. Si los hay:

```bash
# Verificar que el servidor principal no esté corriendo
lsof -ti:5000 | xargs kill -9
```

### Tests muy lentos

```bash
# Aumentar el timeout en jest.config.js
testTimeout: 20000  // De 10000 a 20000

# O ejecutar con menos workers
npm test -- --maxWorkers=2
```

### Coverage no alcanza 70%

```bash
# Ver archivos sin coverage
npm test -- --coverage --verbose

# Revisar reporte HTML para identificar líneas no cubiertas
```

---

## 📈 Próximos Pasos

1. **Frontend Testing**: Implementar React Testing Library
   - Componentes: Login, Register, ReportList
   - Interacciones de usuario
   - Validaciones de formularios

2. **E2E Testing** (Opcional): Cypress
   - Flujos completos de usuario
   - Tests de integración UI + API

3. **Performance Testing**: Artillery o k6
   - Load testing
   - Stress testing

---

## ✅ Checklist de Testing

- [x] Jest configurado con coverage 70%
- [x] MongoDB Memory Server para tests
- [x] Fixtures de datos de prueba
- [x] Tests unitarios de modelos
- [x] Tests unitarios de utils
- [x] Tests de integración de Auth API
- [x] Tests de integración de Reports API
- [x] Tests de RBAC completos
- [ ] Tests de componentes React (Paso 9 pendiente)
- [ ] Tests E2E con Cypress (Opcional)

---

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 📞 Soporte

Si encuentras problemas con los tests:

1. Verificar que todas las dependencias estén instaladas
2. Verificar que Node.js sea v16+
3. Limpiar cache de Jest: `npm test -- --clearCache`
4. Revisar logs detallados: `npm test -- --verbose`

---

**Última actualización**: Paso 9 - Testing Básico
**Autor**: Service Desk Development Team
**Version**: 1.0.0
