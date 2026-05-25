import { createContext, useState, useEffect, useContext } from "react";
import { api } from "../api/client";
import { WorkspaceContext } from "./WorkspaceContext";
import { ProjectContext } from "./ProjectContext";

export const ActivityContext = createContext();

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const { activeWorkspace, workspaces } = useContext(WorkspaceContext);
  const { projects } = useContext(ProjectContext);

  useEffect(() => {
    async function fetchActivities() {
      if (!activeWorkspace) {
        setActivities([]);
        return;
      }
      try {
        const data = await api.getWorkspaceActivity(activeWorkspace.id);
        if (Array.isArray(data)) {
          setActivities(data);
        }
      } catch (err) {
        console.error("Failed to fetch activity logs", err);
      }
    }
    fetchActivities();
  }, [activeWorkspace, workspaces, projects]);

  return (
    <ActivityContext.Provider value={{ activities, setActivities }}>
      {children}
    </ActivityContext.Provider>
  );
}