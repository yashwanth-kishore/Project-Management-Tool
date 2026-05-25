import { useContext } from "react";
import { FiFolder, FiCheckCircle, FiList, FiAlertCircle } from "react-icons/fi";
import { ProjectContext } from "../context/ProjectContext";
import { WorkspaceContext } from "../context/WorkspaceContext";

function StatsGrid() {
  const { projects } = useContext(ProjectContext);
  const { activeWorkspace } = useContext(WorkspaceContext);
  
  const allTasks = projects.flatMap((p) => p.tasks || []);
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const myTasks = allTasks.filter((t) => t.assignee).length;
  const overdueTasks = allTasks.filter(
    (t) => t.due && new Date(t.due) < new Date() && t.status !== "done"
  ).length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <FiFolder />
        <h3>{totalProjects}</h3>
        <p>{activeWorkspace?.name || "Global"} Projects</p>
      </div>
      <div className="stat-card">
        <FiCheckCircle />
        <h3>{completedProjects}/{totalProjects}</h3>
        <p>Completed Projects</p>
      </div>
      <div className="stat-card">
        <FiList />
        <h3>{myTasks}</h3>
        <p>Assigned Tasks</p>
      </div>
      <div className="stat-card">
        <FiAlertCircle />
        <h3>{overdueTasks}</h3>
        <p>Overdue Tasks</p>
      </div>
    </div>
  );
}

export default StatsGrid;
