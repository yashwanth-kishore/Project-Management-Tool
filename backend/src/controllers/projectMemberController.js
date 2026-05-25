const pool = require("../db");

exports.addMember = async (req, res) => {
  try {
    const { project_id, user_id, role } = req.body;

    const member = await pool.query(
      `INSERT INTO project_members(project_id,user_id,role)
       VALUES($1,$2,$3)
       RETURNING *`,
      [project_id, user_id, role || "member"]
    );

    res.json(member.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.getMembers = async (req, res) => {
  try {

    const { projectId } = req.params;

    const members = await pool.query(
      `SELECT users.id, users.name, users.email, project_members.role
       FROM project_members
       JOIN users ON users.id = project_members.user_id
       WHERE project_members.project_id = $1`,
      [projectId]
    );

    res.json(members.rows);

  } catch (err) {
    res.status(500).json(err.message);
  }
};