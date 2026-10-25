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

- **Admin & Warden Authentication** — Secure JWT-based login with bcrypt password hashing, session persistence, protected routes, and quick 1-click evaluation access.
  - **Default Admin Login**: Username: `admin` | Password: `admin123`
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

## Free Cloud Deployment Guide

### Architecture Overview

| Component | Platform | Free Tier |
|---|---|---|
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | Free forever (M0 512MB) |
| **Backend API** | [Render](https://render.com) | Free Web Service (Node.js) |
| **Frontend UI** | [Vercel](https://vercel.com) (or Render Static Site) | Free & ultra-fast for React/Vite |

---

### Step 1: Set up MongoDB Atlas (Free Cloud Database)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Shared Cluster (M0 Free)**.
3. Under **Security → Database Access**, create a user (e.g. `admin`) and set a secure password.
4. Under **Security → Network Access**, click **Add IP Address** → Choose **Allow Access from Anywhere (`0.0.0.0/0`)** and confirm.
5. In **Database → Clusters**, click **Connect** → **Drivers** (Node.js). Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hosteldb?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your credentials).*

---

### Step 2: Deploy Backend to Render (Free Web Service)

1. Sign up / Log in to [Render](https://render.com) using your GitHub account.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`hostel-room-allocation-system`).
4. Configure the service settings:
   - **Name**: `hostel-room-backend` (or your preferred name)
   - **Region**: Choose the closest region (e.g. Singapore, Frankfurt, Oregon)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add:
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
   - `MONGO_URI` = *(your MongoDB Atlas connection string from Step 1)*
   - `FRONTEND_URL` = `*` *(or your Vercel URL once frontend is deployed)*
6. Click **Deploy Web Service**.
7. Once deployment finishes, copy your live backend URL (e.g. `https://hostel-room-backend.onrender.com`).
   - Open that URL in your browser: you should see `{"status":"ok","message":"Hostel Room Allocation API is running 🚀"}`.

---

### Step 3: Deploy Frontend to Vercel (Recommended, Free)

1. Sign up / Log in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-backend-name.onrender.com/api`
   *(Be sure to append `/api` at the end and use your actual Render backend URL!)*
6. Click **Deploy**.
7. Your frontend is now live at `https://your-project.vercel.app`!

*(Optional Step)*: Return to your backend settings on Render, update `FRONTEND_URL` to your live Vercel domain (e.g., `https://your-project.vercel.app`), and click save.

---

### Alternative: Deploy Frontend on Render (Static Site)

If you prefer keeping everything inside Render:
1. On Render, click **New +** → **Static Site**.
2. Connect your GitHub repo.
3. Set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. In Environment Variables, add:
   - `VITE_API_URL` = `https://your-backend-name.onrender.com/api`
5. Click **Create Static Site**.

---

## License

This project is intended for educational purposes as a college mini-project.
