import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { ProjectContext } from "../../context/ProjectContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  FiPlus, FiFlag, FiUser, FiCalendar, FiMoreHorizontal, FiCheckCircle, FiClock, FiEye, FiCheck
} from "react-icons/fi";
import CreateTaskDialog from "../../components/CreateTaskDialog";

const COLUMN_META = {
  todo: { label: "To Do", color: "#64748b", accent: "rgba(100,116,139,0.12)", dot: "#64748b" },
  progress: { label: "In Progress", color: "#3b82f6", accent: "rgba(59,130,246,0.1)", dot: "#3b82f6" },
  review: { label: "In Review", color: "#06b6d4", accent: "rgba(6,182,212,0.1)", dot: "#06b6d4" },
  done: { label: "Done", color: "#10b981", accent: "rgba(16,185,129,0.1)", dot: "#10b981" },
};

const PRIORITY_COLORS = {
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  medium: { color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  low: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

function TaskCard({ task, provided, isDragging }) {
  const priority = PRIORITY_COLORS[task.priority || "medium"];
  const isOverdue = task.due && new Date(task.due) < new Date() && task.status !== "done";

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="board-task-card"
      style={{
        ...provided.draggableProps.style,
        boxShadow: isDragging
          ? "0 16px 40px rgba(59,130,246,0.2), 0 4px 12px rgba(0,0,0,0.1)"
          : undefined,
        borderColor: isDragging ? "var(--color-primary)" : undefined,
        opacity: isDragging ? 0.97 : 1,
      }}
    >
      {/* Priority tag */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <span style={{
          fontSize: "11px", fontWeight: 700, padding: "3px 8px",
          borderRadius: "20px", background: priority.bg, color: priority.color,
          textTransform: "uppercase", letterSpacing: "0.5px"
        }}>
          <FiFlag size={9} style={{ marginRight: 3 }} />
          {task.priority || "medium"}
        </span>
        {task.status === "done" && (
          <FiCheckCircle size={14} color="#10b981" />
        )}
      </div>

      {/* Title */}
      <div style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "14px", marginBottom: "12px", lineHeight: 1.4 }}>
        {task.title}
      </div>

      {/* Description snippet */}
      {task.description && (
        <div style={{
          fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "12px", lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
        }}>
          {task.description}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: "10px" }}>
        {task.assignee ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%",
              background: "var(--color-primary)", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", fontWeight: 700, flexShrink: 0
            }}>
              {task.assignee.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.assignee}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <FiUser size={11} /> Unassigned
          </span>
        )}
        {task.due && (
          <span style={{
            fontSize: "11px", fontWeight: 600,
            color: isOverdue ? "#ef4444" : "var(--color-text-muted)",
            display: "flex", alignItems: "center", gap: 4
          }}>
            <FiCalendar size={11} />
            {new Date(task.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
}

function ProjectBoard() {
  const { id } = useParams();
  const { projects, updateTaskStatus } = useContext(ProjectContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState("todo");

  const project = projects.find(p => p.id == id);
  if (!project) return <div>Project not found</div>;

  const onDragEnd = (result) => {
    if (!result.destination) return;
    updateTaskStatus(project.id, parseInt(result.draggableId), result.destination.droppableId);
  };

  const openModalFor = (status) => {
    setActiveStatus(status);
    setIsModalOpen(true);
  };

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(t => t.status === "done").length;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="board-page">

      {/* Board Header */}
      <div className="board-page-header">
        <div>
          <h2 className="board-page-title">{project.name} Board</h2>
          <div className="board-page-meta">
            <span>{totalTasks} tasks</span>
            <span className="board-meta-sep">·</span>
            <span style={{ color: "#10b981", fontWeight: 600 }}>{doneTasks} completed</span>
            <span className="board-meta-sep">·</span>
            <span>{progress}% done</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="btn btn-primary" onClick={() => openModalFor("todo")} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiPlus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-kanban">
          {Object.entries(COLUMN_META).map(([key, meta]) => {
            const colTasks = project.tasks.filter(t => t.status === key);
            return (
              <Droppable droppableId={key} key={key}>
                {(provided, snapshot) => (
                  <div
                    className={`board-col${snapshot.isDraggingOver ? " board-col-drag-over" : ""}`}
                  >
                    {/* Column Header */}
                    <div className="board-col-header" style={{ borderTop: `3px solid ${meta.color}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="board-col-dot" style={{ background: meta.color }} />
                        <span className="board-col-title">{meta.label}</span>
                        <span className="board-col-count" style={{ background: meta.accent, color: meta.color }}>
                          {colTasks.length}
                        </span>
                      </div>
                      <button
                        className="board-col-add"
                        onClick={() => openModalFor(key)}
                        title={`Add to ${meta.label}`}
                      >
                        <FiPlus size={15} />
                      </button>
                    </div>

                    {/* Cards */}
                    <div
                      className="board-col-body"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="board-col-empty">
                          <FiCheckCircle size={22} style={{ opacity: 0.2, marginBottom: 8 }} />
                          <span>Drop tasks here</span>
                        </div>
                      )}
                      {colTasks.map((task, index) => (
                        <Draggable draggableId={task.id.toString()} index={index} key={task.id}>
                          {(provided, snapshot) => (
                            <TaskCard task={task} provided={provided} isDragging={snapshot.isDragging} />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <CreateTaskDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultStatus={activeStatus}
        defaultProjectId={project.id}
        hideProjectSelection={true}
      />
    </div>
  );
}

export default ProjectBoard;