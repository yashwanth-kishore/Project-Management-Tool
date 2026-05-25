import { useState, useContext, useEffect } from "react";
import { FiSave, FiGrid, FiPlus, FiChevronLeft, FiSettings, FiTrash2 } from "react-icons/fi";
import { WorkspaceContext } from "../context/WorkspaceContext";
import Layout from "../components/Layout";

function Settings() {
  const { workspaces, setWorkspaces, activeWorkspace, setActiveWorkspace, deleteWorkspace } = useContext(WorkspaceContext);

  // Workspace management state
  const [selectedWsId, setSelectedWsId] = useState(null);
  const selectedWs = workspaces.find(w => w.id === selectedWsId);

  const saveWorkspace = () => {
    if (!selectedWs) return;
    const updated = workspaces.map(w => w.id === selectedWs.id ? { ...w, name: wsName, logo: wsLogo } : w);
    setWorkspaces(updated);
    if (activeWorkspace?.id === selectedWs.id) {
      setActiveWorkspace({ ...activeWorkspace, name: wsName, logo: wsLogo });
    }
    alert("Workspace updated");
  };

  const createWorkspace = () => {
    const workspaceName = prompt("Workspace name");
    if(!workspaceName) return;
    const newWorkspace = {
      id: Date.now(),
      name: workspaceName
    };
    setWorkspaces([...workspaces, newWorkspace]);
    setActiveWorkspace(newWorkspace);
  };

  const handleWsImageUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    setWsLogo(url);
  };

  const removeWsImage = () => {
    setWsLogo(null);
  };

  // State for workspace editing
  const [wsName, setWsName] = useState(activeWorkspace?.name || "");
  const [wsLogo, setWsLogo] = useState(activeWorkspace?.logo || null);

  // Sync state if selected workspace changes
  useEffect(() => {
    if(selectedWs) {
      setWsName(selectedWs.name);
      setWsLogo(selectedWs.logo);
    }
  }, [selectedWsId, workspaces]); 

  return (
    <Layout>
      <h2 className="page-title">Workspace Settings</h2>

      <div className="settings-section" style={{ marginTop: 0 }}>
        
        {!selectedWsId ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}><FiGrid /> All Workspaces</h3>
            </div>
            
            <div className="workspace-cards-grid">
              {workspaces.map(ws => (
                <div key={ws.id} className="workspace-selection-card" onClick={() => setSelectedWsId(ws.id)}>
                  {ws.logo ? (
                    <img src={ws.logo} alt={ws.name} />
                  ) : (
                    <div className="ws-placeholder-icon">
                      <FiGrid size={24} />
                    </div>
                  )}
                  <h4>{ws.name}</h4>
                  <p>{activeWorkspace?.id === ws.id ? "Active" : "Guest"}</p>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '8px' }}>
                    <FiSettings size={12} style={{ marginRight: '6px' }} /> Manage
                  </button>
                </div>
              ))}
              
              <div className="workspace-selection-card create-card" onClick={createWorkspace}>
                <FiPlus />
                <h4 style={{ color: 'var(--color-primary)' }}>New Workspace</h4>
              </div>
            </div>
          </>
        ) : (
          <>
            <button className="settings-back-btn" onClick={() => setSelectedWsId(null)}>
              <FiChevronLeft /> Back to all workspaces
            </button>

            <h3 style={{ marginBottom: '32px' }}><FiGrid /> Workspace Settings: {selectedWs?.name}</h3>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
              
              <div style={{ flex: 1, minWidth: "280px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "16px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  General Information
                </h4>
                
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Workspace Logo</label>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ 
                    width: "60px", height: "60px", borderRadius: "12px", 
                    background: wsLogo ? `url(${wsLogo}) center/cover` : "var(--color-bg)",
                    border: wsLogo ? "none" : "1.5px dashed var(--color-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--color-text-muted)"
                  }}>
                    {!wsLogo && <FiGrid size={24} style={{ opacity: 0.5 }} />}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input type="file" id="ws-logo-upload" style={{ display: "none" }} onChange={handleWsImageUpload} accept="image/*" />
                    {!wsLogo && (
                      <label htmlFor="ws-logo-upload" className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-block", textAlign: "center" }}>
                        Upload Image
                      </label>
                    )}
                    {wsLogo && (
                      <button className="btn btn-sm" style={{ color: "var(--color-danger)", background: "transparent", border: "none", padding: 0, textAlign: "left" }} onClick={removeWsImage}>
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <label>Workspace Name</label>
                  <input className="input" value={wsName} onChange={(e) => setWsName(e.target.value)} style={{ width: "100%" }} />
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button className="btn btn-primary" onClick={saveWorkspace}>
                    <FiSave /> Save Workspace
                  </button>
                  <button 
                    className="btn" 
                    style={{ backgroundColor: "var(--color-danger)", color: "white", border: "none" }} 
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this workspace and all its projects? This action cannot be undone.")) {
                        try {
                          await deleteWorkspace(selectedWsId);
                          setSelectedWsId(null);
                          alert("Workspace deleted successfully");
                        } catch (err) {
                          alert("Failed to delete workspace");
                        }
                      }
                    }}
                  >
                    <FiTrash2 /> Delete Workspace
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: "280px", borderLeft: "1px solid var(--color-border)", paddingLeft: "24px" }} className="ws-members-divider">
                <h4 style={{ fontSize: "14px", marginBottom: "16px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Workspace Members
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", background: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>Y</div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600 }}>Yashwanth (You)</div>
                        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Admin</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", background: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#10b981", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>S</div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600 }}>Singam</div>
                        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Member</div>
                      </div>
                    </div>
                    <button className="btn btn-sm" style={{ color: "var(--color-danger)", background: "transparent", border: "none" }}>Remove</button>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </Layout>
  );
}

export default Settings;