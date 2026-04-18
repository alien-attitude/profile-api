# Profiles API 

A REST API that enriches a name with gender, age, and nationality data from three free external APIs, stores the result in MongoDB, and exposes full CRUD endpoints.

---

## Tech Stack

| Layer       | Choice                     |
|-------------|----------------------------|
| Runtime     | Node.js                    |
| Framework   | Express.js                 |
| Database    | MongoDB + Mongoose         |
| ID scheme   | UUID v7 (time-sortable)    |
| HTTP client | Axios                      |

---

## Project Structure

```
profiles-api/
├── src/
│   ├── config/
│   │   └── env.js                  # Environment handlers
│   ├── controllers/
│   │   └── profile.controller.js   # Route handlers
|   ├── database/
│   │   └── mongodb.js              # MongoDB connection
│   ├── models/
│   │   └── profile.model.js        # Mongoose schema
│   ├── routes/
│   │   └── profile.route.js         # Express router
│   ├── services/
│   │   └── externalApis.service.js     # Genderize / Agify / Nationalize
│   ├── app.js                  # Express app setup
│   └── server.js               # Entry point
├── .env.development.local
├── package.json
└── README.md
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.development.local 
```

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/profiles_db
PORT=3000
```

For MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/profiles_db?retryWrites=true&w=majority
```

### 3. Start the server
```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

---

## API Reference

### POST `/api/profiles`
Creates a profile by calling three external APIs. Returns the existing profile if the name was already stored.

**Request body:**
```json
{ "name": "ella" }
```

**201 Created (new profile):**
```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DK",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00.000Z"
  }
}
```

**200 OK (duplicate):**
```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { "...existing profile..."}
}
```

---

### GET `/api/profiles`
Returns all profiles. Supports optional case-insensitive query filters.

**Query params:** `gender`, `country_id`, `age_group`

```
GET /api/profiles?gender=female&country_id=NG
```

**200 OK:**
```json
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "id": "...",
      "name": "ella",
      "gender": "female",
      "age": 46,
      "age_group": "adult",
      "country_id": "DK"
    }
  ]
}
```

---

### GET `/api/profiles/:id`
Returns a single full profile by its UUID.

**200 OK:**
```json
{
  "status": "success",
  "data": { "...full profile..."}
}
```

**404 Not Found:**
```json
{ "status": "error", "message": "Profile not found" }
```

---

### DELETE `/api/profiles/:id`
Deletes a profile. Returns `204 No Content` on success.

---

## Error Responses

| Status | Scenario                              |
|--------|---------------------------------------|
| 400    | Missing or empty `name`               |
| 422    | `name` is not a string                |
| 404    | Profile ID not found                  |
| 502    | External API returned invalid data    |
| 500    | Internal server error                 |

**502 format:**
```json
{ "status": "error", "message": "Genderize returned an invalid response" }
```

---

## Classification Rules

| Age range | Group       |
|-----------|-------------|
| 0 – 12    | `child`     |
| 13 – 19   | `teenager`  |
| 20 – 59   | `adult`     |
| 60+       | `senior`    |

Nationality is the `country_id` with the highest `probability` from the Nationalize API.

---

## Deployment (Render / Railway / Fly.io)

1. Push code to GitHub
2. Create a new Web Service, point to repo
3. Set environment variables:
    - `MONGODB_URI` — your Atlas connection string
    - `PORT` — (usually auto-set by the platform)
4. Start command: `npm start`

The server binds to `0.0.0.0` automatically via Express default behaviour.

