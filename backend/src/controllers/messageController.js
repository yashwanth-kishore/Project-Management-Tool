const pool = require("../db");

exports.sendMessage = async (req, res) => {

  try {

    const sender_id = req.user.id;
    const { receiver_id, content } = req.body;

    const msg = await pool.query(
      `INSERT INTO messages(sender_id,receiver_id,content)
       VALUES($1,$2,$3)
       RETURNING *`,
      [sender_id, receiver_id, content]
    );

    res.json(msg.rows[0]);

  } catch (err) {
    res.status(500).json(err.message);
  }

};

exports.getReceived = async (req, res) => {

  const user_id = req.user.id;

  const messages = await pool.query(
    "SELECT * FROM messages WHERE receiver_id=$1",
    [user_id]
  );

  res.json(messages.rows);
};

exports.getSent = async (req, res) => {

  const user_id = req.user.id;

  const messages = await pool.query(
    "SELECT * FROM messages WHERE sender_id=$1",
    [user_id]
  );

  res.json(messages.rows);
};