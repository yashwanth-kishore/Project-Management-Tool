import { useState, useContext, useEffect } from "react";
import { FiX, FiCheckCircle, FiFlag, FiCalendar, FiUser, FiType, FiFolder } from "react-icons/fi";
import { ProjectContext } from "../context/ProjectContext";

function CreateTaskDialog({ isOpen, onClose, onSuccess, defaultStatus = "todo", defaultProjectId = "", hideProjectSelection = false }) {
  const { projects, addTask, members } = useContext(ProjectContext);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    projectId: defaultProjectId || projects[0]?.id || "",
    status: defaultStatus || "todo",
    priority: "medium",
    due: "",
    assignee: ""
  });

  // Update taskData when defaults change
  useEffect(() => {
    if (isOpen) {
      setTaskData(prev => ({
        ...prev,
        status: defaultStatus || "todo",
        projectId: defaultProjectId || prev.projectId || projects[0]?.id || ""
      }));
    }
  }, [isOpen, defaultStatus, defaultProjectId, projects]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title || !taskData.projectId) return;

    addTask(parseInt(taskData.projectId), {
      ...taskData,
      comments: []
    });

    // Reset with current project if it exists
    setTaskData({
      title: "",
      description: "",
      projectId: taskData.projectId,
      status: "todo",
      priority: "medium",
      due: "",
      assignee: ""
    });
    if (onSuccess) onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="dialog-header">
          <h3 className="dialog-title">Add New Task</h3>
          <button className="dialog-close" onClick={onClose}><FiX /></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Task Title *</label>
            <input
              autoFocus
              className="input"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              placeholder="E.g., Design the homepage"
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Description</label>
            <textarea
              className="input"
              placeholder="Task details and instructions..."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', minHeight: '80px', resize: 'vertical' }}
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: hideProjectSelection ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {!hideProjectSelection && (
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Project *</label>
                <select 
                  className="select"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  value={taskData.projectId}
                  onChange={(e) => setTaskData({...taskData, projectId: e.target.value})}
                  required
                >
                  <option value="" disabled>Select a project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Assignee</label>
              <select 
                className="select"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                value={taskData.assignee}
                onChange={(e) => setTaskData({...taskData, assignee: e.target.value})}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Status</label>
              <select 
                className="select"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                value={taskData.status}
                onChange={(e) => setTaskData({...taskData, status: e.target.value})}
              >
                <option value="todo">To Do</option>
                <option value="progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Priority</label>
              <select 
                className="select"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                value={taskData.priority}
                onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '24px', width: '50%', paddingRight: '8px', boxSizing: 'border-box' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Due Date</label>
            <input
              type="date"
              className="input"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
              value={taskData.due}
              onChange={(e) => setTaskData({...taskData, due: e.target.value})}
            />
          </div>

          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: '600' }}>Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskDialog;
