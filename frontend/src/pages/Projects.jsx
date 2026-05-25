import { useContext, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiPlus, FiSearch, FiFilter, FiActivity, FiCheckCircle, FiClock, FiCalendar } from "react-icons/fi";
import { ProjectContext } from "../context/ProjectContext";
import Layout from "../components/Layout";
import CreateProjectDialog from "../components/CreateProjectDialog";
import { format } from "date-fns";

function Projects() {
  const { projects, deleteProject } = useContext(ProjectContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const navigate = useNavigate();

  // Metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "active").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const highPriority = projects.filter(p => p.priority === "high").length;

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Filter by search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(lowerQuery) || (p.description && p.description.toLowerCase().includes(lowerQuery)));
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortOrder === "alphabetical") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "progress_high") {
        const progA = a.tasks && a.tasks.length > 0 ? (a.tasks.filter(t => t.status === "done").length / a.tasks.length) : 0;
        const progB = b.tasks && b.tasks.length > 0 ? (b.tasks.filter(t => t.status === "done").length / b.tasks.length) : 0;
        return progB - progA;
      } else if (sortOrder === "progress_low") {
        const progA = a.tasks && a.tasks.length > 0 ? (a.tasks.filter(t => t.status === "done").length / a.tasks.length) : 0;
        const progB = b.tasks && b.tasks.length > 0 ? (b.tasks.filter(t => t.status === "done").length / b.tasks.length) : 0;
        return progA - progB;
      } else if (sortOrder === "newest") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [projects, searchQuery, statusFilter, sortOrder]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'var(--color-primary)';
      case 'completed': return 'var(--color-success)';
      case 'on-hold': return 'var(--color-warning)';
      default: return 'var(--color-text-muted)';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'active': return 'rgba(59, 130, 246, 0.1)';
      case 'completed': return 'rgba(34, 197, 94, 0.1)';
      case 'on-hold': return 'rgba(245, 158, 11, 0.1)';
      default: return 'var(--color-hover)';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'var(--color-danger)';
      case 'medium': return 'var(--color-warning)';
      case 'low': return 'var(--color-success)';
      default: return 'var(--color-text-muted)';
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 className="page-title" style={{ margin: 0 }}>All Projects</h2>
          <p className="page-subtitle" style={{ marginTop: "4px" }}>Manage and track your workspace projects</p>
        </div>
        <button className="dashboard-hero-btn" onClick={() => setIsDialogOpen(true)} style={{ boxShadow: 'var(--shadow-md)' }}>
          <FiPlus size={18} /> New Project
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}>
            <FiActivity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>TOTAL PROJECTS</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>{totalProjects}</div>
          </div>
        </div>
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <FiClock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>ACTIVE</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>{activeProjects}</div>
          </div>
        </div>
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
            <FiCheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>COMPLETED</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>{completedProjects}</div>
          </div>
        </div>
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)' }}>
            <FiActivity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>HIGH PRIORITY</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>{highPriority}</div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', background: 'var(--color-surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Search */}
        <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 16px 10px 40px', borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)',
              fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <FiFilter style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                appearance: 'none', padding: '10px 36px 10px 36px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)',
                fontSize: '14px', cursor: 'pointer', outline: 'none'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              padding: '10px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)',
              fontSize: '14px', cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
            <option value="progress_high">Progress (High to Low)</option>
            <option value="progress_low">Progress (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredAndSortedProjects.length === 0 ? (
          <div className="dashboard-card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 40px", borderStyle: 'dashed' }}>
            <div style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }}><FiSearch size={48} opacity={0.3} /></div>
            <h3 style={{ margin: '0 0 8px 0' }}>No projects found</h3>
            <p style={{ color: "var(--color-text-muted)", margin: 0 }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredAndSortedProjects.map(project => {
            const completed = project.tasks ? project.tasks.filter(t => t.status === "done").length : 0;
            const total = project.tasks ? project.tasks.length : 0;
            const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
            
            const pStatus = project.status || 'active';
            const pPriority = project.priority || 'medium';

            return (
              <div 
                key={project.id} 
                className="dashboard-card" 
                style={{ 
                  padding: "0", overflow: 'hidden', cursor: "pointer", 
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', border: '1px solid var(--color-border)'
                }}
                onClick={() => navigate(`/projects/${project.id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
              >
                {/* Card Top / Header */}
                <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '4px',
                        background: getStatusBg(pStatus), color: getStatusColor(pStatus), textTransform: 'capitalize' 
                      }}>
                        {pStatus}
                      </span>
                      <span style={{ 
                        fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '4px',
                        border: `1px solid ${getPriorityColor(pPriority)}`, color: getPriorityColor(pPriority), textTransform: 'capitalize' 
                      }}>
                        {pPriority} Priority
                      </span>
                    </div>

                    {/* Actions Menu Trigger - We'll simply use a stopPropagtion button for delete for now, styled nicer */}
                    <button 
                      onClick={(e) => handleDelete(e, project.id)}
                      style={{ 
                        background: 'transparent', border: 'none', color: 'var(--color-text-muted)', 
                        cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.2s, color 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-danger-bg)'; e.currentTarget.style.color = 'var(--color-danger)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                      title="Delete Project"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <h3 className="section-title" style={{ marginBottom: "6px", fontSize: '18px', color: 'var(--color-text)', lineHeight: 1.3 }}>
                    {project.name}
                  </h3>
                  
                  {project.description && (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4 }}>
                      {project.description}
                    </p>
                  )}
                  
                  {(!project.description) && (
                    <p style={{ margin: 0, fontSize: '13px', color: 'transparent', userSelect: 'none' }}>-</p>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px 20px', background: 'var(--color-bg)' }}>
                  {/* Dates */}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {project.start_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiCalendar opacity={0.7} /> Started {format(new Date(project.start_date), 'MMM d, yyyy')}
                      </div>
                    )}
                    {project.due_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: new Date(project.due_date) < new Date() && pStatus !== 'completed' ? 'var(--color-danger)' : 'inherit' }}>
                        <FiCalendar opacity={0.7} /> Due {format(new Date(project.due_date), 'MMM d, yyyy')}
                      </div>
                    )}
                    {!project.start_date && !project.due_date && (
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <FiCalendar opacity={0.7} /> No dates set
                       </div>
                    )}
                  </div>

                  {/* Tasks Stats */}
                  <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Tasks</div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{total}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Completed</div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{completed}</div>
                    </div>
                  </div>

                  {/* Progress section */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Progress</span>
                      <span style={{ color: progress === 100 ? 'var(--color-success)' : 'var(--color-text)' }}>{progress}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${progress}%`, 
                        background: progress === 100 ? 'var(--color-success)' : 'var(--color-primary)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      <CreateProjectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Layout>
  );
}

export default Projects;