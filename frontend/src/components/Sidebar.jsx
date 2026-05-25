import { Link } from "react-router-dom";
import {
  FiHome,
  FiInbox,
  FiCheckSquare,
  FiFolder,
  FiSettings,
  FiUserPlus,
  FiGrid,
  FiChevronDown,
  FiChevronLeft
} from "react-icons/fi";
import { useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { useContext } from "react";
import { ProjectContext } from "../context/ProjectContext";
import { WorkspaceContext } from "../context/WorkspaceContext";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import InviteTeammateDialog from "./InviteTeammateDialog";

function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { projects } = useContext(ProjectContext);
  const { workspaces, activeWorkspace, setActiveWorkspace, isAdmin } = useContext(WorkspaceContext);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [isWorkspaceDialogOpen, setIsWorkspaceDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const allTasks = projects.flatMap((p) => p.tasks);

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="sidebar-inner">
          {/* Header: logo (only when open) + close button */}
          <div className="sidebar-header">
            {sidebarOpen && <h2 className="sidebar-logo">STRATIFY</h2>}
            <button
              type="button"
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <FiChevronLeft />
            </button>
          </div>

          {/* Nav items */}
          <nav className="sidebar-nav-main">
            <button
              className="sidebar-link sidebar-workspace-selector"
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
              title="Change Workspace"
            >
              {activeWorkspace?.logo ? (
                <img
                  src={activeWorkspace.logo}
                  alt={activeWorkspace.name}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }}
                />
              ) : (
                <FiGrid />
              )}
              <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeWorkspace ? activeWorkspace.name : "Select Workspace"}
              </span>
            </button>
            {workspaceOpen && sidebarOpen && (
              <div className="sidebar-dropdown">
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    className={`sidebar-sublink ${activeWorkspace?.id === ws.id ? "active-ws" : ""}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setWorkspaceOpen(false);
                    }}
                  >
                    {ws.logo ? (
                      <img src={ws.logo} alt="" style={{ width: '16px', height: '16px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <FiGrid size={13} style={{ opacity: 0.5 }} />
                    )}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.name}</span>
                  </button>
                ))}
                <div style={{ marginTop: '2px', paddingTop: '4px', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    type="button"
                    className="sidebar-link sidebar-sublink"
                    onClick={() => setIsWorkspaceDialogOpen(true)}
                    style={{ color: 'var(--color-primary)' }}
                  >
                    + Create Workspace
                  </button>
                </div>
              </div>
            )}

            <div className="sidebar-section-label">MENU</div>
            <Link to="/" className="sidebar-link"><FiHome /> {sidebarOpen && "Dashboard"}</Link>
            <Link to="/inbox" className="sidebar-link"><FiInbox /> {sidebarOpen && "Inbox"}</Link>
            <Link to="/settings" className="sidebar-link"><FiSettings /> {sidebarOpen && "Settings"}</Link>

            <div className="sidebar-section-label">CATEGORIES</div>
            <div className="sidebar-categories-wrap">
              {/* Tasks dropdown */}
              {sidebarOpen ? (
                <>
                  <button
                    type="button"
                    className="sidebar-link sidebar-category-header"
                    onClick={() => setTasksOpen(!tasksOpen)}
                  >
                    <div className="sidebar-icon-box"><FiCheckSquare /></div>
                    <span className="sidebar-link-text">Tasks</span>
                    <FiChevronDown className={`sidebar-chevron ${tasksOpen ? "open" : ""}`} />
                  </button>
                  {tasksOpen && (
                    <div className="sidebar-item-group">
                      <Link to="/tasks" className="sidebar-item-link sidebar-all-items-btn">All Tasks</Link>
                      {allTasks.slice(0, 8).map((t) => (
                        <Link key={t.id} to={`/tasks?id=${t.id}`} className="sidebar-item-link">
                          {t.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link to="/tasks" className="sidebar-link"><FiCheckSquare /></Link>
              )}

              {/* Projects dropdown */}
              {sidebarOpen ? (
                <>
                  <button
                    type="button"
                    className="sidebar-link sidebar-category-header"
                    onClick={() => setProjectsOpen(!projectsOpen)}
                  >
                    <div className="sidebar-icon-box"><FiFolder /></div>
                    <span className="sidebar-link-text">Projects</span>
                    <FiChevronDown className={`sidebar-chevron ${projectsOpen ? "open" : ""}`} />
                  </button>
                  {projectsOpen && (
                    <div className="sidebar-item-group">
                      <Link to="/projects" className="sidebar-item-link sidebar-all-items-btn">All Projects</Link>
                      {projects.map((p) => (
                        <Link key={p.id} to={`/projects/${p.id}`} className="sidebar-item-link">
                          {p.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link to="/projects" className="sidebar-link"><FiFolder /></Link>
              )}
            </div>
          </nav>

          {/* Bottom */}
          <div className="sidebar-bottom">
            {isAdmin && (
              <button
                type="button"
                className="sidebar-btn"
                onClick={() => setIsInviteDialogOpen(true)}
              >
                <FiUserPlus /> {sidebarOpen && "Invite Teammates"}
              </button>
            )}
          </div>
        </div>
      </aside>

      <CreateWorkspaceDialog
        isOpen={isWorkspaceDialogOpen}
        onClose={() => setIsWorkspaceDialogOpen(false)}
      />

      <InviteTeammateDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
      />
    </>
  );
}

export default Sidebar;