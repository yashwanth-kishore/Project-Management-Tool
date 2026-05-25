const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  addComment,
  getComments
} = require("../controllers/commentController");

router.post("/", auth, addComment);
router.get("/:taskId", auth, getComments);

module.exports = router;