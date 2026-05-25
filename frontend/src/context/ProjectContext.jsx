import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { WorkspaceContext } from "./WorkspaceContext";
import { api } from "../api/client";

export const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const { activeWorkspace } = useContext(WorkspaceContext);

  const [members] = useState([
    { id: 1, name: "Yashwanth" },
    { id: 2, name: "Rahul" },
    { id: 3, name: "Nivas" }
  ]);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load projects from API when workspace changes
  const loadProjects = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    try {
      setLoading(true);
      const data = await api.getProjects(activeWorkspace.id);
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      // Keep existing state on error
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const activeProjects = projects.filter(p => !p.workspaceId || p.workspaceId === activeWorkspace?.id);

  const addProject = async (projectData) => {
    // Optimistic local update
    const tempProject = {
      id: Date.now(),
      workspaceId: activeWorkspace?.id,
      name: projectData.name,
      description: projectData.description || "",
      status: projectData.status || "active",
      priority: projectData.priority || "medium",
      createdAt: projectData.createdAt || new Date().toISOString(),
      dueDate: projectData.dueDate || "",
      participants: [],
      tasks: [],
      projectMembers: []
    };

    setProjects(prev => [...prev, tempProject]);

    try {
      const created = await api.createProject({
        name: projectData.name,
        description: projectData.description || "",
        status: projectData.status || "active",
        priority: projectData.priority || "medium",
        start_date: projectData.startDate || projectData.createdAt?.split("T")[0] || null,
        due_date: projectData.dueDate || null,
        workspace_id: activeWorkspace?.id
      });

      // Replace temp with real server response
      setProjects(prev =>
        prev.map(p => p.id === tempProject.id ? {
          ...created,
          workspaceId: created.workspace_id || activeWorkspace?.id,
          createdAt: created.createdAt || created.start_date || new Date().toISOString(),
          dueDate: created.dueDate || created.due_date || "",
          tasks: created.tasks || [],
          projectMembers: created.projectMembers || [],
          participants: []
        } : p)
      );
    } catch (err) {
      console.error("Failed to create project:", err);
      // Keep the temp project in UI so user doesn't lose data
    }
  };

  const deleteProject = async (projectId) => {
    const previous = projects;
    setProjects(prev => prev.filter(p => p.id !== projectId));

    try {
      await api.deleteProject(projectId);
    } catch (err) {
      console.error("Failed to delete project:", err);
      setProjects(previous); // Rollback
    }
  };

  const addTask = async (projectId, taskData) => {
    // Optimistic local update
    const tempTask = {
      id: Date.now(),
      title: taskData.title,
      description: taskData.description || "",
      priority: taskData.priority || "medium",
      status: taskData.status || "todo",
      due: taskData.due || "",
      assignee: taskData.assignee || "",
      createdAt: new Date().toISOString(),
      comments: []
    };

    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      return { ...project, tasks: [...project.tasks, tempTask] };
    }));

    try {
      const created = await api.createTask({
        title: taskData.title,
        description: taskData.description || "",
        priority: taskData.priority || "medium",
        status: taskData.status || "todo",
        due_date: taskData.due || null,
        assignee: taskData.assignee || "",
        project_id: projectId
      });

      // Replace temp with server response
      setProjects(prev => prev.map(project => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          tasks: project.tasks.map(t => t.id === tempTask.id ? created : t)
        };
      }));
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const updateTask = async (projectId, taskId, field, value) => {
    // Optimistic local update
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        tasks: project.tasks.map(task => {
          if (task.id !== taskId) return task;
          return { ...task, [field]: value };
        })
      };
    }));

    try {
      // Map frontend field names to backend field names
      const backendField = field === "due" ? "due_date" : field;
      await api.updateTask(taskId, { [backendField]: value });
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const updateTaskStatus = async (projectId, taskId, newStatus) => {
    updateTask(projectId, taskId, "status", newStatus);
  };

  const addComment = async (projectId, taskId, text) => {
    try {
      const commentData = await api.addComment({
        task_id: taskId,
        comment: text
      });

      setProjects(prev => prev.map(project => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id !== taskId) return task;
            return {
              ...task,
              comments: [...(task.comments || []), { ...commentData, name: user?.name || 'You' }]
            };
          })
        };
      }));
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects: activeProjects,
        setProjects,
        members,
        loading,
        addProject,
        deleteProject,
        addTask,
        updateTask,
        updateTaskStatus,
        addComment,
        reloadProjects: loadProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}