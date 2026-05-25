const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createWorkspace,
  getWorkspaces,
  deleteWorkspace
} = require("../controllers/workspaceController");

router.post("/", auth, createWorkspace);
router.get("/", auth, getWorkspaces);
router.delete("/:id", auth, deleteWorkspace);

module.exports = router;