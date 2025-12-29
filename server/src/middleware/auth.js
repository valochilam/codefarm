const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const result = await pool.query(
      'SELECT id, username, email, aura, problems_solved FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const result = await pool.query(
        'SELECT role FROM user_roles WHERE user_id = $1 AND role = $2',
        [req.user.id, role]
      );
      
      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Error checking permissions' });
    }
  };
};

module.exports = { authenticateToken, requireRole };
