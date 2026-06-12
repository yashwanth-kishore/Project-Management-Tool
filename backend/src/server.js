require("dotenv").config();

const express = require("express");
const cors = require("cors");
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



app.use(cors({
  origin: "https://stratify7.vercel.app",
  credentials: true
}));
app.use(express.json());
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



app.get("/", (req, res) => {
  res.send("PM Tool API running successfully 🚀");
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});