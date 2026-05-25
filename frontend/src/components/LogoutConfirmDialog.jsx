import { FiLogOut, FiX } from "react-icons/fi";

function LogoutConfirmDialog({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-box" style={{ maxWidth: '400px', padding: '32px 24px' }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="dialog-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="dialog-header" style={{ marginBottom: '24px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '24px',
            margin: '0 auto 16px'
          }}>
            <FiLogOut />
          </div>
          <h3 className="dialog-title">Confirm Logout</h3>
          <p className="dialog-subtitle">Are you sure you want to log out of your account?</p>
        </div>

        <div className="dialog-actions" style={{ marginTop: '0', gridTemplateColumns: '1fr 1.5fr' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ fontWeight: '600' }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onConfirm}
            style={{ 
              background: '#ef4444', 
              borderColor: '#ef4444',
              fontWeight: '600'
            }}
          >
            Yes, Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmDialog;
