import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import OnboardingManager from "./OnboardingManager";

function Layout({ children }) {

  return (

    <div className="app-layout">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="app-main">

        <Navbar />

        {/* PAGE CONTENT */}
        <div className="app-content">
          {children}
        </div>

      </div>

      <OnboardingManager />
    </div>

  );

}

export default Layout;