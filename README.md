# CinePass Movie Ticket Booking App

CinePass is a full-stack movie ticket booking experience for browsing movies, selecting seats, completing checkout, and managing bookings from both customer and admin perspectives. The application combines a React-based front end with an Express server and a JSON/MongoDB-backed data layer while preserving the existing user experience.

## Features

- Browse featured movies and movie details
- View showtimes and theatre information
- Select seats and complete a checkout flow
- Track personal booking history in a user dashboard
- Access an admin dashboard for managing movies, theatres, shows, and bookings
- Secure authentication and role-based access for customers and administrators

## Tech Stack

- React and React Router for the client experience
- Tailwind CSS and motion-based UI transitions
- Express for the API layer
- Mongoose with a fallback JSON data store for persistence
- TypeScript for type safety across the app

## Project Structure

- src/ contains the React application and page components
- server/ contains the Express routes, controllers, middleware, and database setup
- data/ stores the local JSON database fallback
- db.ts provides the shared JSON database implementation used by the server

## Installation

1. Install Node.js 18+.
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template and adjust values if needed:
   ```bash
   cp .env.example .env
   ```
4. Optionally configure MongoDB by setting MONGODB_URI in the environment file. If it is not set, the app falls back to the local JSON database.

## Usage

Start the development server:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

Build for production:

```bash
npm run build
```

Run the production build:

```bash
npm start
```

## Authentication Notes

Seeded demo accounts are available in the local data store:

- Admin: admin@cinepass.com / admin123
- Customer: user@cinepass.com / user123

If you connect MongoDB, the app will use that data source instead of the local fallback.
