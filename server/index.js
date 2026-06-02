require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

// Import our database connection
const db = require('./db');

// Set up SQLite session store
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────

// Parse incoming JSON requests
app.use(express.json());

// Parse form submissions
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// Set up sessions
app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: '.' }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
    secure: false,       
    httpOnly: true,     
    maxAge: 1000 * 60 * 60 * 24 * 7 
  }
}));

// ─── ROUTES ──────────────────────────────────────────────────

// Import and use auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'TaskFlow server is running' });
});

const taskRoutes = require('./routes/tasks');
app.use('/api/tasks', taskRoutes);

// ─── START SERVER ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});