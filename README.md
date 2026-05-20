# School Management API

A RESTful API built with **Node.js**, **TypeScript**, **Express.js**, and **MySQL** to manage school data. Supports adding schools and retrieving them sorted by proximity to any user-specified location using the Haversine formula.

---

## Features

- `POST /addSchool` — Add a new school with full input validation
- `GET /listSchools` — Fetch all schools sorted by distance from user's coordinates
- Dual database support — switch between **local MySQL** and **Aiven Cloud MySQL** via a single env variable
- Structured JSON responses with proper HTTP status codes
- TypeScript throughout with strict mode enabled

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
│   │   └── db.ts                  # MySQL connection pool (local + Aiven)
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
├── schema.sql                     # Database migration script
├── .env.example                   # Environment variable template
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

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set the variables for your chosen database (see [Environment Variables](#environment-variables) section below).

### 3. Run the database migration

#### Local MySQL

```bash
mysql -u root -p < schema.sql
```

This creates the `school_management` database and the `schools` table.

#### Aiven MySQL

Log in to your [Aiven Console](https://console.aiven.io), open your MySQL service, go to **Query editor** or connect via CLI:

```bash
mysql --host=<AIVEN_DB_HOST> --port=<AIVEN_DB_PORT> --user=avnadmin --password=<AIVEN_DB_PASSWORD> --ssl-mode=REQUIRED defaultdb < schema.sql
```

> On Aiven the database already exists as `defaultdb`, so the `CREATE DATABASE` line is skipped automatically.

### 4. Run the development server

```bash
npm run dev
```

The server starts at `http://localhost:3000` (or the PORT you set).

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

Just change one line in your `.env`:

```env
DB_ENV=local    # use local MySQL
DB_ENV=aiven    # use Aiven Cloud MySQL
```

No other changes needed — both sets of credentials can coexist in `.env`.

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
    "longitude": 77.2090
  }
}
```

**400 Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "latitude", "message": "Number must be >= -90" }
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
      "longitude": 77.2090,
      "distance_km": 0.0
    },
    {
      "id": 2,
      "name": "Sunrise Academy",
      "address": "456 Park Road, Gurgaon",
      "latitude": 28.4595,
      "longitude": 77.0266,
      "distance_km": 24.7
    }
  ]
}
```

---

## Distance Calculation

Uses the **Haversine formula** to compute great-circle distance between two GPS coordinates. Results are in kilometres and rounded to 2 decimal places.

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
distance = 6371 × c
```

---

## Build for Production

```bash
npm run build      # compiles TypeScript → dist/
npm start          # runs dist/server.js
```

---

## Postman Collection

A Postman collection with example requests for both endpoints is available in the repository as `School_Management_API.postman_collection.json`.

Import it via **Postman → Import → Upload File**.
