import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectContext } from "../context/ProjectContext";
import { WorkspaceContext } from "../context/WorkspaceContext";
import { FiType, FiBarChart, FiCalendar, FiFlag, FiX } from "react-icons/fi";

function CreateProjectDialog({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    priority: "medium",
    startDate: new Date().toISOString().split('T')[0],
    dueDate: ""
  });

  const navigate = useNavigate();
  const { addProject } = useContext(ProjectContext);
  const { activeWorkspace } = useContext(WorkspaceContext);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addProject({
      ...formData,
      name: formData.name.trim()
    });

    setFormData({
      name: "",
      description: "",
      status: "active",
      priority: "medium",
      startDate: new Date().toISOString().split('T')[0],
      dueDate: ""
    });

    if (onSuccess) onSuccess();
    onClose();
    navigate("/projects");
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-box" style={{ maxWidth: '500px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">New Project</h3>
          <button type="button" className="dialog-close" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Project Name *</label>
            <div className="premium-input-wrapper">
              <FiType />
              <input
                id="project-name"
                name="name"
                className="input premium-input-padding"
                style={{ height: '42px', width: '100%' }}
                placeholder="E.g., Website Redesign"
                value={formData.name}
                onChange={handleChange}
                autoFocus
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Description</label>
            <textarea
              id="project-description"
              name="description"
              className="input"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', minHeight: '80px', resize: 'vertical' }}
              placeholder="Project details and goals..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Status</label>
              <div className="premium-input-wrapper">
                <FiBarChart />
                <select
                  id="project-status"
                  name="status"
                  className="select premium-input-padding"
                  style={{ height: '42px', width: '100%' }}
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Priority</label>
              <div className="premium-input-wrapper">
                <FiFlag />
                <select
                  id="project-priority"
                  name="priority"
                  className="select premium-input-padding"
                  style={{ height: '42px', width: '100%' }}
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Start Date</label>
              <div className="premium-input-wrapper">
                <FiCalendar />
                <input
                  id="project-start-date"
                  name="startDate"
                  type="date"
                  className="input premium-input-padding"
                  style={{ height: '42px', width: '100%' }}
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>End Date</label>
              <div className="premium-input-wrapper">
                <FiCalendar />
                <input
                  id="project-due-date"
                  name="dueDate"
                  type="date"
                  className="input premium-input-padding"
                  style={{ height: '42px', width: '100%' }}
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: '600' }}>Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectDialog;
