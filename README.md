# An Nahl Academy, Khulna

A simple full-stack school management demo application.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** Dummy JSON files (simulates MongoDB)
- **Charts:** Recharts
- **Routing:** React Router

---

## Workspace Structure

```
/client   # React + Vite frontend
/server   # Express backend API
```

## Running the App

### Option A (recommended): Run both frontend and backend together

```bash
npm install
npm run dev
```

This starts the backend API on `http://localhost:5001` and the frontend dev server on `http://localhost:5173`.

### Option B (run separately)

#### Backend

```bash
cd server
npm install
node index.js
```

The backend runs at `http://localhost:5001` and provides API routes:

- `POST /api/login`
- `GET /api/students`
- `GET /api/teachers`
- `GET /api/admins`

#### Frontend

```bash
cd client
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Notes

- The frontend pulls data from the backend via `src/services/api.js`.
- Dummy data lives in `server/data/*.json`.
- This project is designed for extension: add real database integration, authentication, role-based routes, and more.
