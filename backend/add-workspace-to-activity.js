const pool = require('./src/db');

async function migrate() {
  try {
    console.log("Checking for workspace_id column in activity_logs...");
    const check = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='activity_logs' AND column_name='workspace_id'");
    
    if (check.rows.length === 0) {
      console.log("Adding workspace_id column...");
      await pool.query("ALTER TABLE activity_logs ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE");
      
      console.log("Backfilling workspace_ids for existing activities linking to projects...");
      await pool.query(`
        UPDATE activity_logs al
        SET workspace_id = p.workspace_id
        FROM projects p
        WHERE al.project_id = p.id AND al.workspace_id IS NULL
      `);
      console.log("Migration complete.");
    } else {
      console.log("Column already exists. Skipping.");
    }
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
