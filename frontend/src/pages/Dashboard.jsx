import { useState } from "react";
import { Plus } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import StatsGrid from "../components/StatsGrid";
import ProjectOverview from "../components/ProjectOverview";
import RecentActivity from "../components/RecentActivity";
import TasksSummary from "../components/TasksSummary";
import CreateProjectDialog from "../components/CreateProjectDialog";

function Dashboard() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const displayName = user?.name || user?.fullName || "User";

  return (
    <Layout>
      <div className="dashboard-hero">
        <div className="dashboard-hero-text">
          <h1>Welcome back, {displayName}</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
        <button
          type="button"
          className="dashboard-hero-btn"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      <StatsGrid />

      <div className="dashboard-main-grid">
        <div className="dashboard-main-left">
          <ProjectOverview />
          <RecentActivity />
        </div>
        <div>
          <TasksSummary />
        </div>
      </div>

      <CreateProjectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Layout>
  );
}

export default Dashboard;
