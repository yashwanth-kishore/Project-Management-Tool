const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getProjectActivity, getWorkspaceActivity } = require("../controllers/activityController");

router.get("/workspace/:workspaceId", auth, getWorkspaceActivity);
router.get("/:projectId", auth, getProjectActivity);

module.exports = router;