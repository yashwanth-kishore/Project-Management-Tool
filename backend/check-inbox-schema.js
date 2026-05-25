const pool = require('./src/db');

async function inspect() {
  try {
    console.log('--- Invites Table Schema ---');
    const invites = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'invites'
      ORDER BY ordinal_position
    `);
    invites.rows.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));

    console.log('\n--- Tasks Table Schema ---');
    const tasks = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tasks'
      ORDER BY ordinal_position
    `);
    tasks.rows.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));

    process.exit(0);
  } catch (err) {
    console.error('Inspection failed:', err.message);
    process.exit(1);
  }
}

inspect();
