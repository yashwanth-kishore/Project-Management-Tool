import { useContext, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiFilter, FiMessageCircle, FiPlus, FiCheckCircle, FiClock, FiList, FiSend, FiInbox, FiPaperclip, FiFile, FiTrash2, FiEdit3, FiFolder, FiFlag, FiUser, FiCalendar, FiArrowLeft, FiBarChart2 } from "react-icons/fi";
import { ProjectContext } from "../context/ProjectContext";
import Layout from "../components/Layout";
import CreateTaskDialog from "../components/CreateTaskDialog";

function Tasks() {
  const { projects, setProjects, members } = useContext(ProjectContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [overdueFilter, setOverdueFilter] = useState(false);

  // Flatten tasks from all projects and attach project context
  const allTasks = useMemo(() => {
    const list = [];
    projects.forEach((project) => {
      // Calculate project progress
      const totalTasks = project.tasks?.length || 0;
      const completedTasks = project.tasks?.filter(t => t.status === 'done').length || 0;
      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      (project.tasks || []).forEach((task) => {
        list.push({
          ...task,
          projectId: project.id,
          projectName: project.name,
          projectDetails: {
            startDate: project.createdAt, 
            endDate: project.dueDate || 'N/A',
            status: project.status || 'Active',
            progress: progress
          }
        });
      });
    });
    return list;
  }, [projects]);

  // Handle deep-linking from URL
  const isFocused = !!searchParams.get("id");

  useEffect(() => {
    const taskId = searchParams.get("id");
    if (taskId) {
      const task = allTasks.find(t => t.id.toString() === taskId);
      if (task) {
        setSelectedTask(task);
      }
    }
  }, [searchParams, allTasks]);

  // Mini stats calculation
  const stats = useMemo(() => {
    return {
      total: allTasks.length,
      todo: allTasks.filter(t => t.status === 'todo').length,
      progress: allTasks.filter(t => t.status === 'progress').length,
      done: allTasks.filter(t => t.status === 'done').length,
    };
  }, [allTasks]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (projectFilter !== "all" && task.projectName !== projectFilter) return false;
      if (memberFilter !== "all" && task.assignee !== memberFilter) return false;
      if (overdueFilter) {
        if (!task.due) return false;
        const today = new Date();
        const dueDate = new Date(task.due);
        if (dueDate >= today) return false;
      }
      return true;
    });
  }, [allTasks, statusFilter, projectFilter, memberFilter, overdueFilter]);

  const updateTask = async (field, value) => {
    if (!selectedTask) return;
    const updatedProjects = projects.map((project) => {
      if (project.id !== selectedTask.projectId) return project;
      return {
        ...project,
        tasks: project.tasks.map((task) => {
          if (task.id !== selectedTask.id) return task;
          return { ...task, [field]: value };
        }),
      };
    });
    setProjects(updatedProjects);
    setSelectedTask({ ...selectedTask, [field]: value });

    // Persist to backend
    try {
      const backendField = field === "due" ? "due_date" : field;
      const { api } = await import("../api/client");
      await api.updateTask(selectedTask.id, { [backendField]: value });
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const addComment = (file = null) => {
    if (!commentText && !file && !selectedTask) return;
    
    const commentObj = file 
      ? { type: 'file', name: file.name, url: URL.createObjectURL(file), size: file.size, timestamp: new Date().toISOString() }
      : { type: 'text', content: commentText, timestamp: new Date().toISOString() };

    const updatedProjects = projects.map((project) => {
      if (project.id !== selectedTask.projectId) return project;
      return {
        ...project,
        tasks: project.tasks.map((task) => {
          if (task.id !== selectedTask.id) return task;
          return { ...task, comments: [...(task.comments || []), commentObj] };
        }),
      };
    });
    setProjects(updatedProjects);
    setSelectedTask({ ...selectedTask, comments: [...(selectedTask.comments || []), commentObj] });
    setCommentText("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      addComment(file);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return 'var(--color-text-muted)';
    }
  };

  const handleBackToAll = () => {
    setSearchParams({});
    setSelectedTask(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Layout>
      {!isFocused && (
        <>
          <div className="dashboard-hero" style={{ marginBottom: '24px' }}>
            <div className="dashboard-hero-text">
              <h1>All Tasks</h1>
              <p>Manage and track progress across all workspace projects.</p>
            </div>
            <button className="navbar-btn" onClick={() => setIsDialogOpen(true)}>
              <FiPlus /> New Task
            </button>
          </div>

          <div className="stats-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card">
              <FiList />
              <h3>{stats.total}</h3>
              <p>Total Tasks</p>
            </div>
            <div className="stat-card">
              <FiClock style={{ color: 'var(--color-primary)' }} />
              <h3>{stats.todo}</h3>
              <p>To Do</p>
            </div>
            <div className="stat-card">
              <FiClock style={{ color: '#f59e0b' }} />
              <h3>{stats.progress}</h3>
              <p>In Progress</p>
            </div>
            <div className="stat-card">
              <FiCheckCircle style={{ color: '#10b981' }} />
              <h3>{stats.done}</h3>
              <p>Completed</p>
            </div>
          </div>
        </>
      )}

      {isFocused && (
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="navbar-icon-btn" 
            onClick={handleBackToAll}
            title="Back to All Tasks"
            style={{ width: '36px', height: '36px', borderRadius: '50%' }}
          >
            <FiArrowLeft />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Tasks</span>
            <span style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>/</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)' }}>{selectedTask?.title}</span>
          </div>
        </div>
      )}

      <div className="tasks-layout" style={{ 
        height: isFocused ? 'calc(100vh - 180px)' : 'calc(100vh - 350px)', 
        minHeight: '520px',
        display: 'flex',
        gap: '24px'
      }}>
        {/* FILTERS AND LIST */}
        {!isFocused && (
          <div className="tasks-panel dashboard-card" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="section-title" style={{ margin: 0, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiFilter style={{ color: 'var(--color-primary)' }} /> Filters
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="filter-item">
                    <label className="form-label" style={{ fontSize: '11px' }}>Status</label>
                    <select className="form-input" style={{ width: '100%', padding: '8px 12px' }} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="todo">To Do</option>
                      <option value="progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label className="form-label" style={{ fontSize: '11px' }}>Project</label>
                    <select className="form-input" style={{ width: '100%', padding: '8px 12px' }} onChange={(e) => setProjectFilter(e.target.value)}>
                      <option value="all">All Projects</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="filter-item">
                  <label className="form-label" style={{ fontSize: '11px' }}><FiUser size={12} /> Assignee</label>
                  <select className="form-input" style={{ width: '100%', padding: '8px 12px' }} onChange={(e) => setMemberFilter(e.target.value)}>
                    <option value="all">All Members</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {filteredTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ 
                    width: '64px', height: '64px', background: 'var(--color-bg)', 
                    borderRadius: '50%', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', margin: '0 auto 16px', color: 'var(--color-text-muted)' 
                  }}>
                    <FiInbox size={32} style={{ opacity: 0.5 }} />
                  </div>
                  <h4 style={{ margin: '0 0 4px', color: 'var(--color-text)' }}>No tasks found</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>Try adjusting your filters.</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`task-list-item ${selectedTask?.id === task.id ? 'active' : ''}`} 
                    onClick={() => { setSelectedTask(task); setIsEditing(false); }}
                    style={{ 
                      padding: '16px', 
                      borderRadius: 'var(--radius-lg)', 
                      marginBottom: '10px', 
                      cursor: 'pointer',
                      background: selectedTask?.id === task.id ? 'rgba(59, 130, 246, 0.05)' : 'var(--color-surface)',
                      border: selectedTask?.id === task.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: selectedTask?.id === task.id ? 'var(--shadow-md)' : 'none'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: 'var(--color-text)', marginBottom: '8px', fontSize: '14px' }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiFolder size={14} style={{ opacity: 0.7 }} /> {task.projectName}
                      </span>
                      <span style={{ 
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: task.status === 'done' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        fontSize: '11px', 
                        fontWeight: '700',
                        color: task.status === 'done' ? '#10b981' : 'var(--color-primary)'
                      }}>{task.status.toUpperCase()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DETAILS */}
        <div className="tasks-panel dashboard-card" style={{ flex: isFocused ? 2.5 : 2, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedTask ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
              <div style={{ 
                width: '80px', height: '80px', background: 'var(--color-bg)', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', marginBottom: '24px', color: 'var(--color-primary)',
                opacity: 0.2
              }}>
                <FiList size={40} />
              </div>
              <h3 style={{ margin: '0 0 8px', color: 'var(--color-text)' }}>Select a task</h3>
              <p style={{ margin: 0, textAlign: 'center', maxWidth: '280px' }}>Select a task from the list on the left to view its details and discussions.</p>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Task Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--color-surface)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'var(--color-text)' }}>{selectedTask.title}</h2>
                    <span className={`project-info-badge active ${selectedTask.priority === 'high' ? 'critical' : ''}`}>
                      <FiFlag size={12} /> {selectedTask.priority?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                    <div className="project-info-badge">
                      <FiFolder size={14} /> <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>{selectedTask.projectName}</span>
                    </div>
                    {isFocused && (
                      <>
                        <div className="project-info-badge">
                          <FiCalendar size={14} /> <span>{formatDate(selectedTask.projectDetails?.startDate)} - {formatDate(selectedTask.projectDetails?.endDate)}</span>
                        </div>
                        <div className="project-info-badge active">
                          <FiBarChart2 size={14} /> <span>{selectedTask.projectDetails?.progress}% Progress</span>
                        </div>
                        <div className="project-info-badge">
                          <span style={{ 
                            width: '8px', height: '8px', borderRadius: '50%', 
                            background: selectedTask.projectDetails?.status === 'Active' ? '#10b981' : '#64748b' 
                          }} />
                          <span style={{ fontWeight: '600' }}>{selectedTask.projectDetails?.status}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setIsEditing(!isEditing)}
                  style={{ gap: '8px', borderRadius: 'var(--radius-md)', padding: '10px 16px', flexShrink: 0 }}
                >
                  {isEditing ? <><FiCheckCircle /> Save Changes</> : <><FiEdit3 /> Edit Detail</>}
                </button>
              </div>

              {/* Task Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                {!isEditing ? (
                  <div className="task-premium-details">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '32px', marginBottom: '40px' }}>
                      <div className="detail-item">
                        <label className="form-label">Task Status</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', marginTop: '4px' }}>
                          <FiCheckCircle color={selectedTask.status === 'done' ? '#10b981' : 'var(--color-primary)'} size={18} />
                          <span style={{ fontSize: '15px' }}>{selectedTask.status.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <label className="form-label">Assignee</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', marginTop: '4px' }}>
                          <div style={{ width: '28px', height: '28px', background: 'var(--color-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            {selectedTask.assignee?.charAt(0) || <FiUser />}
                          </div>
                          <span style={{ fontSize: '15px' }}>{selectedTask.assignee || "Unassigned"}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <label className="form-label">Task Due Date</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', marginTop: '4px' }}>
                          <FiCalendar color="var(--color-text-muted)" size={18} />
                          <span style={{ fontSize: '15px' }}>{selectedTask.due ? formatDate(selectedTask.due) : "No due date"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ background: 'var(--color-bg)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Description</label>
                      <div style={{ lineHeight: '1.7', color: 'var(--color-text)', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                        {selectedTask.description || "No description provided for this task."}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="project-form">
                    <div className="form-group">
                      <label className="form-label">Task Title</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Design new landing page"
                        value={selectedTask.title}
                        onChange={(e) => updateTask("title", e.target.value)}
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-input" value={selectedTask.status} onChange={(e) => updateTask("status", e.target.value)}>
                          <option value="todo">To Do</option>
                          <option value="progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select className="form-input" value={selectedTask.priority || "medium"} onChange={(e) => updateTask("priority", e.target.value)}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Assignee</label>
                        <select className="form-input" value={selectedTask.assignee || ""} onChange={(e) => updateTask("assignee", e.target.value)}>
                          <option value="">Unassigned</option>
                          {members.map((member) => (
                            <option key={member.id} value={member.name}>{member.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Due Date</label>
                        <input className="form-input" type="date" value={selectedTask.due || ""} onChange={(e) => updateTask("due", e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-input"
                        placeholder="Describe the task in detail..."
                        style={{ minHeight: '160px', resize: 'vertical' }}
                        value={selectedTask.description || ""}
                        onChange={(e) => updateTask("description", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* DISCUSSIONS */}
        <div className="tasks-panel dashboard-card" style={{ flex: 1.5, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <h3 className="section-title" style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiMessageCircle style={{ color: 'var(--color-primary)' }} /> Discussions
            </h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: 'var(--color-bg)' }}>
            {!selectedTask ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--color-surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
                   <FiMessageCircle size={24} style={{ opacity: 0.3 }} />
                </div>
                <p style={{ fontSize: '13px', maxWidth: '200px' }}>Select a task to view and start a discussion.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(selectedTask.comments || []).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                    <p style={{ fontSize: '13px' }}>No activity yet. Start a discussion!</p>
                  </div>
                )}
                {(selectedTask.comments || []).map((c, index) => (
                  <div key={index} style={{ 
                    padding: '16px', 
                    background: 'var(--color-surface)', 
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    maxWidth: '92%'
                  }}>
                    {c.type === 'file' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', background: 'var(--color-primary)', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FiFile size={22} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text)' }}>{c.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{(c.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <a href={c.url} download={c.name} style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: '700', padding: '4px 8px' }}>OPEN</a>
                      </div>
                    ) : (
                      <div style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: '1.5' }}>{c.content}</div>
                    )}
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '8px', textAlign: 'right', fontWeight: '500' }}>
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <div className="comment-input-wrap">
              <label className="navbar-icon-btn" style={{ cursor: 'pointer', flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%' }}>
                <FiPaperclip size={18} />
                <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={!selectedTask} />
              </label>
              <input
                className="form-input"
                style={{ flex: 1, borderRadius: '24px', padding: '10px 20px' }}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type a message..."
                disabled={!selectedTask}
                onKeyPress={(e) => e.key === 'Enter' && addComment()}
              />
              <button 
                className="btn btn-primary" 
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  flexShrink: 0,
                  fontWeight: '600'
                }} 
                onClick={() => addComment()}
                disabled={!selectedTask || !commentText}
              >
                <FiSend size={15} /> <span className="hide-mobile">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreateTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Layout>
  );
}

export default Tasks;