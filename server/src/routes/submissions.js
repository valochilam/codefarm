const express = require('express');
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Submit solution
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { problemId, code, language } = req.body;
    
    if (!problemId || !code || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate language
    const validLanguages = ['javascript', 'python', 'cpp', 'java', 'go', 'rust'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ error: 'Invalid language' });
    }
    
    await client.query('BEGIN');
    
    // Get problem
    const problemResult = await client.query(
      'SELECT id, aura_reward, hidden_test_cases FROM problems WHERE id = $1 AND is_published = true',
      [problemId]
    );
    
    if (problemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    const problem = problemResult.rows[0];
    
    // Create submission (in real app, this would be sent to a judge queue)
    // For MVP, we'll simulate a pending status
    const submissionResult = await client.query(
      `INSERT INTO submissions (user_id, problem_id, code, language, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id, status, created_at`,
      [req.user.id, problemId, code, language]
    );
    
    const submission = submissionResult.rows[0];
    
    // Update user's total submissions
    await client.query(
      'UPDATE users SET total_submissions = total_submissions + 1 WHERE id = $1',
      [req.user.id]
    );
    
    // Update problem's submission count
    await client.query(
      'UPDATE problems SET submission_count = submission_count + 1 WHERE id = $1',
      [problemId]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({
      id: submission.id,
      status: submission.status,
      createdAt: submission.created_at,
      message: 'Submission received. In production, this would be sent to a judge queue.'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit solution' });
  } finally {
    client.release();
  }
});

// Get submission by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT s.id, s.code, s.language, s.status, s.runtime_ms, s.memory_kb,
              s.error_message, s.test_results, s.created_at,
              p.title as problem_title, p.slug as problem_slug
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       WHERE s.id = $1 AND s.user_id = $2`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const submission = result.rows[0];
    
    res.json({
      id: submission.id,
      code: submission.code,
      language: submission.language,
      status: submission.status,
      runtimeMs: submission.runtime_ms,
      memoryKb: submission.memory_kb,
      errorMessage: submission.error_message,
      testResults: submission.test_results,
      createdAt: submission.created_at,
      problem: {
        title: submission.problem_title,
        slug: submission.problem_slug
      }
    });
    
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// Get user's submissions for a problem
router.get('/problem/:problemId', authenticateToken, async (req, res) => {
  try {
    const { problemId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    
    const result = await pool.query(
      `SELECT id, language, status, runtime_ms, memory_kb, created_at
       FROM submissions
       WHERE problem_id = $1 AND user_id = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [problemId, req.user.id, limit]
    );
    
    res.json(result.rows.map(s => ({
      id: s.id,
      language: s.language,
      status: s.status,
      runtimeMs: s.runtime_ms,
      memoryKb: s.memory_kb,
      createdAt: s.created_at
    })));
    
  } catch (error) {
    console.error('Get problem submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Simulate judge result (for MVP testing)
router.post('/:id/judge', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { status, runtimeMs, memoryKb } = req.body;
    
    await client.query('BEGIN');
    
    // Get submission
    const submissionResult = await client.query(
      `SELECT s.id, s.user_id, s.problem_id, p.aura_reward
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       WHERE s.id = $1 AND s.user_id = $2`,
      [id, req.user.id]
    );
    
    if (submissionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const submission = submissionResult.rows[0];
    
    // Update submission
    await client.query(
      `UPDATE submissions SET status = $1, runtime_ms = $2, memory_kb = $3 WHERE id = $4`,
      [status, runtimeMs, memoryKb, id]
    );
    
    // If accepted, update user stats and problem stats
    if (status === 'accepted') {
      // Check if already solved
      const solvedCheck = await client.query(
        'SELECT 1 FROM user_solved_problems WHERE user_id = $1 AND problem_id = $2',
        [req.user.id, submission.problem_id]
      );
      
      if (solvedCheck.rows.length === 0) {
        // First time solving - award aura
        await client.query(
          'UPDATE users SET aura = aura + $1, problems_solved = problems_solved + 1 WHERE id = $2',
          [submission.aura_reward, req.user.id]
        );
        
        await client.query(
          'UPDATE problems SET solved_count = solved_count + 1 WHERE id = $1',
          [submission.problem_id]
        );
        
        await client.query(
          'INSERT INTO user_solved_problems (user_id, problem_id, best_submission_id) VALUES ($1, $2, $3)',
          [req.user.id, submission.problem_id, id]
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.json({ status, message: 'Submission judged' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Judge error:', error);
    res.status(500).json({ error: 'Failed to judge submission' });
  } finally {
    client.release();
  }
});

module.exports = router;
