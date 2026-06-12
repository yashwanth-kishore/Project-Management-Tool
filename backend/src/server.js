const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const pool = require("./db");


const express = require("express");
const cors = require("cors");

// Import routes
const inviteRoutes = require("./invites/inviteRoutes");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const memberRoutes = require("./routes/memberRoutes");
const commentRoutes = require("./routes/commentRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const activityRoutes = require("./routes/activityRoutes");
const inboxRoutes = require("./routes/inboxRoutes");

const app = express();

// ✅ Updated CORS setup
const allowedOrigins = [
  "http://localhost:3000",              // local React dev (legacy/fallback)
  "http://localhost:5173",              // local Vite React dev
  "http://127.0.0.1:5173",              // local Vite React dev IP
  "https://stratify7.vercel.app"        // deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl/Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());

// Routes
app.use("/api", inviteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/inbox", inboxRoutes);

// Debug route for Render deployment troubleshooting
app.get("/api/debug", async (req, res) => {
  try {
    const diagnostics = {
      databaseUrlDefined: !!process.env.DATABASE_URL,
      jwtSecretDefined: !!process.env.JWT_SECRET,
      envKeys: Object.keys(process.env).filter(k => 
        !k.toLowerCase().includes("pass") && 
        !k.toLowerCase().includes("secret") && 
        !k.toLowerCase().includes("key") &&
        !k.toLowerCase().includes("url")
      ),
    };

    if (process.env.DATABASE_URL) {
      try {
        const dbRes = await pool.query("SELECT NOW()");
        diagnostics.dbConnection = "SUCCESS";
        diagnostics.dbTime = dbRes.rows[0].now;

        // Check tables
        const tablesRes = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
        `);
        diagnostics.tables = tablesRes.rows.map(r => r.table_name);
      } catch (dbErr) {
        diagnostics.dbConnection = "FAILED";
        diagnostics.dbError = dbErr.message;
      }
    } else {
      diagnostics.dbConnection = "NOT_CONFIGURED";
    }

    res.json(diagnostics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("PM Tool API running successfully 🚀");
});

// Automatically initialize database schema at startup
async function initDb() {
  try {
    const schemaPath = path.resolve(__dirname, "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf8");
      await pool.query(sql);
      console.log("✅ Database schema auto-initialized successfully!");
    } else {
      console.warn("⚠️ schema.sql not found, skipping DB auto-initialization");
    }
  } catch (err) {
    console.error("❌ Database schema auto-initialization failed:", err.message);
  }
}

initDb().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

