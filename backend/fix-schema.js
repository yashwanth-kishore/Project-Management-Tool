const pool = require('./src/db');

async function fix() {
  try {
    console.log('Attempting to fix tasks table schema (dropping constraints)...');
    
    // 1. Drop the foreign key constraint
    console.log('Dropping foreign key constraint tasks_assignee_fkey...');
    try {
      await pool.query('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assignee_fkey');
      console.log('✅ Constraint dropped (or did not exist).');
    } catch (err) {
      console.error('Failed to drop constraint:', err.message);
    }

    // 2. Alter assignee column type
    console.log('Altering assignee to VARCHAR(255)...');
    await pool.query('ALTER TABLE tasks ALTER COLUMN assignee TYPE VARCHAR(255) USING assignee::VARCHAR(255)');
    
    // 3. Set default value
    console.log('Setting default value for assignee...');
    await pool.query("ALTER TABLE tasks ALTER COLUMN assignee SET DEFAULT ''");

    console.log('✅ Schema fixed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fix failed:', err.message);
    process.exit(1);
  }
}

fix();
