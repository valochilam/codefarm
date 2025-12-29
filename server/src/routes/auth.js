const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email, aura, problems_solved, created_at`,
      [username, email, passwordHash]
    );
    
    const user = result.rows[0];
    
    // Assign default role
    await pool.query(
      'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
      [user.id, 'user']
    );
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        aura: user.aura,
        problemsSolved: user.problems_solved
      },
      token
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const result = await pool.query(
      'SELECT id, username, email, password_hash, aura, problems_solved FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        aura: user.aura,
        problemsSolved: user.problems_solved
      },
      token
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.aura, u.problems_solved, u.total_submissions, u.created_at,
              COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}') as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );
    
    const user = result.rows[0];
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      aura: user.aura,
      problemsSolved: user.problems_solved,
      totalSubmissions: user.total_submissions,
      roles: user.roles,
      createdAt: user.created_at
    });
    
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

module.exports = router;
