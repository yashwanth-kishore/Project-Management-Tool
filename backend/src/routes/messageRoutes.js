const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  sendMessage,
  getReceived,
  getSent
} = require("../controllers/messageController");

router.post("/", auth, sendMessage);
router.get("/received", auth, getReceived);
router.get("/sent", auth, getSent);

module.exports = router;