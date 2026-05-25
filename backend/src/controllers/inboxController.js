const pool = require("../db");

exports.getInbox = async (req, res) => {
  try {
    const userId = req.user.id;

    const userRes = await pool.query("SELECT name, email FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) return res.status(404).json("User not found");
    const userName = userRes.rows[0].name;

    const tasksRes = await pool.query(
      "SELECT t.id, t.title as text, p.name as from_name, 'task' as type " +
      "FROM tasks t " +
      "JOIN projects p ON t.project_id = p.id " +
      "WHERE t.assignee = $1 AND t.status != 'done'",
      [userName]
    );

    const assignedTasks = tasksRes.rows.map(row => ({
      id: "task_" + row.id,
      text: "Assigned to task: " + row.text,
      from: row.from_name,
      type: "received"
    }));

    const sentRes = await pool.query(
      "SELECT i.id, i.email as to_email, i.status, w.name as workspace_name " +
      "FROM invites i " +
      "JOIN workspaces w ON i.workspace_id = w.id " +
      "JOIN workspace_members wm ON wm.workspace_id = w.id " +
      "WHERE wm.user_id = $1 AND wm.role = 'Admin' AND i.status = 'pending' " +
      "ORDER BY i.created_at DESC",
      [userId]
    );

    const sentInvites = sentRes.rows.map(row => ({
      id: "invite_" + row.id,
      text: "Invite to workspace: " + row.workspace_name + " (" + row.status + ")",
      to: row.to_email,
      type: "sent"
    }));

    res.json({
      received: assignedTasks,
      sent: sentInvites
    });

  } catch (err) {
    console.error("Inbox error:", err);
    res.status(500).json(err.message);
  }
};
