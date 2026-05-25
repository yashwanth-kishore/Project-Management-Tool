import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { ProjectProvider } from "./context/ProjectContext";
import { ActivityProvider } from "./context/ActivityContext";

import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AcceptInvite from "./pages/AcceptInvite";

import ProjectLayout from "./pages/project/ProjectLayout";
import ProjectBoard from "./pages/project/ProjectBoard";
import ProjectTasks from "./pages/project/ProjectTasks";
import ProjectFiles from "./pages/project/ProjectFiles";
import ProjectCalendar from "./pages/project/ProjectCalendar";
import ProjectAnalytics from "./pages/project/ProjectAnalytics";
import ProjectSettings from "./pages/project/ProjectSettings";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <WorkspaceProvider>
            <ProjectProvider>
              <ActivityProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/inbox"
                      element={
                        <ProtectedRoute>
                          <Inbox />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tasks"
                      element={
                        <ProtectedRoute>
                          <Tasks />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/projects"
                      element={
                        <ProtectedRoute>
                          <Projects />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/projects/:id"
                      element={
                        <ProtectedRoute>
                          <ProjectLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<ProjectBoard />} />
                      <Route path="tasks" element={<ProjectTasks />} />
                      <Route path="files" element={<ProjectFiles />} />
                      <Route path="calendar" element={<ProjectCalendar />} />
                      <Route path="analytics" element={<ProjectAnalytics />} />
                      <Route path="settings" element={<ProjectSettings />} />
                    </Route>

                    <Route path="/invite" element={<AcceptInvite />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </BrowserRouter>
              </ActivityProvider>
            </ProjectProvider>
          </WorkspaceProvider>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;