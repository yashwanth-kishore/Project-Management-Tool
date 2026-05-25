const fs = require('fs');
const path = require('path');
const pool = require('./src/db');

async function applyMigration() {
  try {
    console.log('Reading migration.sql...');
    const migrationFilePath = path.join(__dirname, 'src', 'migration.sql');
    const migrationSql = fs.readFileSync(migrationFilePath, 'utf8');

    console.log('Executing migration...');
    await pool.query(migrationSql);
    
    console.log('Migration applied successfully! 🚀');
    process.exit(0);
  } catch (err) {
    console.error('Error applying migration:', err.message);
    process.exit(1);
  }
}

applyMigration();
