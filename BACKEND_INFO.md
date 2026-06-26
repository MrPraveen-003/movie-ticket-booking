# CinePass Multiplex Booking Backend: Production Documentation
This document outlines the architecture, installation instructions, full API documentation, dynamic connection troubleshoot guide, and ready-to-use Postman collections for the CinePass backend.

---

## 📁 1. Backend Folder Structure
The backend is designed under a highly-cohesive, enterprise-grade MVC modular pattern inside the `/server` directory:

```text
/server
├── config/
│   └── db.ts             # Database configuration, dynamic retry logic, and DNS resolutions
├── controllers/
│   ├── authController.ts     # JWT Account Register, Login & session verification
│   ├── movieController.ts    # Movie CRUD controllers & custom seating triggers
│   ├── theatreController.ts  # Theatre CRUD endpoints with multi-screen setups
│   ├── showController.ts     # Showtime CRUD and seat reservation states
│   └── bookingController.ts  # Secure ticket billing transactions & QR generation
├── middleware/
│   ├── auth.ts           # Token verification and strict Administrator RBAC gates
│   └── errorHandler.ts   # Express Centralised Error Recovery and standard JSON formats
├── models/
│   ├── User.ts           # User schemas with crypted security hooks
│   ├── Movie.ts          # Movie details and duration properties
│   ├── Theatre.ts        # Theatre layouts and visual screening formats
│   ├── Show.ts           # Individual showtimes, base cost, and occupied tickets
│   └── Booking.ts        # Booking receipts, barcodes, total invoices, and dates
├── routes/
│   ├── index.ts          # Base unified router (groups all sub-routing endpoints)
│   ├── authRoutes.ts     # Accounts gateway
│   ├── movieRoutes.ts    # Movies catalogue
│   ├── theatreRoutes.ts  # Multiplex coordinates
│   ├── showRoutes.ts     # Active show scheduling
│   └── bookingRoutes.ts  # Transactions and histories
├── utils/
│   └── jwt.ts            # Secure token signers and validation
└── server.ts             # Express main entry, Vite SPA hosting, and listener initialization
```

---

## 🔌 2. MongoDB Atlas Connection Guide
We have engineered a robust database engine that solves local networking issues (including standard corporate firewalls and local querySrv DNS lookups). Here is how it functions under `/server/config/db.ts`:

### Key Features
1. **🚀 Automatic DNS Remediation**: If an Atlas `mongodb+srv://` connection is supplied, the server pre-empts custom local failures by calling `dns.setServers(['8.8.8.8', '1.1.1.1'])` using Node's standard DNS core. This completely resolves the **"querySrv ECONNREFUSED"** error.
2. **🔄 Exponential Retry Logic**: Automatically retries failed database handshakes (up to 3 attempts with a 3-second delay) before selecting the offline database fallback.
3. **🌱 Immersive Seeding Engine**: Automates collection population (seed mock users, movies, theaters, and scheduled times) if Mongoose is initialized empty.

### How to set up Atlas free cluster:
1. Create a free Sandbox Cluster at [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Go to **Network Access** -> click **Add IP Address** -> Select **Allow Access from Anywhere (0.0.0.0/0)** to bypass firewall blocks.
3. Go to **Database Access** -> create a database user with password (select **Read and Write to any Database**).
4. Click **Connect** -> Choose **Drivers** -> Copy the connection URI:
   ```env
   # Replace <username>, <password>, and <cluster-url>
   MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/cinepass?retryWrites=true&w=majority"
   ```
5. Apply this value in your environment secrets or `.env` file.

---

## 🔐 3. Authentication & Authorization Flow
- **Encryption**: Uses `bcryptjs` with `10 rounds` of salty entropy on registration.
- **Tokens**: Uses `jsonwebtoken` carrying payload claims for `{ id, email, role }` signed with `JWT_SECRET`. Tokens expire in 24 hours.
- **RBAC Gating**:
  - `protect`: Asserts active, valid headers on incoming HTTP requests (`Authorization: Bearer <JWT_TOKEN>`).
  - `adminOnly`: Intercepts claims and rejects non-admin users with an immediate standard `403 Forbidden` response.

---

## 📡 4. Comprehensive API endpoint Documentation

### 🔑 Authentication (`/api/auth`)
* **POST `/api/auth/register`**: Creates a new CinePass user profile.
  ```json
  { "name": "Alice Smith", "email": "alice@example.com", "password": "password123" }
  ```
* **POST `/api/auth/login`**: Authenticate profile and issue fresh JWT.
  ```json
  { "email": "alice@example.com", "password": "password123" }
  ```
* **GET `/api/auth/me`**: Get full logged-in session account profile. (Requires JWT Header).

---

### 🎬 Movies (`/api/movies`)
* **GET `/api/movies`**: Retrieve a list of all active movies.
* **GET `/api/movies/:id`**: Fetch movie metadata alongside its scheduled upcoming showtimes.
* **POST `/api/movies`** (Admin): Insert fresh movie detail and auto-seed showtimes.
  ```json
  {
    "title": "Gladiator II",
    "genre": ["Action", "Drama", "History"],
    "poster": "https://url-to-poster-img.com/poster.jpg",
    "description": "The sequel to the legendary historical blockbuster.",
    "duration": 150,
    "releaseDate": "2026-11-22",
    "language": "English",
    "rating": 4.8
  }
  ```
* **PUT `/api/movies/:id`** (Admin): Edit movie metadata parameters.
* **DELETE `/api/movies/:id`** (Admin): Remove movie and wipe scheduled shows from the listings.

---

### 🏢 Theatres (`/api/theatres`)
* **GET `/api/theatres`**: List available theater branches.
* **POST `/api/theatres`** (Admin): Build a theater branch coordinates.
  ```json
  { "name": "Dolby LUXE Suite", "location": "Hollywood Blv", "screens": ["Luxe Screen", "Onyx LED"] }
  ```
* **PUT `/api/theatres/:id`** (Admin): Edit theater screens or address location notes.
* **DELETE `/api/theatres/:id`** (Admin): Remove theater branch and associated screenings.

---

### 🎟️ Scheduled Shows (`/api/shows`)
* **GET `/api/shows`**: Query schedules by `movieId` or `date` query params.
* **GET `/api/shows/:id`**: Query specific show with full room seat listings and occupancy status.
* **POST `/api/shows`** (Admin): Host a show slot under a specific theater, date and screen.
  ```json
  { "movieId": "movie-id-string", "theatreId": "theatre-id-string", "screen": "Screen A", "date": "2026-06-03", "time": "18:00", "price": 14 }
  ```
* **DELETE `/api/shows/:id`** (Admin): Cancel scheduled showtime.

---

### 💳 Bookings (`/api/bookings`)
* **POST `/api/bookings`**: Pay billing fees and securely lock seats. (Requires User Header).
  ```json
  { "showId": "selected-show-id", "seats": ["C3", "C4"] }
  ```
* **GET `/api/bookings/my`**: Query personal ticketing qr pass archives. (Requires User Header).
* **GET `/api/bookings`** (Admin): View global auditorium invoice and sales registers.

---

## 📬 5. Postman Collection Template

Below is a complete, standard Postman JSON collection. To use:
1. Save the JSON code snippet below into a file called `cinepass.postman_collection.json`.
2. Open Postman -> click **Import** -> select `cinepass.postman_collection.json` and hit OK.
3. Configure the `base_url` variable in your collection to point to `http://localhost:3000` (or your service URL).

```json
{
  "info": {
    "name": "CinePass Movie Ticket Booking API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "User Registration",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Alice Test\",\n  \"email\": \"alice@cinepass.com\",\n  \"password\": \"alicepass\"\n}"
            },
            "url": { "raw": "{{base_url}}/api/auth/register", "host": ["{{base_url}}"], "path": ["api", "auth", "register"] }
          }
        },
        {
          "name": "User Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "var jsonData = pm.response.json();",
                  "if (jsonData.token) {",
                  "    pm.collectionVariables.set(\"jwt_token\", jsonData.token);",
                  "}"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"alice@cinepass.com\",\n  \"password\": \"alicepass\"\n}"
            },
            "url": { "raw": "{{base_url}}/api/auth/login", "host": ["{{base_url}}"], "path": ["api", "auth", "login"] }
          }
        },
        {
          "name": "Get Profile details",
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "Bearer {{jwt_token}}" }
            ],
            "url": { "raw": "{{base_url}}/api/auth/me", "host": ["{{base_url}}"], "path": ["api", "auth", "me"] }
          }
        }
      ]
    },
    {
      "name": "Movies",
      "item": [
        {
          "name": "Get All Movies",
          "request": {
            "method": "GET",
            "url": { "raw": "{{base_url}}/api/movies", "host": ["{{base_url}}"], "path": ["api", "movies"] }
          }
        },
        {
          "name": "Create a New Movie (Admin)",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{jwt_token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Interstellar Chronicles\",\n  \"genre\": \"Sci-Fi, Adventure\",\n  \"poster\": \"https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600\",\n  \"description\": \"A professional space odysseys journey through black hole realms.\",\n  \"duration\": 150,\n  \"releaseDate\": \"2026-06-02\",\n  \"rating\": 5.0\n}"
            },
            "url": { "raw": "{{base_url}}/api/movies", "host": ["{{base_url}}"], "path": ["api", "movies"] }
          }
        }
      ]
    },
    {
      "name": "Bookings",
      "item": [
        {
          "name": "Book Seats and Tickets",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{jwt_token}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"showId\": \"show-1\",\n  \"seats\": [\"C5\", \"C6\"]\n}"
            },
            "url": { "raw": "{{base_url}}/api/bookings", "host": ["{{base_url}}"], "path": ["api", "bookings"] }
          }
        },
        {
          "name": "Get My Booking Histories",
          "request": {
            "method": "GET",
            "header": [
              { "key": "Authorization", "value": "Bearer {{jwt_token}}" }
            ],
            "url": { "raw": "{{base_url}}/api/bookings/my", "host": ["{{base_url}}"], "path": ["api", "bookings", "my"] }
          }
        }
      ]
    }
  ],
  "variable": [
    { "key": "base_url", "value": "http://localhost:3000", "type": "string" },
    { "key": "jwt_token", "value": "", "type": "string" }
  ]
}
```
