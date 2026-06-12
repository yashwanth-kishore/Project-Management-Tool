const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });


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

// Root route
app.get("/", (req, res) => {
  res.send("PM Tool API running successfully 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
