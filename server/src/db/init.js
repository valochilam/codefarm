require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Initializing CODE_FARM database...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created: users, user_roles, categories, problems, problem_categories, submissions, user_solved_problems');
    console.log('📈 Views created: leaderboard');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
