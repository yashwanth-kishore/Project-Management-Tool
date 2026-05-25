const pool = require('./src/db');

async function testInsert() {
  try {
    const projects = await pool.query('SELECT id FROM projects LIMIT 1');
    if (projects.rows.length === 0) {
      console.log('No projects, skipping manual insert test.');
      process.exit(0);
    }
    const pid = projects.rows[0].id;

    console.log(`Testing insertion for project ${pid}...`);
    const res = await pool.query(
      `INSERT INTO tasks
      (title, description, priority, status, assignee, due_date, project_id)
      VALUES($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      ['Final Test Task', 'Checking if it really works', 'high', 'todo', 'TestUser', null, pid]
    );
    console.log('✅ Final Test Insertion SUCCESSFUL!');
    console.log('Created Task:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('❌ Final Test Insertion FAILED:', err.message);
    process.exit(1);
  }
}

testInsert();
