import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

//===========================================================Sidebar Component Function======================================
// The main navigation sidebar with links to all dashboard sections and logout functionality
function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle logout action
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if a nav item is active based on current route
  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo">DevX360</div>
        <div className="tagline">Engineering Intelligence Platform</div>
      </div>

      {/* Main navigation links */}
      <nav className="main-nav">
        <NavLink 
          to="/dashboard/overview" 
          className={`nav-item ${isActive('/dashboard/overview') ? 'active' : ''}`}
        >
          {/* Icon and text for Overview link */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Overview</span>
        </NavLink>
        {/* Other nav links follow same pattern */}
      </nav>

      {/* Sidebar footer with theme toggle and logout */}
      <div className="sidebar-footer">
        <ThemeToggle />
        <button onClick={handleLogout} className="btn btn-logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;