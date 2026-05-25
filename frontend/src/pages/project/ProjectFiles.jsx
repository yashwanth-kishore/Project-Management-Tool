import { useState } from "react";
import { useParams } from "react-router-dom";
import { FiUploadCloud, FiFile, FiTrash2, FiDownload } from "react-icons/fi";

function ProjectFiles() {
  const { id } = useParams();
  
  // Local state to simulate files (in a real app, this would be fetched from/saved to a backend)
  const [files, setFiles] = useState([]);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const newFiles = uploadedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      date: new Date().toISOString().split('T')[0],
      type: file.name.split('.').pop()
    }));

    setFiles([...files, ...newFiles]);
    
    // Reset the input
    e.target.value = null;
  };

  const deleteFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Project Files</h2>
        
        <div>
          <input 
            type="file" 
            id="file-upload" 
            style={{ display: 'none' }} 
            multiple 
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload" className="btn btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiUploadCloud size={18} /> Upload Files
          </label>
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: '0' }}>
        {files.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <FiFile size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
            <p className="empty-state">Add files to display. If files are added, they will be displayed here in a table.</p>
          </div>
        ) : (
          <table className="data-table" style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: '24px' }}>Name</th>
                <th>Size</th>
                <th>Date Added</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.id}>
                  <td style={{ paddingLeft: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--color-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                      <FiFile size={18} />
                    </div>
                    <span style={{ fontWeight: '500' }}>{file.name}</span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{file.size}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{file.date}</td>
                  <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button className="navbar-icon-btn" style={{ width: '32px', height: '32px' }} title="Download (Simulated)">
                        <FiDownload size={14} />
                      </button>
                      <button 
                        className="navbar-icon-btn" 
                        style={{ width: '32px', height: '32px', color: 'var(--color-danger)' }}
                        onClick={() => deleteFile(file.id)}
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ProjectFiles;
