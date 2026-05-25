import { Outlet } from "react-router-dom";
import Layout from "../../components/Layout";
import ProjectNavbar from "../../components/ProjectNavbar";

function ProjectLayout() {

  return (
    <Layout>

      <ProjectNavbar />

      <div style={{ marginTop: "20px" }}>
        <Outlet />
      </div>

    </Layout>
  );

}

export default ProjectLayout;