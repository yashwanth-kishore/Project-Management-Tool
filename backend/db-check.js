const pool = require('./src/db');

async function check() {
  try {
    const w = await pool.query('SELECT * FROM workspaces');
    console.log("Workspaces count:", w.rows.length);
    const p = await pool.query('SELECT * FROM projects');
    console.log("Projects count:", p.rows.length);
    const t = await pool.query('SELECT * FROM tasks');
    console.log("Tasks count:", t.rows.length);
    const u = await pool.query('SELECT * FROM users');
    console.log("Users count:", u.rows.length);
    
    // Check if the first user's workspaces are intact
    if (u.rows.length > 0) {
      const u1 = u.rows[0];
      const uw = await pool.query('SELECT * FROM workspaces WHERE owner_id = $1', [u1.id]);
      console.log(`Workspaces for user ${u1.id}:`, uw.rows.length);
    }
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
