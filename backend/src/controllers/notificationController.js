const pool = require("../db");

exports.getNotifications = async (req, res) => {

  try {

    const user_id = req.user.id;

    const notifications = await pool.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
      [user_id]
    );

    res.json(notifications.rows);

  } catch (err) {
    res.status(500).json(err.message);
  }

};

exports.markAsRead = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      "UPDATE notifications SET is_read=true WHERE id=$1",
      [id]
    );

    res.json({ message: "Notification marked as read" });

  } catch (err) {
    res.status(500).json(err.message);
  }

};