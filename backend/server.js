const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/students', require('./routes/students'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/allocations', require('./routes/allocations'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hostel API is running' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(require('./middleware/errorHandler'));

// ─── Database & Server ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌  MONGO_URI is not defined in .env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀  Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
