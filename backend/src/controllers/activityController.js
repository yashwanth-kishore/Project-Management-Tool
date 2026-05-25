const pool = require("../db");

exports.getWorkspaceActivity = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const logs = await pool.query(
      `SELECT activity_logs.*, users.name as user_name, projects.name as project_name
       FROM activity_logs
       JOIN users ON users.id = activity_logs.user_id
       LEFT JOIN projects ON projects.id = activity_logs.project_id
       WHERE activity_logs.workspace_id = $1
       ORDER BY activity_logs.created_at DESC
       LIMIT 50`,
      [workspaceId]
    );

    const formattedLogs = logs.rows.map(log => {
      const dateOpts = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' };
      const timeStr = new Date(log.created_at).toLocaleString('en-US', dateOpts);
      
      let text = `${log.user_name} ${log.action}`;
      if (log.project_name && !log.action.toLowerCase().includes("project")) {
         text += ` in ${log.project_name}`;
      }

      return {
        id: log.id,
        text: text,
        time: timeStr
      };
    });

    res.json(formattedLogs);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.getProjectActivity = async (req, res) => {

  try {

    const { projectId } = req.params;

    const logs = await pool.query(
      `SELECT activity_logs.*, users.name
       FROM activity_logs
       JOIN users ON users.id = activity_logs.user_id
       WHERE project_id=$1
       ORDER BY created_at DESC`,
      [projectId]
    );

    res.json(logs.rows);

  } catch (err) {
    res.status(500).json(err.message);
  }

};