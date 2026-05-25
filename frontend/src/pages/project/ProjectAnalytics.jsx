import { useContext } from "react";
import { useParams } from "react-router-dom";
import { ProjectContext } from "../../context/ProjectContext";
import {
  FiCheckCircle, FiClock, FiAlertCircle, FiUsers, FiTrendingUp
} from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";

const COLORS = ["#3b82f6", "#06b6d4", "#ef4444", "#10b981"];
const PRIORITY_COLORS = ["#10b981", "#06b6d4", "#ef4444"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        padding: "10px 16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        fontSize: "13px",
        color: "var(--color-text)"
      }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{label || payload[0]?.name}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || p.stroke, margin: 0 }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function ProjectAnalytics() {
  const { id } = useParams();
  const { projects } = useContext(ProjectContext);
  const project = projects.find(p => p.id == id);
  if (!project) return <div>Project not found</div>;

  const tasks = project.tasks;

  /* ---------- STATUS ---------- */
  const statusCounts = { todo: 0, progress: 0, review: 0, done: 0 };
  tasks.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
  const statusData = [
    { name: "To Do", value: statusCounts.todo },
    { name: "In Progress", value: statusCounts.progress },
    { name: "Review", value: statusCounts.review },
    { name: "Done", value: statusCounts.done }
  ];

  /* ---------- PRIORITY ---------- */
  const priorityCounts = { low: 0, medium: 0, high: 0 };
  tasks.forEach(t => { const p = t.priority || "medium"; priorityCounts[p]++; });
  const priorityData = [
    { name: "Low", value: priorityCounts.low },
    { name: "Medium", value: priorityCounts.medium },
    { name: "High", value: priorityCounts.high }
  ];

  /* ---------- MEMBERS ---------- */
  const memberMap = {};
  tasks.forEach(t => {
    const m = t.assignee || "Unassigned";
    if (!memberMap[m]) memberMap[m] = { tasks: 0, completed: 0 };
    memberMap[m].tasks++;
    if (t.status === "done") memberMap[m].completed++;
  });
  const memberData = Object.keys(memberMap).map(m => ({ name: m, tasks: memberMap[m].tasks }));
  const completionData = Object.keys(memberMap).map(m => ({ name: m, completed: memberMap[m].completed }));

  /* ---------- PROGRESS ---------- */
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  /* ---------- OVERDUE ---------- */
  const today = new Date();
  const overdueTasks = tasks.filter(t => t.due && new Date(t.due) < today && t.status !== "done");

  /* ---------- TIMELINE ---------- */
  const timeline = {};
  tasks.forEach(t => {
    if (!t.createdAt) return;
    const d = new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!timeline[d]) timeline[d] = 0;
    timeline[d]++;
  });
  const timelineData = Object.keys(timeline).map(d => ({ date: d, tasks: timeline[d] }));

  /* ---------- UPCOMING DEADLINES ---------- */
  const upcoming = tasks
    .filter(t => t.due && t.status !== "done")
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 5);

  const summaryCards = [
    { label: "Total Tasks", value: totalTasks, icon: <FiClock size={22} />, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { label: "Completed", value: completedTasks, icon: <FiCheckCircle size={22} />, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Overdue", value: overdueTasks.length, icon: <FiAlertCircle size={22} />, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    { label: "Active Members", value: Object.keys(memberMap).length, icon: <FiUsers size={22} />, color: "#06b6d4", bg: "rgba(6,182,212,0.1)" }
  ];

  return (
    <div className="analytics-page">

      {/* HEADER */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">{project.name} Analytics</h2>
          <p className="analytics-subtitle">Real-time data insights for project health and team performance.</p>
        </div>
        <div className="analytics-progress-badge">
          <FiTrendingUp size={18} />
          <span>{progress}% Complete</span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="analytics-summary-grid">
        {summaryCards.map((card, i) => (
          <div key={i} className="analytics-stat-card">
            <div className="analytics-stat-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div className="analytics-stat-value" style={{ color: card.color }}>{card.value}</div>
              <div className="analytics-stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* PROJECT PROGRESS BAR */}
      <div className="analytics-card" style={{ marginBottom: "28px" }}>
        <div className="analytics-card-header">
          <h3 className="analytics-card-title">Overall Project Progress</h3>
          <span className="analytics-badge">{progress}%</span>
        </div>
        <div className="analytics-progress-track">
          <div
            className="analytics-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="analytics-progress-labels">
          <span>{completedTasks} of {totalTasks} tasks completed</span>
          <span>{overdueTasks.length} overdue</span>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="analytics-charts-grid">

        {/* STATUS PIE */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">Task Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" outerRadius={90} innerRadius={40} paddingAngle={3}>
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* PRIORITY PIE */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">Task Priority</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" outerRadius={90} innerRadius={40} paddingAngle={3}>
                {priorityData.map((_, index) => (
                  <Cell key={index} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* MEMBER WORKLOAD BAR */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">Tasks per Member</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={memberData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MEMBER COMPLETION BAR */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">Completed per Member</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={completionData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(16,185,129,0.06)" }} />
              <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TIMELINE LINE CHART - FULL WIDTH */}
        <div className="analytics-card analytics-card-full">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">Task Creation Timeline</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* UPCOMING DEADLINES */}
      {upcoming.length > 0 && (
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">Upcoming Deadlines</h3>
            <span className="analytics-badge analytics-badge-warning">{upcoming.length} pending</span>
          </div>
          <div className="analytics-deadlines-list">
            {upcoming.map(task => {
              const daysLeft = Math.ceil((new Date(task.due) - today) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft <= 2;
              return (
                <div key={task.id} className={`analytics-deadline-item ${isUrgent ? "urgent" : ""}`}>
                  <div className="analytics-deadline-dot" style={{ background: isUrgent ? "#ef4444" : "#06b6d4" }} />
                  <div className="analytics-deadline-content">
                    <span className="analytics-deadline-title">{task.title}</span>
                    <span className="analytics-deadline-meta">{task.assignee || "Unassigned"}</span>
                  </div>
                  <div className={`analytics-deadline-badge ${isUrgent ? "urgent" : ""}`}>
                    {daysLeft <= 0 ? "Overdue" : `${daysLeft}d left`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default ProjectAnalytics;