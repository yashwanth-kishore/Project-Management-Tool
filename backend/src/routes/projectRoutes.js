const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject
} = require("../controllers/projectController");

router.post("/", auth, createProject);
router.get("/:workspaceId", auth, getProjects);
router.put("/:id", auth, updateProject);
router.delete("/:id", auth, deleteProject);

module.exports = router;
