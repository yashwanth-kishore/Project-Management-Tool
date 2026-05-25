const pool = require('./src/db');
pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5').then(res => {
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
