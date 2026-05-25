const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  sendInvite,
  verifyInvite,
  acceptInvite,
  getWorkspaceInvites,
  getWorkspaceMembers
} = require("./inviteController");

// Public — verify invite token (no auth needed)
router.get("/invite", verifyInvite);

// Protected — send invite (admin only)
router.post("/workspace/:id/invite", auth, sendInvite);

// Protected — accept invite
router.post("/invite/accept", auth, acceptInvite);

// Protected — get pending invites for a workspace
router.get("/workspace/:id/invites", auth, getWorkspaceInvites);

// Protected — get workspace members
router.get("/workspace/:id/members", auth, getWorkspaceMembers);

module.exports = router;