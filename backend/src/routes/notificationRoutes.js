const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead
} = require("../controllers/notificationController");

router.get("/", auth, getNotifications);
router.put("/:id", auth, markAsRead);

module.exports = router;