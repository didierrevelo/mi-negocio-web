# REST API Template

Production-ready Express.js REST API with JWT authentication, rate limiting, and security best practices.

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

## Endpoints

### Health

| Method | Path      | Auth | Description    |
|--------|-----------|------|----------------|
| GET    | `/health` | No   | Server health  |

### Authentication

| Method | Path                   | Auth | Description     |
|--------|------------------------|------|-----------------|
| POST   | `/api/users/register`  | No   | Create account  |
| POST   | `/api/users/login`     | No   | Get JWT token   |

**POST /api/users/register**

```json
// Request
{ "name": "Alice", "email": "alice@example.com", "password": "s3cure!" }

// Response 201
{ "id": "...", "name": "Alice", "email": "alice@example.com", "role": "user", "createdAt": "..." }
```

**POST /api/users/login**

```json
// Request
{ "email": "alice@example.com", "password": "s3cure!" }

// Response 200
{ "token": "eyJhbGci...", "user": { "id": "...", "name": "Alice", ... } }
```

### Users (Protected)

All endpoints below require `Authorization: Bearer <token>` header.

| Method | Path              | Role  | Description      |
|--------|-------------------|-------|------------------|
| GET    | `/api/users`      | Any   | List all users   |
| GET    | `/api/users/:id`  | Any   | Get user by ID   |
| PUT    | `/api/users/:id`  | Owner | Update user      |
| DELETE | `/api/users/:id`  | Admin | Delete user      |

## Security Features

- **Helmet** — secure HTTP headers
- **CORS** — configurable origin whitelist
- **Rate limiting** — 100 requests per 15 min window (configurable)
- **Body size limits** — 10kb max
- **JWT auth** — Bearer token with expiry
- **Role-based access** — `authorize("admin")` middleware
- **Error sanitization** — generic messages in production

## Environment Variables

| Variable                | Default               | Description               |
|-------------------------|-----------------------|---------------------------|
| `NODE_ENV`              | `development`         | Environment mode          |
| `PORT`                  | `3000`                | Server port               |
| `JWT_SECRET`            | —                     | Secret for signing JWTs   |
| `JWT_EXPIRES_IN`        | `24h`                 | Token expiry duration     |
| `CORS_ORIGIN`           | `http://localhost:3000`| Allowed origin           |
| `RATE_LIMIT_WINDOW_MS`  | `900000`              | Rate limit window (ms)    |
| `RATE_LIMIT_MAX`        | `100`                 | Max requests per window   |

## Project Structure

```
├── server.js            # Express app setup & startup
├── routes/
│   └── users.js         # User CRUD & auth routes
├── middleware/
│   └── auth.js          # JWT verify & role check
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md            # This file
```
