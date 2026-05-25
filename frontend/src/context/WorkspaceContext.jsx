import { createContext, useEffect, useState, useCallback, useContext } from "react";
import { api } from "../api/client";
import { AuthContext } from "./AuthContext";

export const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // "Admin" | "Member" | null

  const setActiveWorkspace = useCallback((ws) => {
    setActiveWorkspaceState(ws);
    setUserRole(ws?.user_role || null);
  }, []);

  const fetchWorkspaces = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setActiveWorkspaceState(null);
      setUserRole(null);
      return;
    }

    try {
      setLoading(true);
      const data = await api.getWorkspaces();
      if (Array.isArray(data)) {
        setWorkspaces(data);
        if (data.length > 0) {
          setActiveWorkspaceState(data[0]);
          setUserRole(data[0].user_role || "Admin");
        }
      }
    } catch (err) {
      console.error("Failed to load workspaces from API:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const createWorkspace = async (name, logo = null) => {
    try {
      const newWs = await api.createWorkspace({ name, logo });
      setWorkspaces(prev => [...prev, newWs]);
      setActiveWorkspaceState(newWs);
      setUserRole(newWs.user_role || "Admin");
    } catch (err) {
      console.error("Failed to create workspace:", err);
      const fallbackWs = { id: Date.now(), name, logo, user_role: "Admin" };
      setWorkspaces(prev => [...prev, fallbackWs]);
      setActiveWorkspaceState(fallbackWs);
      setUserRole("Admin");
    }
  };

  const deleteWorkspace = async (id) => {
    try {
      await api.deleteWorkspace(id);
      setWorkspaces(prev => {
        const updated = prev.filter(w => w.id !== id);
        return updated;
      });
      if (activeWorkspace?.id === id) {
        setWorkspaces(prev => {
           setActiveWorkspaceState(prev.length > 0 ? prev[0] : null);
           setUserRole(prev.length > 0 ? (prev[0].user_role || null) : null);
           return prev;
        });
      }
    } catch (err) {
      console.error("Failed to delete workspace:", err);
      throw err;
    }
  };

  const isAdmin = userRole === "Admin";

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        setWorkspaces,
        activeWorkspace,
        setActiveWorkspace,
        createWorkspace,
        deleteWorkspace,
        fetchWorkspaces,
        userRole,
        isAdmin,
        loading
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}