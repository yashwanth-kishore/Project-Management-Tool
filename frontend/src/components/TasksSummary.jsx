import { useContext } from "react";
import { Link } from "react-router-dom";
import { ProjectContext } from "../context/ProjectContext";

function TasksSummary() {
  const { projects } = useContext(ProjectContext);
  const allTasks = projects.flatMap((p) =>
    (p.tasks || []).map((t) => ({ ...t, projectName: p.name, projectId: p.id }))
  );
  const todo = allTasks.filter((t) => t.status === "todo").slice(0, 5);
  const inProgress = allTasks.filter((t) => t.status === "progress").slice(0, 3);

  return (
    <div className="dashboard-card tasks-summary">
      <h3 className="section-title">Tasks Summary</h3>
      <div className="tasks-summary-section">
        <h4 className="tasks-summary-label">To do</h4>
        {todo.length === 0 ? (
          <p className="empty-state small">No tasks</p>
        ) : (
          <ul className="tasks-summary-list">
            {todo.map((task) => (
              <li key={task.id}>
                <Link to="/tasks" className="tasks-summary-link">
                  {task.title}
                </Link>
                <span className="tasks-summary-project">{task.projectName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="tasks-summary-section">
        <h4 className="tasks-summary-label">In progress</h4>
        {inProgress.length === 0 ? (
          <p className="empty-state small">No tasks</p>
        ) : (
          <ul className="tasks-summary-list">
            {inProgress.map((task) => (
              <li key={task.id}>
                <Link to="/tasks" className="tasks-summary-link">
                  {task.title}
                </Link>
                <span className="tasks-summary-project">{task.projectName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link to="/tasks" className="btn btn-secondary btn-sm" style={{ marginTop: "12px" }}>
        View all tasks
      </Link>
    </div>
  );
}

export default TasksSummary;
