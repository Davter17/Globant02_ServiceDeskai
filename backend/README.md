# 📁 Backend Structure

## Carpetas y su propósito

### 📂 `config/`
**¿Qué va aquí?** Archivos de configuración
- `database.js` - Conexión a MongoDB
- `jwt.js` - Configuración de tokens JWT
- `email.js` - Configuración de email (Nodemailer)

### 📂 `models/`
**¿Qué va aquí?** Modelos de datos (esquemas de MongoDB)
- `User.js` - Modelo de Usuario
- `Office.js` - Modelo de Oficina
- `Report.js` - Modelo de Reporte
- `Message.js` - Modelo de Mensaje/Chat

**Ejemplo:**
```javascript
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String
});
```

### 📂 `routes/`
**¿Qué va aquí?** Rutas de la API (endpoints)
- `auth.routes.js` - Rutas de autenticación (login, register)
- `users.routes.js` - Rutas de usuarios
- `reports.routes.js` - Rutas de reportes
- `offices.routes.js` - Rutas de oficinas

**Ejemplo:**
```javascript
router.post('/register', authController.register);
router.post('/login', authController.login);
```

### 📂 `controllers/`
**¿Qué va aquí?** Lógica de negocio (qué hace cada ruta)
- `authController.js` - Lógica de autenticación
- `userController.js` - Lógica de usuarios
- `reportController.js` - Lógica de reportes

**Ejemplo:**
```javascript
exports.register = async (req, res) => {
  // Crear usuario en la base de datos
  const user = await User.create(req.body);
  res.json({ user });
};
```

### 📂 `middleware/`
**¿Qué va aquí?** Funciones que se ejecutan ANTES de las rutas
- `auth.middleware.js` - Verificar si el usuario está logueado
- `validate.middleware.js` - Validar datos de entrada
- `errorHandler.js` - Manejar errores

**Ejemplo:**
```javascript
const authMiddleware = (req, res, next) => {
  // Verificar token JWT
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  next();
};
```

### 📂 `utils/`
**¿Qué va aquí?** Funciones auxiliares reutilizables
- `hashPassword.js` - Encriptar contraseñas
- `generateToken.js` - Generar tokens JWT
- `uploadFile.js` - Subir archivos

### 📄 `index.js`
**¿Qué es?** El archivo principal que inicia el servidor
- Importa todas las rutas
- Configura middlewares
- Inicia el servidor Express

## 🎯 Flujo de una petición

```
Cliente → Ruta → Middleware → Controller → Model → Database
                                    ↓
Cliente ← Response ← Controller ← Model ← Database
```
