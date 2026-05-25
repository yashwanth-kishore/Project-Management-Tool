const pool = require('./src/db');

async function inspect() {
  try {
    console.log('--- Full Tasks Table Schema ---');
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tasks'
      ORDER BY ordinal_position
    `);
    columns.rows.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));

    console.log('--- Column Details for "assignee" ---');
    const assigneeCol = columns.rows.find(c => c.column_name === 'assignee');
    if (assigneeCol) {
      console.log(`Assignee Column Type: ${assigneeCol.data_type}`);
    } else {
      console.log('Assignee column NOT FOUND (Wait, how did the manual insert fail on it then?)');
    }

    process.exit(0);
  } catch (err) {
    console.error('Inspection failed:', err.message);
    process.exit(1);
  }
}

inspect();
