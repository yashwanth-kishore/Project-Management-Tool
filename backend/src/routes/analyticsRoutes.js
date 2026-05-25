const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  getProjectAnalytics
} = require("../controllers/analyticsController");

router.get("/:projectId", auth, getProjectAnalytics);

module.exports = router;