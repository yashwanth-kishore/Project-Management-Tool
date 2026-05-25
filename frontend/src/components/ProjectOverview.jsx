import { useContext } from "react";
import { Link } from "react-router-dom";
import { ProjectContext } from "../context/ProjectContext";
import { FiUsers, FiCalendar, FiArrowRight } from "react-icons/fi";

function ProjectOverview() {
  const { projects, members } = useContext(ProjectContext);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Project Overview</h3>
        <Link to="/projects" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}>
          View all projects <FiArrowRight size={14} />
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="empty-state">No projects yet. Create one to get started.</p>
      ) : (
        <div className="project-overview-list" style={{ gap: '16px' }}>
          {projects.map((project) => {
            // Find member data from IDs
            const projectMembers = project.participants
              ? project.participants.map(pId => members.find(m => m.id === pId)?.name).filter(Boolean)
              : [];

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="project-overview-item"
                style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div>
                  <div className="project-overview-name" style={{ fontSize: '16px', marginBottom: '4px' }}>
                    {project.name}
                  </div>
                  {project.description && (
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    <FiCalendar size={14} />
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>

                  {projectMembers.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      <FiUsers size={14} />
                      <span>{projectMembers.join(", ")}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProjectOverview;
