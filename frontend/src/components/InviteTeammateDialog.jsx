import { useState, useContext } from "react";
import { WorkspaceContext } from "../context/WorkspaceContext";
import { api } from "../api/client";

function InviteTeammateDialog({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { activeWorkspace } = useContext(WorkspaceContext);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    if (!activeWorkspace?.id) {
      setError("No workspace selected");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await api.sendInvite(activeWorkspace.id, { email: trimmed, role });
      setSuccess(`Invite sent to ${trimmed}!`);
      setEmail("");
      setRole("Member");

      // Auto-close after 2 seconds
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setError("");
      setSuccess("");
      onClose();
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    setEmail("");
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">Invite Teammate</h3>
          <button type="button" className="dialog-close" onClick={handleClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="teammate-email">Email Address</label>
            <input
              id="teammate-email"
              type="email"
              className="input"
              placeholder="e.g. colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              disabled={loading}
            />
          </div>

          <div className="input-group" style={{ marginTop: "12px" }}>
            <label htmlFor="invite-role">Role</label>
            <select
              id="invite-role"
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                background: "var(--color-bg-secondary)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "10px 14px",
                cursor: "pointer"
              }}
            >
              <option value="Member">Member — can create & edit tasks/projects</option>
              <option value="Admin">Admin — full access over the workspace</option>
            </select>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px', marginBottom: '16px' }}>
            They will receive an email invitation to join <strong>{activeWorkspace?.name || "your workspace"}</strong> as a <strong>{role}</strong>.
          </p>

          {error && (
            <div style={{
              padding: "8px 12px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#ef4444",
              fontSize: "13px",
              marginBottom: "12px"
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: "8px 12px",
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "8px",
              color: "#22c55e",
              fontSize: "13px",
              marginBottom: "12px"
            }}>
              {success}
            </div>
          )}

          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InviteTeammateDialog;
