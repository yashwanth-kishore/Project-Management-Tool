const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function runSchema() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      console.error("❌ schema.sql file not found!");
      process.exit(1);
    }

    console.log("Reading schema.sql...");
    const sql = fs.readFileSync(schemaPath, "utf8");

    console.log("Executing SQL schema...");
    await pool.query(sql);

    console.log("✅ Database schema initialized successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to run database schema:", err.message);
    process.exit(1);
  }
}

runSchema();
