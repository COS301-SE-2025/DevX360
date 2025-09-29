<<<<<<< HEAD
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../../styles/dashboard.css';


//===========================================================Dashboard Layout Function======================================
// Provides the main layout structure for all dashboard pages with a sidebar and main content area
function DashboardLayout() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

=======
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../../styles/dashboard.css';


//===========================================================Dashboard Layout Function======================================
// Provides the main layout structure for all dashboard pages with a sidebar and main content area
function DashboardLayout() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

>>>>>>> dev
export default DashboardLayout;