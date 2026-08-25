[ Español](README.es.md) | **English**

# Service Desk AI

Intelligent incident management platform with AI image analysis, geolocation, real-time chat and PWA support. Built with Node.js, Express, MongoDB, React and Socket.io.

## 🚀 How to launch the project

The project ships with a Makefile that wraps Docker Compose. From the project root:

```bash
make restart
```

Once the containers are running, open your browser and navigate to:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000

> Note: run `make seed` after the first start to load test users and sample data into MongoDB.

## 🧪 Tests

Backend logic is covered by Jest tests (unit + integration):

```bash
cd backend
npm install
npm test
```

## 🏗️ Architecture

- `backend/src/index.js` — Express entry point: security middleware, routes and Socket.io setup.
- `backend/src/config/` — MongoDB connection, Socket.io config and Nodemailer transport.
- `backend/src/controllers/` — business logic for auth, users, offices, reports and email.
- `backend/src/middleware/` — JWT auth, RBAC authorization, rate limiting, validation and security.
- `backend/src/models/` — Mongoose schemas (User, Office, Report, Message).
- `backend/src/routes/` — REST API endpoints.
- `backend/src/utils/jwt.js` — access/refresh token generation and verification.
- `frontend/src/` — React 18 SPA with Redux Toolkit, React Router, Socket.io client and PWA service worker.
- `docker-compose.yml` — dev orchestration (MongoDB + backend + frontend).
- `docker-compose.prod.yml` — production orchestration with hardened credentials.
- `nginx/` — reverse proxy with SSL, rate limiting and WebSocket support for production.

## 🎮 How to use

Sign in with a test account (created by `make seed`): admin@test.com / Admin123!, servicedesk@test.com / Service123! or user@test.com / User123!. Create incident reports with geolocation and image attachments, track them through the ticket dashboard, chat in real time with Socket.io, and manage users and offices from the admin panel.
