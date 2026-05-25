import { useState, useRef, useContext } from "react";
import { WorkspaceContext } from "../context/WorkspaceContext";
import { FiImage, FiUploadCloud } from "react-icons/fi";

function CreateWorkspaceDialog({ isOpen, onClose, mandatory = false, onSuccess }) {
  const [name, setName] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { createWorkspace } = useContext(WorkspaceContext);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await createWorkspace(trimmed, logoPreview);
    setName("");
    setLogoPreview(null);
    if (onSuccess) onSuccess();
    if (!mandatory) onClose();
  };

  const handleBackdropClick = (e) => {
    if (!mandatory && e.target === e.currentTarget) onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">Create Workspace</h3>
          {!mandatory && (
            <button type="button" className="dialog-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit}>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
            {/* Logo Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Workspace Logo
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '64px', height: '64px', borderRadius: '12px',
                  border: logoPreview ? 'none' : '2px dashed var(--color-border)',
                  background: logoPreview ? `url(${logoPreview}) center/cover` : 'var(--color-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', position: 'relative',
                  transition: 'all 0.2s ease'
                }}
                className={!logoPreview ? "hover-border-primary" : ""}
                title="Click to upload logo"
              >
                {!logoPreview && <FiImage size={24} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />}
                {logoPreview && (
                  <div
                    onClick={handleRemoveImage}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                  >
                    ×
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Name Input */}
            <div className="input-group" style={{ flex: 1, margin: 0 }}>
              <label htmlFor="workspace-name" className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Workspace Name
              </label>
              <input
                id="workspace-name"
                className="input form-input"
                placeholder="e.g. Engineering Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
                style={{ height: '42px' }}
              />
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Workspaces are where your team communicates and collaborates on projects.
          </p>
          <div className="dialog-actions">
            {!mandatory && (
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateWorkspaceDialog;
