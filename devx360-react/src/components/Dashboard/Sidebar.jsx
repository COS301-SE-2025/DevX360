import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Sidebar() {
  const [isMinimized, setIsMinimized] = useState(false);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'admin';

 
const handleLogout = async () => {
  await logout();
  // Force navigation to login and reload
  window.location.href = '/login';
};

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <aside className={`sidebar ${isMinimized ? 'minimized' : ''}`}>
      {/* Logo Section with Toggle */}
      <div className="logo-container">
        <div className="logo-header">
          <div className="logo">
            {isMinimized ? 'DX' : 'DevX360'}
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label={isMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
        {!isMinimized && (
          <div className="tagline">Engineering Intelligence Platform</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="main-nav">
        <NavLink 
          to="/dashboard/overview" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title={isMinimized ? 'Overview' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          {!isMinimized && <span>Overview</span>}
        </NavLink>

        <NavLink 
          to="/dashboard/profile" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title={isMinimized ? 'Profile' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {!isMinimized && <span>Profile</span>}
        </NavLink>

        <NavLink
          to="/dashboard/team"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title={isMinimized ? 'Team' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          {!isMinimized && <span>Team</span>}
        </NavLink>

        {isAdmin && (
          <NavLink
              to="/dashboard/admin"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isMinimized ? 'Admin' : ''}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                 className="lucide lucide-building2-icon lucide-building-2">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
              <path d="M10 6h4"/>
              <path d="M10 10h4"/>
              <path d="M10 14h4"/>
              <path d="M10 18h4"/>
            </svg>
            {!isMinimized && <span>Admin</span>}
          </NavLink>
        )}

        <NavLink
            to="/dashboard/metrics"
            className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            title={isMinimized ? 'Dashboard' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          {!isMinimized && <span>Dashboard</span>}
        </NavLink>
      </nav>

      {/* Floating Help Button - positioned outside sidebar */}
      <button 
        onClick={() => navigate('/dashboard/help')}
        className="floating-help-button"
        title="Help Center"
        aria-label="Help Center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </button>

      {/* Footer */}
      <div className="sidebar-footer">
        <button 
          onClick={handleLogout} 
          className="btn btn-logout"
          title={isMinimized ? 'Logout' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          {!isMinimized && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;