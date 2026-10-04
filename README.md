[ Español](README.es.md) | **English**

# Service Desk AI

Intelligent incident management platform with AI image analysis, geolocation, real-time chat and PWA support. Built with Node.js, Express, MongoDB, React and Socket.io.

## 🚀 How to launch the project

The project ships with a Makefile that wraps Docker Compose. From the project root:

```bash
make setup      # first time only — creates .env files
make up         # start in background
make dev        # start with logs visible
make down       # stop containers
make re         # rebuild from scratch
make seed       # load test data into MongoDB
make prod       # production build (nginx on :80)
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

```
globant2/
├── backend/
│   ├── src/
│   │   ├── config/       — MongoDB, Socket.io, Nodemailer
│   │   ├── controllers/  — auth, users, offices, reports, email
│   │   ├── middleware/   — JWT auth, RBAC, rate limiting, validation
│   │   ├── models/       — Mongoose schemas (User, Office, Report, Message)
│   │   ├── routes/       — REST API endpoints
│   │   └── utils/        — JWT token generation/verification
│   ├── scripts/          — MongoDB init scripts
│   └── Dockerfile
├── docker/
│   ├── docker-compose.yml      — dev orchestration (MongoDB + backend + frontend)
│   ├── docker-compose.prod.yml — production with hardened credentials
│   ├── nginx.conf              — reverse proxy config
│   └── conf.d/                 — nginx virtual hosts
├── frontend/
│   ├── src/              — React 18 SPA with Redux Toolkit
│   ├── public/           — PWA assets and service worker
│   └── Dockerfile
├── scripts/              — setup scripts (SSL, etc.)
└── Makefile              — Docker Compose wrapper
```

## 🎮 How to use

Sign in with a test account (created by `make seed`): admin@test.com / Admin123!, servicedesk@test.com / Service123! or user@test.com / User123!. Create incident reports with geolocation and image attachments, track them through the ticket dashboard, chat in real time with Socket.io, and manage users and offices from the admin panel.

## 📋 Makefile commands

| Command | Description |
|---------|-------------|
| `make setup` | Create .env files from templates |
| `make up` | Start containers in background |
| `make dev` | Start with logs visible |
| `make down` | Stop containers |
| `make build` | Build Docker images |
| `make clean` | Remove containers |
| `make fclean` | Remove containers, images and volumes |
| `make re` | Rebuild from scratch (`fclean` + `up`) |
| `make logs` | Show all container logs |
| `make logs-backend` | Show backend logs only |
| `make logs-frontend` | Show frontend logs only |
| `make seed` | Load test data into MongoDB |
| `make prod` | Build and start production (nginx on :80) |
| `make prod-down` | Stop production containers |
| `make prod-logs` | Show production logs |
