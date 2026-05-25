const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { addMember, getMembers } = require("../controllers/projectMemberController");

router.post("/add", auth, addMember);
router.get("/:projectId", auth, getMembers);

module.exports = router;