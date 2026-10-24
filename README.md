# Hostel Room Allocation System

A full-stack web application for managing hostel room allocations in a college. Built as a mini-project using React.js, Node.js, Express.js, and MongoDB.

---

## Technologies Used

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Styling | Vanilla CSS |
| HTTP Client | Axios |
| Routing | React Router DOM |

---

## Main Features

- **Dashboard** — View total students, total rooms, occupied beds, and available beds at a glance.
- **Student Management** — Add, view, edit, and delete student records (ID, name, department, year, phone, email).
- **Room Management** — Add and manage rooms with bed capacity, floor, and type.
- **Room Allocation** — Allocate available rooms to students. Prevents duplicate allocations and blocks allocation when a room is full.
- **Vacate Room** — Students can vacate rooms; bed count updates automatically.
- **Search** — Search students and rooms by name, ID, department, room number, and more.
- **Input Validation** — Server-side validation with clear error messages.
- **Responsive Design** — Works on both desktop and mobile screens.

---

## Project Structure

```
hostel room allocation system/
├── backend/          # Node.js + Express API
│   ├── models/       # Mongoose schemas (Student, Room, Allocation)
│   ├── routes/       # REST API routes
│   ├── middleware/   # Error handler
│   └── server.js     # Entry point
└── frontend/         # React + Vite app
    └── src/
        ├── api/      # Axios instance
        ├── components/  # Reusable UI components
        └── pages/    # Dashboard, Students, Rooms, Allocations
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier is enough)

---

## Installation & Running Locally

### 1. Clone or download the project

```bash
git clone <your-repo-url>
cd "hostel room allocation system"
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder (use `.env.example` as reference):

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hosteldb?retryWrites=true&w=majority
NODE_ENV=development
```

> Replace `<username>` and `<password>` with your MongoDB Atlas credentials.

Start the backend server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

---

### 3. Set up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_URL` | Frontend URL for CORS (set in production) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

---

## Deployment (Render + MongoDB Atlas)

1. Push the project to a GitHub repository.
2. **Backend** — Create a new **Web Service** on [Render](https://render.com), point it to the `backend/` folder, set start command to `node server.js`, and add environment variables.
3. **Frontend** — Create a new **Static Site** on Render, point it to the `frontend/` folder, set build command to `npm run build`, and publish directory to `dist/`. Set `VITE_API_URL` to your backend Render URL.
4. Add your Render frontend URL to the backend's `FRONTEND_URL` environment variable so CORS works correctly.

---

## License

This project is intended for educational purposes as a college mini-project.
