const fs = require('fs');
const pool = require('./src/db');
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'activity_logs'")
  .then(res => { fs.writeFileSync('schema.json', JSON.stringify(res.rows, null, 2)); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
