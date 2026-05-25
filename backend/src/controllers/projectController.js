const pool = require("../db");
const { logActivity } = require("../utils/activityLogger");

exports.createProject = async (req, res) => {
  try {
    const { name, description, status, priority, start_date, due_date, workspace_id } = req.body;

    const project = await pool.query(
      `INSERT INTO projects(name, description, status, priority, start_date, due_date, workspace_id)
       VALUES($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        name,
        description || "",
        status || "active",
        priority || "medium",
        start_date || null,
        due_date || null,
        workspace_id
      ]
    );

    const p = project.rows[0];
    await logActivity(req.user?.id, `Created project '${p.name}'`, p.id, p.workspace_id);

    // Return project with empty tasks array for frontend consistency
    res.json({ ...p, tasks: [] });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Get all projects for the workspace
    const projects = await pool.query(
      "SELECT * FROM projects WHERE workspace_id=$1 ORDER BY id",
      [workspaceId]
    );

    // Get all tasks for these projects in one query
    const projectIds = projects.rows.map(p => p.id);

    let tasksByProject = {};
    if (projectIds.length > 0) {
      const tasks = await pool.query(
        "SELECT * FROM tasks WHERE project_id = ANY($1) ORDER BY id",
        [projectIds]
      );

      tasks.rows.forEach(task => {
        if (!tasksByProject[task.project_id]) {
          tasksByProject[task.project_id] = [];
        }
        tasksByProject[task.project_id].push({
          id: task.id,
          title: task.title,
          description: task.description || "",
          status: task.status || "todo",
          priority: task.priority || "medium",
          assignee: task.assignee || "",
          due: task.due_date ? task.due_date.toISOString().split("T")[0] : "",
          createdAt: task.created_at ? task.created_at.toISOString() : new Date().toISOString(),
          comments: []
        });
      });
    }

    // Attach tasks to each project
    const result = projects.rows.map(p => ({
      id: p.id,
      workspaceId: p.workspace_id,
      name: p.name,
      description: p.description || "",
      status: p.status || "active",
      priority: p.priority || "medium",
      createdAt: p.start_date ? p.start_date.toISOString() : (p.created_at ? p.created_at.toISOString() : new Date().toISOString()),
      dueDate: p.due_date ? p.due_date.toISOString().split("T")[0] : "",
      participants: [],
      tasks: tasksByProject[p.id] || [],
      projectMembers: []
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, priority, start_date, due_date } = req.body;

    const project = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           start_date = COALESCE($5, start_date),
           due_date = COALESCE($6, due_date)
       WHERE id = $7
       RETURNING *`,
      [name, description, status, priority, start_date || null, due_date || null, id]
    );

    if (project.rows.length === 0) {
      return res.status(404).json("Project not found");
    }

    const p = project.rows[0];
    await logActivity(req.user?.id, `Updated project '${p.name}'`, p.id, p.workspace_id);

    res.json(p);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete tasks first (foreign key)
    await pool.query("DELETE FROM tasks WHERE project_id=$1", [id]);

    await pool.query("DELETE FROM projects WHERE id=$1", [id]);

    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
