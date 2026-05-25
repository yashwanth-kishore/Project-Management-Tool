import { useContext, useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { ProjectContext } from "../../context/ProjectContext";
import CreateTaskDialog from "../../components/CreateTaskDialog";

function ProjectTasks() {

  const { id } = useParams();
  const { projects, setProjects, addTask, members } = useContext(ProjectContext);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const project = projects.find(p => p.id == id);

  const updateTask = (taskId, field, value) => {

    const updatedProjects = projects.map(p => {

      if (p.id != id) return p;

      return {
        ...p,
        tasks: p.tasks.map(task => {

          if (task.id != taskId) return task;

          return {
            ...task,
            [field]: value
          };

        })
      };

    });

    setProjects(updatedProjects);

  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="page-title" style={{ margin: 0 }}>{project.name} Tasks</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiPlus size={18} /> Add Task
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>

            <th>Priority</th>

            <th>Status</th>

            <th>Assignee</th>

            <th>Due Date</th>

          </tr>

        </thead>

        <tbody>

          {project.tasks.map(task => (

            <tr key={task.id}>

              {/* TITLE */}
              <td>{task.title}</td>

              {/* PRIORITY */}
              <td>
                <select className="select"
                  value={task.priority || "medium"}
                  onChange={(e)=>updateTask(task.id,"priority",e.target.value)}
                >

                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>

                </select>

              </td>

              {/* STATUS */}
              <td>
                <select className="select"
                  value={task.status}
                  onChange={(e)=>updateTask(task.id,"status",e.target.value)}
                >

                  <option value="todo">To Do</option>
                  <option value="progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>

                </select>

              </td>

              {/* ASSIGNEE */}
              <td>{task.assignee || "Unassigned"}</td>

              {/* DUE DATE */}
              <td>

              <input
                className="input"
                type="date"
                  value={task.due || ""}
                  onChange={(e)=>updateTask(task.id,"due",e.target.value)}
                />

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <CreateTaskDialog 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultProjectId={project.id}
        hideProjectSelection={true}
      />
    </div>

  );

}

export default ProjectTasks;