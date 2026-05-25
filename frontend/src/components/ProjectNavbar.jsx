import { NavLink, useParams } from "react-router-dom";
import { FiLayout, FiCheckSquare, FiCalendar, FiBarChart2, FiSettings, FiFileText } from "react-icons/fi";

function ProjectNavbar() {

  const { id } = useParams();

  return (
    <nav className="project-nav">
      <NavLink to={`/projects/${id}/tasks`} className={({ isActive }) => "project-nav-link" + (isActive ? " active" : "")}>
        <FiCheckSquare /> Tasks
      </NavLink>
      <NavLink to={`/projects/${id}`} className={({ isActive }) => "project-nav-link" + (isActive ? " active" : "")} end>
        <FiLayout /> Board
      </NavLink>
      <NavLink to={`/projects/${id}/files`} className={({ isActive }) => "project-nav-link" + (isActive ? " active" : "")}>
        <FiFileText /> Files
      </NavLink>
      <NavLink to={`/projects/${id}/calendar`} className={({ isActive }) => "project-nav-link" + (isActive ? " active" : "")}>
        <FiCalendar /> Calendar
      </NavLink>
      <NavLink to={`/projects/${id}/analytics`} className={({ isActive }) => "project-nav-link" + (isActive ? " active" : "")}>
        <FiBarChart2 /> Analytics
      </NavLink>
      <NavLink to={`/projects/${id}/settings`} className={({ isActive }) => "project-nav-link" + (isActive ? " active" : "")}>
        <FiSettings /> Settings
      </NavLink>
    </nav>
  );
}

export default ProjectNavbar;