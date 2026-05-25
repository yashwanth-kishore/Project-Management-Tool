const pool = require('../db');

exports.logActivity = async (userId, action, projectId = null, workspaceId = null) => {
  try {
    let finalWorkspaceId = workspaceId;
    if (!finalWorkspaceId && projectId) {
      const projectRes = await pool.query("SELECT workspace_id FROM projects WHERE id = $1", [projectId]);
      if (projectRes.rows.length > 0) {
        finalWorkspaceId = projectRes.rows[0].workspace_id;
      }
    }

    if (!finalWorkspaceId) {
      console.warn("logActivity warning: missing workspaceId for action:", action);
    }

    await pool.query(
      `INSERT INTO activity_logs (user_id, action, project_id, workspace_id)
       VALUES ($1, $2, $3, $4)`,
      [userId, action, projectId, finalWorkspaceId]
    );
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};
