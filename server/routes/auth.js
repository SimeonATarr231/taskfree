// server/routes/auth.js

const express = require('express');

// express.Router() creates a mini-app for handling a group of routes
// Instead of defining everything in index.js, we organize by feature
const router = express.Router();

const bcrypt = require('bcrypt');
const db = require('../db');

// How many times bcrypt scrambles the password
// Higher = more secure but slower. 10 is the industry standard
const SALT_ROUNDS = 10;

// ─── REGISTER ─────────────────────────────────────────────────
// POST /api/auth/register
router.post('/register', async (req, res) => {

  // Destructure the data the frontend sent us
  const { username, email, password } = req.body;

  // Basic validation - never trust frontend input
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password - await because bcrypt is async
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert the new user into the database
    const result = db.prepare(`
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `).run(username, email, hashedPassword);

    // Create a session for the new user - log them in automatically
    req.session.userId = result.lastInsertRowid;
    req.session.username = username;

    res.status(201).json({
      message: 'Account created successfully',
      user: { id: result.lastInsertRowid, username }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────
// POST /api/auth/login
router.post('/login', async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find the user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    // Don't tell them specifically if email or password is wrong
    // Saying "email not found" helps hackers know which emails exist
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare submitted password against stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Password correct - create session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ─── LOGOUT ───────────────────────────────────────────────────
// POST /api/auth/logout
router.post('/logout', (req, res) => {

  // Destroy the session on the server
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    // Clear the cookie from the browser
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// ─── GET CURRENT USER ─────────────────────────────────────────
// GET /api/auth/me
// Frontend uses this to check if user is already logged in
router.get('/me', (req, res) => {
  if (req.session.userId) {
    res.json({
      loggedIn: true,
      user: { id: req.session.userId, username: req.session.username }
    });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;