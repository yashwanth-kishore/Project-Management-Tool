const pool = require("../db");

exports.getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasksByStatus = await pool.query(
      `SELECT status, COUNT(*) FROM tasks
       WHERE project_id=$1 GROUP BY status`,
      [projectId]
    );

    const tasksByPriority = await pool.query(
      `SELECT priority, COUNT(*) FROM tasks
       WHERE project_id=$1 GROUP BY priority`,
      [projectId]
    );

    res.json({
      status: tasksByStatus.rows,
      priority: tasksByPriority.rows
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};