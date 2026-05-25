const router = require("express").Router();
const { register, login, updateProfile, getMe } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.put("/profile", auth, updateProfile);
router.get("/me", auth, getMe);

module.exports = router;
