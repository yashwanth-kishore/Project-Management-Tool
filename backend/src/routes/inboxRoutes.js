const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getInbox } = require("../controllers/inboxController");

router.get("/", auth, getInbox);

module.exports = router;
