# School Management API

A RESTful API built with **Node.js**, **TypeScript**, **Express.js**, and **MySQL** to manage school data. Supports adding schools and retrieving them sorted by proximity to any user-specified location using the Haversine formula.

---

## Features

- `POST /addSchool` — Add a new school with full Zod input validation
- `GET /listSchools` — Fetch all schools sorted by distance from user's coordinates
- `GET /health` — Health check endpoint for deployment verification
- Dual database support — switch between **local MySQL** and **Aiven Cloud MySQL** via a single env variable
- SSL auto-detection — uses full cert verification when `ca.pem` is present, encrypted fallback otherwise
- Structured JSON responses with proper HTTP status codes
- TypeScript throughout with strict mode enabled
- Global error handler — no stack traces exposed to clients

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict) |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MySQL via `mysql2/promise` (connection pool) |
| Validation | Zod |
| Env config | dotenv |
| Dev runner | tsx |

---

## Prerequisites

- Node.js v18+
- MySQL 8.x installed locally **or** an [Aiven](https://aiven.io) MySQL service
- npm

---

## Project Structure

```
school_management_api/
├── src/
│   ├── config/
│   │   └── db.ts                  # MySQL connection pool (local + Aiven, SSL auto-detect)
│   ├── controllers/
│   │   └── school.controller.ts   # addSchool + listSchools handlers
│   ├── middleware/
│   │   ├── errorHandler.ts        # Global error handler
│   │   └── validate.ts            # Reusable Zod validation middleware
│   ├── routes/
│   │   └── school.routes.ts       # Express router
│   ├── types/
│   │   └── school.types.ts        # School interface + Zod schemas
│   └── utils/
│       └── distance.ts            # Haversine formula
├── server.ts                      # App entry point
├── migrate.ts                     # Database migration script (run via npm run migrate)
├── schema.sql                     # Raw SQL for manual migration
├── .env.example                   # Environment variable template
├── School_Management_API.postman_collection.json
├── PLAN.md                        # Full implementation plan
└── README.md                      # This file
```

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd school_management_api
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables](#environment-variables) below). You can fill in both local and Aiven credentials at once — switching between them is just changing `DB_ENV`.

### 3. Run the database migration

```bash
npm run migrate
```

This creates the `schools` table on whichever database is currently active in `DB_ENV`. Run it once for local and once for Aiven (by flipping `DB_ENV` between runs).

> For local MySQL, the `school_management` database must exist first. Create it with:
> ```bash
> mysql -u root -p < schema.sql
> ```

### 4. Start the development server

```bash
npm run dev
```

The server starts at `http://localhost:3000`. On startup you'll see:

```
[DB] SSL: CA certificate not found — rejectUnauthorized: FALSE (encrypted but no cert verification)

[SERVER] Running on http://localhost:3000
[SERVER] DB_ENV = aiven

[DB] Connected to AIVEN MySQL at mysql-xxxx.aivencloud.com:12302
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production build |
| `npm run migrate` | Create `schools` table on the active database |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `3000`) |
| `NODE_ENV` | No | `development` or `production` |
| `DB_ENV` | Yes | `local` or `aiven` — selects which database to connect to |
| `LOCAL_DB_HOST` | If `DB_ENV=local` | Local MySQL host (usually `localhost`) |
| `LOCAL_DB_PORT` | If `DB_ENV=local` | Local MySQL port (usually `3306`) |
| `LOCAL_DB_USER` | If `DB_ENV=local` | Local MySQL user |
| `LOCAL_DB_PASSWORD` | If `DB_ENV=local` | Local MySQL password |
| `LOCAL_DB_NAME` | If `DB_ENV=local` | Local database name (e.g. `school_management`) |
| `AIVEN_DB_HOST` | If `DB_ENV=aiven` | Aiven MySQL hostname |
| `AIVEN_DB_PORT` | If `DB_ENV=aiven` | Aiven MySQL port |
| `AIVEN_DB_USER` | If `DB_ENV=aiven` | Aiven MySQL user (usually `avnadmin`) |
| `AIVEN_DB_PASSWORD` | If `DB_ENV=aiven` | Aiven MySQL password |
| `AIVEN_DB_NAME` | If `DB_ENV=aiven` | Aiven database name (usually `defaultdb`) |

### Switching between local and Aiven

Change one line in `.env`:

```env
DB_ENV=local    # use local MySQL
DB_ENV=aiven    # use Aiven Cloud MySQL
```

Both sets of credentials can live in `.env` simultaneously — no commenting/uncommenting needed.

### Aiven SSL (optional hardening)

By default the Aiven connection is encrypted but skips certificate verification. For full verification, download the CA cert from **Aiven Console → your MySQL service → Connection info → Download CA cert** and save it as `ca.pem` in the project root. The app detects it automatically on next start:

```
[DB] SSL: CA certificate found (ca.pem) — rejectUnauthorized: TRUE (full verification)
```

`ca.pem` is gitignored — never commit it.

---

## API Reference

### POST `/addSchool`

Adds a new school to the database.

**Request**
```http
POST /addSchool
Content-Type: application/json

{
  "name": "Green Valley School",
  "address": "123 Main Street, Delhi",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Validation Rules**
| Field | Type | Rules |
|---|---|---|
| `name` | string | Non-empty |
| `address` | string | Non-empty |
| `latitude` | number | Between -90 and 90 |
| `longitude` | number | Between -180 and 180 |

**201 Created**
```json
{
  "success": true,
  "message": "School added successfully",
  "data": {
    "id": 1,
    "name": "Green Valley School",
    "address": "123 Main Street, Delhi",
    "latitude": 28.6139,
    "longitude": 77.209
  }
}
```

**400 Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "name", "message": "Name is required" },
    { "field": "latitude", "message": "Latitude must be between -90 and 90" }
  ]
}
```

---

### GET `/listSchools`

Returns all schools sorted by distance (nearest first) from the provided coordinates.

**Request**
```http
GET /listSchools?latitude=28.6139&longitude=77.2090
```

**Query Parameters**
| Param | Type | Required |
|---|---|---|
| `latitude` | number | Yes |
| `longitude` | number | Yes |

**200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Green Valley School",
      "address": "123 Main Street, Delhi",
      "latitude": 28.6139,
      "longitude": 77.209,
      "created_at": "2026-05-20T11:58:36.000Z",
      "distance_km": 0
    },
    {
      "id": 3,
      "name": "Delhi Public School",
      "address": "Sector 45, Noida",
      "latitude": 28.5706,
      "longitude": 77.3216,
      "created_at": "2026-05-20T11:58:47.000Z",
      "distance_km": 12
    },
    {
      "id": 2,
      "name": "Sunrise Academy",
      "address": "456 Park Road, Gurgaon",
      "latitude": 28.4595,
      "longitude": 77.0266,
      "created_at": "2026-05-20T11:58:47.000Z",
      "distance_km": 24.74
    }
  ]
}
```

---

### GET `/health`

Verify the server is running.

```http
GET /health
```

```json
{ "success": true, "message": "Server is running" }
```

---

## Distance Calculation

Uses the **Haversine formula** to compute great-circle distance between two GPS coordinates. Results are in kilometres rounded to 2 decimal places.

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
distance = 6371 × c
```

---

## Postman Collection

Import `School_Management_API.postman_collection.json` via **Postman → Import → Upload File**.

The collection includes:
- `POST /addSchool` with success and validation error examples
- `GET /listSchools` with proximity-sorted response example
- `GET /health`
- A `{{baseUrl}}` variable — set it to `http://localhost:3000` for local or your deployed URL for production

---

## Deployment

1. Push the repo to GitHub
2. Create a new service on [Railway](https://railway.app) or [Render](https://render.com) and connect the repo
3. Set the following environment variables on the hosting platform:

```
PORT=3000
DB_ENV=aiven
AIVEN_DB_HOST=...
AIVEN_DB_PORT=...
AIVEN_DB_USER=...
AIVEN_DB_PASSWORD=...
AIVEN_DB_NAME=...
```

4. The platform will run `npm start` automatically after `npm run build`
