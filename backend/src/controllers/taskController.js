const pool = require("../db");
const { logActivity } = require("../utils/activityLogger");

exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      assignee,
      due_date,
      project_id
    } = req.body;

    const task = await pool.query(
      `INSERT INTO tasks
      (title, description, priority, status, assignee, due_date, project_id)
      VALUES($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [title, description || "", priority || "medium", status || "todo", assignee || "", due_date || null, project_id]
    );

    const row = task.rows[0];
    await logActivity(req.user?.id, `Created task '${row.title}'`, row.project_id);

    // Return in frontend-friendly shape
    res.json({
      id: row.id,
      title: row.title,
      description: row.description || "",
      status: row.status || "todo",
      priority: row.priority || "medium",
      assignee: row.assignee || "",
      due: row.due_date ? row.due_date.toISOString().split("T")[0] : "",
      createdAt: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
      comments: []
    });
  } catch (err) {
    console.error("Error creating task:", err);
    console.log("Request body:", req.body);
    res.status(500).json(err.message);
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE project_id=$1 ORDER BY id",
      [projectId]
    );

    const result = tasks.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || "",
      status: row.status || "todo",
      priority: row.priority || "medium",
      assignee: row.assignee || "",
      due: row.due_date ? row.due_date.toISOString().split("T")[0] : "",
      createdAt: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
      comments: []
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignee, due_date } = req.body;

    const oldTaskRes = await pool.query("SELECT assignee, title FROM tasks WHERE id = $1", [id]);
    const oldAssignee = oldTaskRes.rows.length > 0 ? oldTaskRes.rows[0].assignee : null;

    const task = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           assignee = COALESCE($5, assignee),
           due_date = COALESCE($6, due_date)
       WHERE id = $7
       RETURNING *`,
      [title, description, status, priority, assignee, due_date || null, id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json("Task not found");
    }

    const row = task.rows[0];

    if (oldAssignee !== row.assignee && row.assignee && row.assignee.trim() !== "") {
      await logActivity(req.user?.id, `Assigned task '${row.title}' to '${row.assignee}'`, row.project_id);
    } else {
      await logActivity(req.user?.id, `Updated task '${row.title}'`, row.project_id);
    }

    res.json({
      id: row.id,
      title: row.title,
      description: row.description || "",
      status: row.status || "todo",
      priority: row.priority || "medium",
      assignee: row.assignee || "",
      due: row.due_date ? row.due_date.toISOString().split("T")[0] : "",
      createdAt: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
      comments: []
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM tasks WHERE id=$1", [id]);

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
