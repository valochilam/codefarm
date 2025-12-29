const express = require('express');
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    
    const result = await pool.query(
      'SELECT * FROM leaderboard LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    
    res.json({
      users: result.rows.map(row => ({
        id: row.id,
        username: row.username,
        aura: row.aura,
        problemsSolved: row.problems_solved,
        totalSubmissions: row.total_submissions,
        rank: parseInt(row.rank)
      })),
      total: parseInt(countResult.rows[0].count)
    });
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user profile by username
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const userResult = await pool.query(
      `SELECT u.id, u.username, u.aura, u.problems_solved, u.total_submissions, u.created_at,
              (SELECT rank FROM leaderboard WHERE id = u.id) as rank
       FROM users u
       WHERE u.username = $1`,
      [username]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get recent submissions
    const submissionsResult = await pool.query(
      `SELECT s.id, s.status, s.language, s.created_at, p.title, p.slug
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 10`,
      [user.id]
    );
    
    // Get solved problems
    const solvedResult = await pool.query(
      `SELECT p.id, p.title, p.slug, p.difficulty, p.aura_reward, usp.first_solved_at
       FROM user_solved_problems usp
       JOIN problems p ON usp.problem_id = p.id
       WHERE usp.user_id = $1
       ORDER BY usp.first_solved_at DESC`,
      [user.id]
    );
    
    res.json({
      id: user.id,
      username: user.username,
      aura: user.aura,
      problemsSolved: user.problems_solved,
      totalSubmissions: user.total_submissions,
      rank: parseInt(user.rank),
      createdAt: user.created_at,
      recentSubmissions: submissionsResult.rows,
      solvedProblems: solvedResult.rows
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get current user's rank
router.get('/my-rank', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT rank FROM leaderboard WHERE id = $1',
      [req.user.id]
    );
    
    res.json({ rank: result.rows[0]?.rank || null });
    
  } catch (error) {
    console.error('My rank error:', error);
    res.status(500).json({ error: 'Failed to fetch rank' });
  }
});

module.exports = router;
