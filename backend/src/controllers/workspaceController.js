const pool = require("../db");
const { logActivity } = require("../utils/activityLogger");

exports.createWorkspace = async (req, res) => {
  try {

    const { name } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json("Not authorized");
    }

    const owner_id = req.user.id;

    const workspace = await pool.query(
      `INSERT INTO workspaces(name,owner_id)
       VALUES($1,$2)
       RETURNING *`,
      [name, owner_id]
    );

    const ws = workspace.rows[0];

    // Auto-add creator as Admin member
    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, 'Admin')
       ON CONFLICT (workspace_id, user_id) DO NOTHING`,
      [ws.id, owner_id]
    );

    await logActivity(owner_id, `Created workspace '${ws.name}'`, null, ws.id);

    res.json({ ...ws, user_role: "Admin" });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.getWorkspaces = async (req, res) => {
  try {

    if (!req.user || !req.user.id) {
      return res.json([]);
    }

    const userId = req.user.id;

    // Get all workspaces where user is owner OR a member
    let workspaces = await pool.query(
      `SELECT DISTINCT w.*, COALESCE(wm.role, 'Admin') as user_role
       FROM workspaces w
       LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = $1
       WHERE w.owner_id = $1 OR wm.user_id = $1
       ORDER BY w.created_at ASC`,
      [userId]
    );

    // If user has no workspaces, create a default one on the fly
    if (workspaces.rows.length === 0) {
      const defaultWs = await pool.query(
        "INSERT INTO workspaces(name, owner_id) VALUES($1, $2) RETURNING *",
        ["Personal", userId]
      );
      const ws = defaultWs.rows[0];
      await pool.query(
        `INSERT INTO workspace_members (workspace_id, user_id, role)
         VALUES ($1, $2, 'Admin')
         ON CONFLICT (workspace_id, user_id) DO NOTHING`,
        [ws.id, userId]
      );
      return res.json([{ ...ws, user_role: "Admin" }]);
    }

    res.json(workspaces.rows);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
      return res.status(401).json("Not authorized");
    }

    const owner_id = req.user.id;
    
    // Ensure the user owns the workspace
    const wsCheck = await pool.query("SELECT * FROM workspaces WHERE id=$1 AND owner_id=$2", [id, owner_id]);
    if (wsCheck.rows.length === 0) {
      return res.status(404).json("Workspace not found or unauthorized");
    }

    // Delete tasks that belong to projects in the workspace
    const projects = await pool.query("SELECT id FROM projects WHERE workspace_id=$1", [id]);
    const projectIds = projects.rows.map(p => p.id);
    
    if (projectIds.length > 0) {
      // First delete tasks (they depend on project_id)
      await pool.query("DELETE FROM tasks WHERE project_id = ANY($1)", [projectIds]);
      
      // Delete activity logs related to these projects or this workspace
      await pool.query("DELETE FROM activity_logs WHERE project_id = ANY($1) OR workspace_id=$2", [projectIds, id]);
    } else {
      // Delete activity logs related to this workspace only
      await pool.query("DELETE FROM activity_logs WHERE workspace_id=$1", [id]);
    }
    
    // Delete projects in the workspace
    await pool.query("DELETE FROM projects WHERE workspace_id=$1", [id]);
    
    // Delete invites related to this workspace
    await pool.query("DELETE FROM invites WHERE workspace_id=$1", [id]);

    // Delete workspace members
    await pool.query("DELETE FROM workspace_members WHERE workspace_id=$1", [id]);

    // Finally delete the workspace
    await pool.query("DELETE FROM workspaces WHERE id=$1", [id]);

    res.json({ message: "Workspace deleted successfully" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};