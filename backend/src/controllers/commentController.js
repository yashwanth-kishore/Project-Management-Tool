const pool = require("../db");

exports.addComment = async (req, res) => {

  try {

    const { task_id, comment } = req.body;
    const user_id = req.user.id;

    const result = await pool.query(
      `INSERT INTO task_comments(task_id,user_id,comment)
       VALUES($1,$2,$3)
       RETURNING *`,
      [task_id, user_id, comment]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json(err.message);
  }

};

exports.getComments = async (req, res) => {

  try {

    const { taskId } = req.params;

    const comments = await pool.query(
      `SELECT task_comments.*, users.name
       FROM task_comments
       JOIN users ON users.id = task_comments.user_id
       WHERE task_comments.task_id = $1
       ORDER BY created_at DESC`,
      [taskId]
    );

    res.json(comments.rows);

  } catch (err) {
    res.status(500).json(err.message);
  }

};