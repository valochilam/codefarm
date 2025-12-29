const express = require('express');
const pool = require('../db/pool');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all problems (paginated)
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;
    const difficulty = req.query.difficulty;
    const category = req.query.category;
    const search = req.query.search;
    
    let query = `
      SELECT DISTINCT p.id, p.title, p.slug, p.difficulty, p.aura_reward, 
             p.solved_count, p.submission_count, p.created_at
      FROM problems p
      LEFT JOIN problem_categories pc ON p.id = pc.problem_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.is_published = true
    `;
    const params = [];
    let paramIndex = 1;
    
    if (difficulty) {
      query += ` AND p.difficulty = $${paramIndex}`;
      params.push(difficulty);
      paramIndex++;
    }
    
    if (category) {
      query += ` AND c.name = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) 
      FROM problems p
      LEFT JOIN problem_categories pc ON p.id = pc.problem_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.is_published = true
    `;
    const countParams = [];
    let countParamIndex = 1;
    
    if (difficulty) {
      countQuery += ` AND p.difficulty = $${countParamIndex}`;
      countParams.push(difficulty);
      countParamIndex++;
    }
    
    if (category) {
      countQuery += ` AND c.name = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }
    
    if (search) {
      countQuery += ` AND (p.title ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      problems: result.rows.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        auraReward: p.aura_reward,
        solvedCount: p.solved_count,
        submissionCount: p.submission_count
      })),
      total: parseInt(countResult.rows[0].count)
    });
    
  } catch (error) {
    console.error('Problems list error:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description FROM categories ORDER BY name'
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single problem by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const result = await pool.query(
      `SELECT p.id, p.title, p.slug, p.description, p.difficulty, p.aura_reward,
              p.time_limit_ms, p.memory_limit_mb, p.input_format, p.output_format,
              p.constraints, p.sample_input, p.sample_output, p.solved_count, p.submission_count
       FROM problems p
       WHERE p.slug = $1 AND p.is_published = true`,
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    const problem = result.rows[0];
    
    // Get categories for this problem
    const categoriesResult = await pool.query(
      `SELECT c.name 
       FROM categories c
       JOIN problem_categories pc ON c.id = pc.category_id
       WHERE pc.problem_id = $1`,
      [problem.id]
    );
    
    res.json({
      id: problem.id,
      title: problem.title,
      slug: problem.slug,
      description: problem.description,
      difficulty: problem.difficulty,
      auraReward: problem.aura_reward,
      timeLimitMs: problem.time_limit_ms,
      memoryLimitMb: problem.memory_limit_mb,
      inputFormat: problem.input_format,
      outputFormat: problem.output_format,
      constraints: problem.constraints,
      sampleInput: problem.sample_input,
      sampleOutput: problem.sample_output,
      solvedCount: problem.solved_count,
      submissionCount: problem.submission_count,
      categories: categoriesResult.rows.map(c => c.name)
    });
    
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

module.exports = router;
