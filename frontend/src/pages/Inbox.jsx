import { useState, useEffect } from "react";
import { FiMail, FiSend, FiArchive, FiLoader } from "react-icons/fi";
import Layout from "../components/Layout";
import { api } from "../api/client";

function Inbox() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInboxData();
  }, []);

  const fetchInboxData = async () => {
    try {
      setLoading(true);
      const data = await api.getInbox();
      setReceived(data.received || []);
      setSent(data.sent || []);
    } catch (err) {
      console.error("Failed to fetch inbox:", err);
      setError("Failed to load inbox data");
    } finally {
      setLoading(false);
    }
  };

  const archiveMessage = (message, type) => {
    if (type === "received") {
      setReceived(received.filter(m => m.id !== message.id));
    }
    if (type === "sent") {
      setSent(sent.filter(m => m.id !== message.id));
    }
    setArchive([...archive, message]);
  };

  return (
    <Layout>
      <div className="inbox-header" style={{ marginBottom: "20px" }}>
        <h2 className="page-title">Inbox</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
          View your assigned tasks and sent invitations.
        </p>
      </div>

      {error && (
        <div style={{ padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px", color: "var(--color-primary)" }}>
          <FiLoader className="spin" size={32} />
        </div>
      ) : (
        <div className="inbox-grid" style={{ display: "flex", gap: "20px" }}>
          {/* RECEIVED */}
          <div className="inbox-column dashboard-card" style={{ flex: 1, padding: "20px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <FiMail color="var(--color-primary)" /> Notifications
            </h3>

            {received.length === 0 ? (
              <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>No new tasks or notifications.</p>
            ) : (
              received.map(msg => (
                <div key={msg.id} className="inbox-item" style={{ background: "var(--color-bg)", padding: "16px", borderRadius: "8px", marginBottom: "12px", border: "1px solid var(--color-border)" }}>
                  <p style={{ fontWeight: "600", marginBottom: "4px" }}>{msg.text}</p>
                  <small style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "12px" }}>
                    From: {msg.from}
                  </small>
                  <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => archiveMessage(msg, "received")}>
                    <FiArchive /> Archive
                  </button>
                </div>
              ))
            )}
          </div>

          {/* SENT */}
          <div className="inbox-column dashboard-card" style={{ flex: 1, padding: "20px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <FiSend color="var(--color-primary)" /> Sent Requests
            </h3>

            {sent.length === 0 ? (
              <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>No sent invites.</p>
            ) : (
              sent.map(msg => (
                <div key={msg.id} className="inbox-item" style={{ background: "var(--color-bg)", padding: "16px", borderRadius: "8px", marginBottom: "12px", border: "1px solid var(--color-border)" }}>
                  <p style={{ fontWeight: "600", marginBottom: "4px" }}>{msg.text}</p>
                  <small style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "12px" }}>
                    To: {msg.to}
                  </small>
                  <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => archiveMessage(msg, "sent")}>
                    <FiArchive /> Archive
                  </button>
                </div>
              ))
            )}
          </div>

          {/* ARCHIVE */}
          <div className="inbox-column dashboard-card" style={{ flex: 1, padding: "20px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <FiArchive color="var(--color-text-muted)" /> Archive
            </h3>

            {archive.length === 0 ? (
              <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>Archive is empty.</p>
            ) : (
              archive.map(msg => (
                <div key={msg.id} className="inbox-item" style={{ background: "var(--color-bg)", padding: "16px", borderRadius: "8px", marginBottom: "12px", border: "1px solid var(--color-border)", opacity: 0.7 }}>
                  <p style={{ fontWeight: "600", marginBottom: "4px" }}>{msg.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Inbox;