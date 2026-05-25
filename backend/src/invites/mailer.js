const nodemailer = require("nodemailer");

let transporter = null;

// Only create transporter if credentials are configured
if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

async function sendInviteEmail(to, link) {
  if (!transporter) {
    throw new Error("Email not configured");
  }

  await transporter.sendMail({
    from: `"PM Tool" <${process.env.GMAIL_USER}>`,
    to,
    subject: "You're invited to join a workspace on PM Tool",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #1a1a2e; color: #e0e0e0; border-radius: 12px;">
        <h2 style="color: #818cf8; margin-bottom: 16px;">🚀 Workspace Invitation</h2>
        <p>You've been invited to join a workspace on <strong>PM Tool</strong>.</p>
        <p>Click the button below to accept the invitation:</p>
        <a href="${link}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #818cf8, #6366f1); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
          Accept Invitation
        </a>
        <p style="font-size: 13px; color: #888; margin-top: 24px;">
          This invitation expires in 7 days. If you didn't expect this, you can ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = sendInviteEmail;