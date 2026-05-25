import { useContext, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ProjectContext } from "../../context/ProjectContext";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiFlag, FiCircle, FiCheckCircle } from "react-icons/fi";
import CreateTaskDialog from "../../components/CreateTaskDialog";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_COLORS = {
  todo: { color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  progress: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  review: { color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  done: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

const PRIORITY_COLORS = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#10b981",
};

function ProjectCalendar() {
  const { id } = useParams();
  const { projects } = useContext(ProjectContext);
  const project = projects.find(p => p.id == id);

  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalDefaultDate, setModalDefaultDate] = useState(null);

  if (!project) return <div>Project not found</div>;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(null); };

  // Build day grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, currentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, currentMonth: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++)
    cells.push({ day: d, currentMonth: false });

  // Map task due dates
  const tasksByDate = useMemo(() => {
    const map = {};
    project.tasks.forEach(task => {
      if (!task.due) return;
      const d = new Date(task.due);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [project.tasks, year, month]);

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const selectedTasks = selectedDay ? (tasksByDate[selectedDay] || []) : [];

  // Summary counts
  const monthTasks = Object.values(tasksByDate).flat();
  const doneTasks = monthTasks.filter(t => t.status === "done").length;
  const overdue = monthTasks.filter(t => new Date(t.due) < today && t.status !== "done").length;

  return (
    <div className="cal-page">

      {/* Header */}
      <div className="cal-header">
        <div>
          <h2 className="cal-title">{project.name} Calendar</h2>
          <p className="cal-subtitle">{monthTasks.length} task{monthTasks.length !== 1 ? "s" : ""} due this month · {doneTasks} done · {overdue} overdue</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="cal-nav-btn" onClick={prevMonth}><FiChevronLeft size={18} /></button>
          <span className="cal-month-label">{MONTHS[month]} {year}</span>
          <button className="cal-nav-btn" onClick={nextMonth}><FiChevronRight size={18} /></button>
          <button className="cal-today-btn" onClick={goToday}>Today</button>
        </div>
      </div>

      <div className="cal-layout">

        {/* Calendar grid */}
        <div className="cal-grid-wrap">
          {/* Day names */}
          <div className="cal-day-names">
            {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
          </div>

          {/* Cells */}
          <div className="cal-cells">
            {cells.map((cell, i) => {
              const tasks = cell.currentMonth ? (tasksByDate[cell.day] || []) : [];
              const isTd = cell.currentMonth && isToday(cell.day);
              const isSel = cell.currentMonth && selectedDay === cell.day;
              return (
                <div
                  key={i}
                  className={`cal-cell${!cell.currentMonth ? " cal-cell-other" : ""}${isTd ? " cal-cell-today" : ""}${isSel ? " cal-cell-selected" : ""}`}
                  onClick={() => {
                    if (cell.currentMonth) {
                      if (selectedDay === cell.day) {
                        // If already selected, open the modal for this date
                        setModalDefaultDate(new Date(year, month, cell.day));
                        setIsTaskModalOpen(true);
                      } else {
                        setSelectedDay(cell.day);
                      }
                    }
                  }}
                  onDoubleClick={() => {
                    if (cell.currentMonth) {
                      setModalDefaultDate(new Date(year, month, cell.day));
                      setIsTaskModalOpen(true);
                    }
                  }}
                >
                  <span className="cal-cell-num">{cell.day}</span>
                  <div className="cal-cell-dots">
                    {tasks.slice(0, 3).map(t => (
                      <div
                        key={t.id}
                        className="cal-dot"
                        style={{ background: STATUS_COLORS[t.status]?.color || "#3b82f6" }}
                        title={t.title}
                      />
                    ))}
                    {tasks.length > 3 && (
                      <span className="cal-dot-more">+{tasks.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="cal-side">

          {/* Legend */}
          <div className="cal-legend">
            {Object.entries(STATUS_COLORS).map(([status, c]) => (
              <div key={status} className="cal-legend-item">
                <div className="cal-legend-dot" style={{ background: c.color }} />
                <span>{status === "progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </div>
            ))}
          </div>

          {/* Selected day tasks */}
          <div className="cal-side-tasks">
            <h4 className="cal-side-title">
              <FiCalendar size={14} />
              {selectedDay
                ? `${MONTHS[month].slice(0, 3)} ${selectedDay} Tasks`
                : "Click a day to see tasks"}
            </h4>

            {selectedDay && (
              <button 
                className="btn btn-primary" 
                style={{ width: "100%", marginBottom: "16px", padding: "8px", fontSize: "13px" }}
                onClick={() => {
                  setModalDefaultDate(new Date(year, month, selectedDay));
                  setIsTaskModalOpen(true);
                }}
              >
                + Create Task for {selectedDay} {MONTHS[month].slice(0, 3)}
              </button>
            )}

            {selectedDay && selectedTasks.length === 0 && (
              <div className="cal-empty">
                <FiCheckCircle size={28} style={{ opacity: 0.15, marginBottom: 8 }} />
                <span>No tasks due this day</span>
              </div>
            )}

            {selectedTasks.map(task => {
              const st = STATUS_COLORS[task.status] || STATUS_COLORS.todo;
              return (
                <div key={task.id} className="cal-task-item">
                  <div className="cal-task-dot" style={{ background: st.color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cal-task-title">{task.title}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                      <span className="cal-task-badge" style={{ background: st.bg, color: st.color }}>
                        {task.status === "progress" ? "In Progress" : task.status}
                      </span>
                      {task.priority && (
                        <span className="cal-task-badge" style={{
                          background: "rgba(0,0,0,0.04)", color: PRIORITY_COLORS[task.priority]
                        }}>
                          <FiFlag size={9} style={{ marginRight: 2 }} />
                          {task.priority}
                        </span>
                      )}
                    </div>
                    {task.assignee && (
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>
                        👤 {task.assignee}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upcoming this month */}
          {!selectedDay && (
            <div className="cal-side-tasks" style={{ marginTop: 16 }}>
              <h4 className="cal-side-title"><FiCalendar size={14} /> All Due This Month</h4>
              {monthTasks.length === 0 && (
                <div className="cal-empty"><span>No tasks due this month</span></div>
              )}
              {monthTasks.sort((a, b) => new Date(a.due) - new Date(b.due)).map(task => {
                const st = STATUS_COLORS[task.status] || STATUS_COLORS.todo;
                return (
                  <div key={task.id} className="cal-task-item" style={{ cursor: "pointer" }}
                    onClick={() => setSelectedDay(new Date(task.due).getDate())}>
                    <div className="cal-task-dot" style={{ background: st.color }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cal-task-title">{task.title}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                        Due {new Date(task.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      <CreateTaskDialog
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultProjectId={project.id}
        hideProjectSelection={true}
        defaultDueDate={modalDefaultDate ? modalDefaultDate.toISOString().split('T')[0] : null}
      />

    </div>
  );
}

export default ProjectCalendar;