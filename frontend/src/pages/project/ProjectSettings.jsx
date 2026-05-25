import { useContext, useState } from "react";
import { FiUserPlus, FiSave } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { ProjectContext } from "../../context/ProjectContext";
import { api } from "../../api/client";

function ProjectSettings() {

  const { id } = useParams();
  const { projects, setProjects, members } = useContext(ProjectContext);

  const project = projects.find(p => p.id == id);

  const [title, setTitle] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState(project?.status || "active");
  const [priority, setPriority] = useState(project?.priority || "medium");
  const [startDate, setStartDate] = useState(project?.createdAt ? project.createdAt.split('T')[0] : "");
  const [dueDate, setDueDate] = useState(project?.dueDate || "");
  const [member, setMember] = useState("");

  // Using some mock members with roles and emails since the app doesn't have a full user database
  const availableMembers = [
    { id: 1, name: "Yashwanth", email: "yashwanth@company.com", role: "Team Lead" },
    { id: 2, name: "Rahul", email: "rahul@company.com", role: "Developer" },
    { id: 3, name: "Nivas", email: "nivas@company.com", role: "Designer" },
    { id: 4, name: "Singam", email: "singam@company.com", role: "Product Manager" }
  ];

  if(!project) return <div>Project not found</div>;

  const saveProject = async () => {
    // Update local state
    const updated = projects.map(p => {
      if(p.id != id) return p;
      return {
        ...p,
        name: title,
        description,
        status,
        priority,
        createdAt: startDate ? new Date(startDate).toISOString() : p.createdAt,
        dueDate
      };
    });
    setProjects(updated);

    // Persist to backend
    try {
      await api.updateProject(id, {
        name: title,
        description,
        status,
        priority,
        start_date: startDate || null,
        due_date: dueDate || null
      });
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  };

  const addMember = () => {
    if(!member) return;

    // Find the full member object from our mock list
    const memberToAdd = availableMembers.find(m => m.id.toString() === member);
    if (!memberToAdd) return;

    const updated = projects.map(p => {
      if(p.id != id) return p;
      
      // Prevent duplicates
      const currentMembers = p.projectMembers || [];
      if (currentMembers.some(m => m.id === memberToAdd.id)) return p;

      return {
        ...p,
        projectMembers: [...currentMembers, memberToAdd]
      };
    });

    setProjects(updated);
    setMember("");
  };

  const addTask = () => {

    const taskTitle = prompt("Enter task title");

    if(!taskTitle) return;

    const updated = projects.map(p => {

      if(p.id != id) return p;

      const newTask = {
        id: Date.now(),
        title: taskTitle,
        status: "todo",
        due: "",
        assignee: "",
        createdAt: new Date().toISOString(),
        comments: []
      };

      return {
        ...p,
        tasks: [...p.tasks, newTask]
      };

    });

    setProjects(updated);

  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 className="page-title" style={{ margin: 0 }}>Project Settings</h2>
        <button className="btn btn-primary" onClick={saveProject} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiSave size={16} /> Save Changes
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>

        {/* PROJECT INFO BOX */}
        <div className="dashboard-card" style={{ padding: "24px" }}>
          <h3 className="section-title" style={{ marginBottom: "20px" }}>Project Information</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>Title</label>
              <input className="input"
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>Description</label>
              <textarea className="input"
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)", minHeight: "100px", resize: "vertical" }}
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>Status</label>
                <select className="select"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
                  value={status}
                  onChange={(e)=>setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>Priority</label>
                <select className="select"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
                  value={priority}
                  onChange={(e)=>setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>Start Date</label>
                <input className="input"
                  type="date"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
                  value={startDate}
                  onChange={(e)=>setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>End Date</label>
                <input className="input"
                  type="date"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
                  value={dueDate}
                  onChange={(e)=>setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* MEMBERS BOX */}
        <div className="dashboard-card" style={{ padding: "24px" }}>
          <h3 className="section-title" style={{ marginBottom: "20px" }}>Project Members</h3>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <select className="select"
              style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
              value={member}
              onChange={(e)=>setMember(e.target.value)}
            >
              <option value="">Select a member to add</option>
              {availableMembers.map(m=>(
                <option key={m.id} value={m.id}>
                  {m.name} - {m.role}
                </option>
              ))}
            </select>
            <button 
              className="btn btn-primary" 
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 16px" }} 
              onClick={addMember}
              title="Add Member"
            >
              <FiUserPlus size={18} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(project.projectMembers || []).length === 0 ? (
              <p className="empty-state" style={{ fontSize: "14px", marginTop: "10px" }}>No dedicated members added yet.</p>
            ) : (
              (project.projectMembers || []).map((m, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "12px 16px", 
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px"
                }}>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--color-text)", marginBottom: "2px" }}>{m.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{m.email}</div>
                  </div>
                  <div style={{ 
                    fontSize: "12px", 
                    fontWeight: "500",
                    padding: "4px 10px", 
                    backgroundColor: "var(--color-surface)", 
                    border: "1px solid var(--color-border)",
                    borderRadius: "100px",
                    color: "var(--color-text-muted)"
                  }}>
                    {m.role}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProjectSettings;