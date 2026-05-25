import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided");
      setLoading(false);
      return;
    }
    verifyToken();
  }, [token]);

  async function verifyToken() {
    try {
      const data = await api.verifyInvite(token);
      setInvite(data);
    } catch (err) {
      setError(err.message || "Invalid or expired invitation");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/invite?token=${token}`);
      return;
    }

    setAccepting(true);
    setError("");

    try {
      await api.acceptInvite(token);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-bg, #0f0f1a)",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        background: "var(--color-bg-secondary, #1a1a2e)",
        borderRadius: "16px",
        padding: "40px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        textAlign: "center"
      }}>
        {loading && (
          <div>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(129, 140, 248, 0.2)",
              borderTop: "3px solid #818cf8",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }} />
            <p style={{ color: "var(--color-text-muted, #888)" }}>Verifying invitation...</p>
          </div>
        )}

        {!loading && error && !invite && (
          <div>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
            <h2 style={{ color: "var(--color-text, #e0e0e0)", marginBottom: "8px" }}>
              Invalid Invitation
            </h2>
            <p style={{ color: "var(--color-text-muted, #888)", marginBottom: "24px" }}>
              {error}
            </p>
            <Link to="/" style={{
              display: "inline-block",
              padding: "10px 24px",
              background: "linear-gradient(135deg, #818cf8, #6366f1)",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "600"
            }}>
              Go to Dashboard
            </Link>
          </div>
        )}

        {!loading && invite && !success && (
          <div>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
            <h2 style={{ color: "var(--color-text, #e0e0e0)", marginBottom: "8px" }}>
              Workspace Invitation
            </h2>
            <p style={{ color: "var(--color-text-muted, #888)", marginBottom: "24px" }}>
              You've been invited to join
            </p>
            <div style={{
              background: "rgba(129, 140, 248, 0.1)",
              border: "1px solid rgba(129, 140, 248, 0.2)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px"
            }}>
              <h3 style={{ color: "#818cf8", margin: "0 0 8px", fontSize: "20px" }}>
                {invite.workspace_name}
              </h3>
              <div style={{
                display: "inline-block",
                padding: "4px 12px",
                background: invite.role === "Admin"
                  ? "rgba(245, 158, 11, 0.15)"
                  : "rgba(129, 140, 248, 0.15)",
                color: invite.role === "Admin" ? "#f59e0b" : "#818cf8",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "600"
              }}>
                {invite.role === "Admin" ? "👑 Admin" : "👤 Member"}
              </div>
              <p style={{ color: "var(--color-text-muted, #888)", fontSize: "13px", marginTop: "8px", marginBottom: "0" }}>
                Invited as: {invite.email}
              </p>
            </div>

            {error && (
              <div style={{
                padding: "8px 12px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                color: "#ef4444",
                fontSize: "13px",
                marginBottom: "16px"
              }}>
                {error}
              </div>
            )}

            {!isAuthenticated ? (
              <div>
                <p style={{ color: "var(--color-text-muted, #888)", fontSize: "14px", marginBottom: "16px" }}>
                  Please log in or create an account to accept this invitation.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <Link
                    to={`/login?redirect=${encodeURIComponent(`/invite?token=${token}`)}`}
                    style={{
                      padding: "10px 24px",
                      background: "linear-gradient(135deg, #818cf8, #6366f1)",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "8px",
                      fontWeight: "600"
                    }}
                  >
                    Log In
                  </Link>
                  <Link
                    to={`/register?redirect=${encodeURIComponent(`/invite?token=${token}`)}`}
                    style={{
                      padding: "10px 24px",
                      background: "transparent",
                      border: "1px solid var(--color-border, #333)",
                      color: "var(--color-text, #e0e0e0)",
                      textDecoration: "none",
                      borderRadius: "8px",
                      fontWeight: "600"
                    }}
                  >
                    Register
                  </Link>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAccept}
                disabled={accepting}
                style={{
                  padding: "12px 32px",
                  background: accepting
                    ? "rgba(129, 140, 248, 0.4)"
                    : "linear-gradient(135deg, #818cf8, #6366f1)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: accepting ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
              >
                {accepting ? "Accepting..." : "Accept Invitation"}
              </button>
            )}
          </div>
        )}

        {success && (
          <div>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ color: "var(--color-text, #e0e0e0)", marginBottom: "8px" }}>
              Welcome!
            </h2>
            <p style={{ color: "#22c55e", marginBottom: "8px" }}>
              You've been added to <strong>{invite.workspace_name}</strong>!
            </p>
            <p style={{ color: "var(--color-text-muted, #888)", fontSize: "14px" }}>
              Redirecting to dashboard...
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AcceptInvite;
