# DevContainer Setup

Este proyecto está configurado con DevContainers para proporcionar un entorno de desarrollo consistente.

## Requisitos previos

- Docker Desktop instalado y en ejecución
- Visual Studio Code
- Extensión "Dev Containers" de Microsoft instalada en VS Code

## Cómo usar

1. Abre este proyecto en VS Code
2. Cuando se te pregunte, haz clic en "Reopen in Container" (o usa `Ctrl+Shift+P` y busca "Dev Containers: Reopen in Container")
3. VS Code construirá el contenedor y abrirá el proyecto dentro de él
4. ¡Listo! Ahora estás trabajando dentro del contenedor de desarrollo

## Servicios disponibles

- **Node.js 20**: Entorno de desarrollo principal
- **MongoDB**: Base de datos (puerto 27017)
- **Frontend**: React app (puerto 3000)
- **Backend**: Express API (puerto 5000)

## Extensiones incluidas

El devcontainer incluye automáticamente:
- ESLint
- Prettier
- Docker tools
- MongoDB for VS Code
- React snippets
- Tailwind CSS IntelliSense
- Y más...

## Comandos útiles

Después de abrir el devcontainer:

```bash
# Instalar dependencias del backend
cd backend && npm install

# Instalar dependencias del frontend
cd frontend && npm install

# Iniciar el proyecto completo (después de configurar docker-compose)
docker-compose up
```

## Notas

- Todos los cambios que hagas se sincronizan con tu máquina local
- La base de datos MongoDB persiste en un volumen de Docker
- El contenedor se detendrá cuando cierres VS Code (pero los datos persisten)
