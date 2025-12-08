# 📚 Documentación del Proyecto - Service Desk

Bienvenido a la documentación del proyecto Service Desk para Globant Piscine.

## 📖 Guías Disponibles

### 🎯 Para Principiantes
- **[Guía para Principiantes](./GUIA_PARA_PRINCIPIANTES.md)**  
  Si es tu primera vez con MERN stack o Docker, empieza aquí.  
  Explica qué es cada tecnología y cómo funciona el proyecto.

### 🔐 Configuración
- **[Variables de Entorno - Buenas Prácticas](./ENV_BEST_PRACTICES.md)**  
  Guía completa sobre cómo manejar archivos `.env` de forma segura.  
  Incluye ejemplos y checklist de seguridad.

### 📊 Seguimiento
- **[Progreso del Proyecto](./PROGRESS.md)**  
  Estado actual de implementación, pasos completados y pendientes.  
  Actualizado después de cada fase importante.

### 🛠️ Implementación Técnica

#### Backend - Paso 2
- **[Step 2.1: Conexión MongoDB](./STEP_2.1_MONGODB_CONNECTION.md)**  
  Configuración de Mongoose, retry logic y health checks.
  
- **[Step 2.2: Modelos de Datos](./STEP_2.2_MODELS.md)**  
  Documentación completa de User, Office, Report y Message models.
  
- **[Step 2.3: Autenticación JWT](./STEP_2.3_JWT_AUTHENTICATION.md)**  
  Sistema completo de autenticación con JWT (registro, login, refresh tokens).

- **[Step 2.4: Rutas Protegidas con RBAC](./STEP_2.4_RBAC_ROUTES.md)**  
  Control de acceso basado en roles con 31 endpoints API funcionales.

- **[Step 2.5: CORS y Seguridad Básica](./STEP_2.5_SECURITY.md)** ✨ NUEVO  
  Implementación completa de seguridad: Helmet, Rate Limiting, Sanitización XSS/NoSQL.

---

## 🗺️ Navegación Rápida

### Para empezar con el proyecto:
1. Lee el [README principal](../README.md) para overview y comandos básicos
2. Revisa [GUIA_PARA_PRINCIPIANTES.md](./GUIA_PARA_PRINCIPIANTES.md) si necesitas contexto
3. Configura tus variables en [ENV_BEST_PRACTICES.md](./ENV_BEST_PRACTICES.md)
4. Verifica el progreso en [PROGRESS.md](./PROGRESS.md)

### Estructura del Proyecto:
```
ex02/
├── docs/              ← Estás aquí
├── backend/           ← API Node.js + Express
├── frontend/          ← App React
├── .devcontainer/     ← Configuración DevContainers
└── Makefile           ← Comandos Docker simplificados
```

---

## 🔗 Enlaces Útiles

### Documentación Externa
- [MongoDB](https://www.mongodb.com/docs/)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [Node.js](https://nodejs.org/docs/latest/api/)
- [Docker](https://docs.docker.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

### Recursos del Proyecto
- [Subject Original](../ServiceDeskai.subject.pdf)
- [Plan de Trabajo](../Steps)

---

## 📝 Contribuir a la Documentación

Si encuentras algo confuso o faltante:
1. Edita el archivo correspondiente en `docs/`
2. Mantén el formato Markdown consistente
3. Usa emojis para claridad visual 👍
4. Actualiza este índice si agregas nuevos docs

---

## 🚀 Próximos Documentos (Planeados)

- [ ] **ARCHITECTURE.md** - Diagrama de arquitectura del sistema
- [ ] **API_REFERENCE.md** - Endpoints y ejemplos de uso
- [ ] **TESTING.md** - Guía de testing y TDD
- [ ] **DEPLOYMENT.md** - Cómo desplegar a producción
- [ ] **TROUBLESHOOTING.md** - Solución a problemas comunes

---

*Última actualización: Diciembre 7, 2025*
