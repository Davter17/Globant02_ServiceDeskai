# 📁 Frontend Structure

## Carpetas y su propósito

### 📂 `components/`
**¿Qué va aquí?** Componentes REUTILIZABLES (pequeños)
- `Button.jsx` - Botón personalizado
- `Input.jsx` - Campo de entrada
- `Card.jsx` - Tarjeta
- `Navbar.jsx` - Barra de navegación
- `Modal.jsx` - Ventana modal

**Ejemplo:**
```jsx
function Button({ text, onClick }) {
  return <button onClick={onClick}>{text}</button>;
}
```

### 📂 `pages/`
**¿Qué va aquí?** Páginas COMPLETAS (vistas)
- `Login.jsx` - Página de login
- `Register.jsx` - Página de registro
- `Dashboard.jsx` - Panel principal
- `ReportForm.jsx` - Formulario de reportes
- `ReportList.jsx` - Lista de reportes

**Ejemplo:**
```jsx
function Login() {
  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <Input type="email" />
      <Input type="password" />
      <Button text="Login" />
    </div>
  );
}
```

### 📂 `redux/`
**¿Qué va aquí?** Estado global de la aplicación (Redux)
- `store.js` - Configuración del store
- `slices/authSlice.js` - Estado de autenticación
- `slices/reportSlice.js` - Estado de reportes
- `slices/userSlice.js` - Estado de usuario

**Ejemplo:**
```javascript
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null },
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    }
  }
});
```

### 📂 `services/`
**¿Qué va aquí?** Llamadas a la API (fetch/axios)
- `authService.js` - Login, register, logout
- `reportService.js` - CRUD de reportes
- `userService.js` - CRUD de usuarios

**Ejemplo:**
```javascript
export const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

### 📂 `utils/`
**¿Qué va aquí?** Funciones auxiliares
- `formatDate.js` - Formatear fechas
- `validateEmail.js` - Validar email
- `constants.js` - Constantes

### 📂 `styles/`
**¿Qué va aquí?** Archivos CSS
- `global.css` - Estilos globales
- `variables.css` - Variables CSS (colores, fuentes)

### 📄 `App.js`
**¿Qué es?** Componente principal de React
- Define las rutas (React Router)
- Provee el Redux store
- Layout principal

### 📄 `index.js`
**¿Qué es?** Punto de entrada de React
- Renderiza `<App />` en el DOM

## 🎯 Flujo de una acción

```
Usuario hace click → Componente → Service (API call) → Backend
                                        ↓
Usuario ve resultado ← Redux actualiza estado ← Response
```

## 📝 Ejemplo completo de Login

1. **Usuario** hace click en "Login"
2. **Componente** Login.jsx llama a `authService.login()`
3. **Service** hace fetch al backend `/api/login`
4. **Backend** valida y responde con token
5. **Redux** guarda el token en el state
6. **Componente** redirige al Dashboard
