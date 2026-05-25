import { useState, useEffect, useContext } from "react";
import { WorkspaceContext } from "../context/WorkspaceContext";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import CreateProjectDialog from "./CreateProjectDialog";
import CreateTaskDialog from "./CreateTaskDialog";

function OnboardingManager() {
  const { workspaces, loading } = useContext(WorkspaceContext);
  const [step, setStep] = useState("idle");

  useEffect(() => {
    if (!loading && workspaces.length === 0) {
      setStep("workspace");
    } else if (step === "workspace" && workspaces.length > 0) {
      setStep("project");
    }
  }, [loading, workspaces.length, step]);

  const handleNextStepFromProject = () => {
    setStep("task");
  };

  const handleNextStepFromTask = () => {
    setStep("idle");
  };

  if (step === "idle") return null;

  return (
    <>
      <CreateWorkspaceDialog 
        isOpen={step === "workspace"} 
        onClose={() => {}} 
        mandatory={true}
      />
      <CreateProjectDialog 
        isOpen={step === "project"} 
        onClose={handleNextStepFromProject}
        onSuccess={handleNextStepFromProject}
      />
      <CreateTaskDialog 
        isOpen={step === "task"} 
        onClose={handleNextStepFromTask}
        onSuccess={handleNextStepFromTask}
      />
    </>
  );
}

export default OnboardingManager;
