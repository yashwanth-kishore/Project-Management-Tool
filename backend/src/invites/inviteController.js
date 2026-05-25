const { v4: uuidv4 } = require("uuid");
const pool = require("../db");
const sendInviteEmail = require("./mailer");

// Send an invite (requires auth — only Admin/Owner can invite)
async function sendInvite(req, res) {
  const { email, role } = req.body;
  const { id: workspaceId } = req.params;
  const userId = req.user.id;

  try {
    // Check that the sender is an Admin of this workspace
    const membership = await pool.query(
      "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspaceId, userId]
    );
    if (membership.rows.length === 0 || membership.rows[0].role !== "Admin") {
      return res.status(403).json({ error: "Only admins can send invitations" });
    }

    // Validate role
    const validRole = role === "Admin" ? "Admin" : "Member";

    // Check if already invited
    const existing = await pool.query(
      "SELECT id, role FROM invites WHERE workspace_id = $1 AND email = $2 AND status = 'pending'",
      [workspaceId, email]
    );

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (existing.rows.length > 0) {
      // Allow re-sending: update existing invite with new token and expiry
      await pool.query(
        "UPDATE invites SET token = $1, expires_at = $2, role = $3 WHERE id = $4",
        [token, expiresAt, validRole, existing.rows[0].id]
      );
    } else {
      // Check if user is already a member
      const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (existingUser.rows.length > 0) {
        const alreadyMember = await pool.query(
          "SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
          [workspaceId, existingUser.rows[0].id]
        );
        if (alreadyMember.rows.length > 0) {
          return res.status(400).json({ error: "This user is already a member of the workspace" });
        }
      }

      await pool.query(
        "INSERT INTO invites (workspace_id, email, role, token, expires_at) VALUES ($1, $2, $3, $4, $5)",
        [workspaceId, email, validRole, token, expiresAt]
      );
    }

    // Frontend URL
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteLink = `${frontendBase}/invite?token=${token}`;

    // Try sending email
    try {
      await sendInviteEmail(email, inviteLink);
      console.log(`✅ Invite email sent to ${email}`);
    } catch (emailErr) {
      console.error(`❌ Email send failed for ${email}:`, emailErr.message);
      return res.status(500).json({
        error: "Failed to send invitation email. Please check your SMTP settings.",
        message: emailErr.message,
        inviteLink // Return link so they can manually copy it if needed
      });
    }

    // Get workspace name for response
    const ws = await pool.query("SELECT name FROM workspaces WHERE id = $1", [workspaceId]);

    res.json({
      message: existing.rows.length > 0 ? "Invite re-sent successfully" : "Invite sent successfully",
      inviteLink,
      workspace: ws.rows[0]?.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send invite" });
  }
}

// Verify invite token (public — no auth needed)
async function verifyInvite(req, res) {
  const { token } = req.query;

  try {
    const result = await pool.query(
      `SELECT i.*, w.name as workspace_name
       FROM invites i
       JOIN workspaces w ON w.id = i.workspace_id
       WHERE i.token = $1 AND i.status = 'pending'`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired invite" });
    }

    const invite = result.rows[0];

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      await pool.query("UPDATE invites SET status = 'expired' WHERE id = $1", [invite.id]);
      return res.status(400).json({ error: "This invitation has expired" });
    }

    res.json({
      email: invite.email,
      role: invite.role,
      workspace_name: invite.workspace_name,
      workspace_id: invite.workspace_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify invite" });
  }
}

// Accept invite and add user to workspace (requires auth)
async function acceptInvite(req, res) {
  const { token } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM invites WHERE token = $1 AND status = 'pending'",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired invite" });
    }

    const invite = result.rows[0];

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      await pool.query("UPDATE invites SET status = 'expired' WHERE id = $1", [invite.id]);
      return res.status(400).json({ error: "This invitation has expired" });
    }

    // Check if already a member
    const existing = await pool.query(
      "SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [invite.workspace_id, userId]
    );
    if (existing.rows.length > 0) {
      await pool.query("UPDATE invites SET status = 'accepted' WHERE id = $1", [invite.id]);
      return res.json({ message: "You are already a member of this workspace" });
    }

    // Mark invite as accepted
    await pool.query("UPDATE invites SET status = 'accepted' WHERE id = $1", [invite.id]);

    // Add user to workspace
    await pool.query(
      "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)",
      [invite.workspace_id, userId, invite.role]
    );

    res.json({ message: "Invite accepted! You have been added to the workspace." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept invite" });
  }
}

// Get pending invites for a workspace (admin only)
async function getWorkspaceInvites(req, res) {
  const { id: workspaceId } = req.params;
  const userId = req.user.id;

  try {
    const membership = await pool.query(
      "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspaceId, userId]
    );
    if (membership.rows.length === 0 || membership.rows[0].role !== "Admin") {
      return res.status(403).json({ error: "Only admins can view invitations" });
    }

    const invites = await pool.query(
      "SELECT id, email, role, status, created_at, expires_at FROM invites WHERE workspace_id = $1 ORDER BY created_at DESC",
      [workspaceId]
    );
    res.json(invites.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invites" });
  }
}

// Get workspace members (any member can view)
async function getWorkspaceMembers(req, res) {
  const { id: workspaceId } = req.params;

  try {
    const members = await pool.query(
      `SELECT u.id, u.name, u.email, wm.role, wm.joined_at
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = $1
       ORDER BY wm.joined_at ASC`,
      [workspaceId]
    );
    res.json(members.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
}

module.exports = {
  sendInvite,
  verifyInvite,
  acceptInvite,
  getWorkspaceInvites,
  getWorkspaceMembers
};