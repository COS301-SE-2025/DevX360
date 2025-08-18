import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../../styles/_profile.css';
import '../../styles/_modals.css';
import '../../styles/_teams.css';
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

export default DashboardLayout;