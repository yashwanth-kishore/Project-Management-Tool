import { useState, useRef, useEffect, useContext, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiSearch, FiPlus, FiMoon, FiSun, FiMenu, FiLogOut, FiFolder, FiGrid, FiChevronDown, FiCheckCircle } from "react-icons/fi";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { ProjectContext } from "../context/ProjectContext";
import CreateProjectDialog from "./CreateProjectDialog";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import LogoutConfirmDialog from "./LogoutConfirmDialog";

function Navbar() {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { projects } = useContext(ProjectContext);
  const showOpenMenu = !sidebarOpen;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    navigate("/login", { replace: true });
  };

  const searchResults = useMemo(() => {
    if (!search.trim() || !projects) return { projects: [], tasks: [] };
    const query = search.toLowerCase();
    
    const matchedProjects = projects.filter(p => p.name?.toLowerCase().includes(query)).slice(0, 3);
    
    let matchedTasks = [];
    projects.forEach(p => {
      if (p.tasks) {
        p.tasks.forEach(t => {
          if (t.title?.toLowerCase().includes(query)) {
            matchedTasks.push({ ...t, projectName: p.name, projectId: p.id });
          }
        });
      }
    });
    
    return {
      projects: matchedProjects,
      tasks: matchedTasks.slice(0, 5)
    };
  }, [search, projects]);

  return (
    <>
      <div className="navbar">

        {/* LEFT: Open menu + App name (only when sidebar is closed) */}
        <div className="navbar-left">
          {showOpenMenu && (
            <button
              type="button"
              className="navbar-icon-btn"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <FiMenu />
            </button>
          )}
          {showOpenMenu && <h3 className="navbar-title">STRATIFY</h3>}
        </div>

        {/* SEARCH + CREATE (beside each other) */}
        <div className="navbar-search-area">
          <div className="navbar-search-wrap">
            <FiSearch />
            <input
              className="navbar-search"
              placeholder="Search projects, tasks..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />
            {search.trim() && (
              <div className="search-results-dropdown">
                {searchResults.projects.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-title">Projects</div>
                    {searchResults.projects.map(p => (
                      <div key={p.id} className="search-result-item" onClick={() => { navigate(`/projects/${p.id}`); setSearch(""); }}>
                        <div className="search-result-info">
                          <span className="search-result-name">{p.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.tasks.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-title">Tasks</div>
                    {searchResults.tasks.map(t => (
                      <div key={t.id} className="search-result-item" onClick={() => { navigate(`/tasks?id=${t.id}`); setSearch(""); }}>
                        <div className="search-result-info">
                          <span className="search-result-name">{t.title}</span>
                          <span className="search-result-sub">{t.projectName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.projects.length === 0 && searchResults.tasks.length === 0 && (
                  <div className="search-no-results">No matches found for "{search}"</div>
                )}
              </div>
            )}
          </div>
          
          <div className="navbar-create-wrap" ref={dropdownRef}>
            <button 
              type="button" 
              className="navbar-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FiPlus /> Create
            </button>
            
            {dropdownOpen && (
              <div className="navbar-dropdown">
                <button 
                  className="navbar-dropdown-item" 
                  onClick={() => {
                    setWorkspaceDialogOpen(true);
                    setDropdownOpen(false);
                  }}
                >
                  <FiGrid /> Workspace
                </button>
                <button 
                  className="navbar-dropdown-item" 
                  onClick={() => {
                    setProjectDialogOpen(true);
                    setDropdownOpen(false);
                  }}
                >
                  <FiFolder /> Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="navbar-right">

          {/* THEME TOGGLE */}
          <button
            className="navbar-icon-btn"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <FiMoon /> : <FiSun />}
          </button>

          {/* LOGOUT */}
          <button
            type="button"
            className="navbar-icon-btn"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <FiLogOut />
          </button>

          {/* PROFILE */}
          <Link to="/profile" className="navbar-avatar-link" aria-label="Profile">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Profile"
              className="navbar-avatar"
              width="40"
              height="40"
            />
          </Link>

        </div>

      </div>

      <CreateProjectDialog 
        isOpen={projectDialogOpen} 
        onClose={() => setProjectDialogOpen(false)} 
      />
      <CreateWorkspaceDialog 
        isOpen={workspaceDialogOpen} 
        onClose={() => setWorkspaceDialogOpen(false)} 
      />
      <LogoutConfirmDialog 
        isOpen={logoutDialogOpen} 
        onClose={() => setLogoutDialogOpen(false)} 
        onConfirm={confirmLogout} 
      />
    </>
  );

}

export default Navbar;