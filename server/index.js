require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();
const PORT = process.env.PORT || 5000;


/* MIDDLEWARE */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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


/* ROUTES */
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'TaskFlow server is running' });
});

const taskRoutes = require('./routes/tasks');
app.use('/api/tasks', taskRoutes);


/* START SERVER */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});