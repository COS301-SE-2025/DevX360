// [file name]: Metrics.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

//===========================================================Metrics Component Function======================================
// Displays the DORA metrics dashboard with user profile information in the header
function Metrics() {
  const { currentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);

  // Update avatar when currentUser changes
  useEffect(() => {
    setAvatar(currentUser?.avatar ? 
      `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${currentUser.avatar}` 
      : defaultAvatar);
  }, [currentUser]);

  return (
    <>
      <header className="main-header">
        <h1>DORA Metrics</h1>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{currentUser?.name}</span>
            <span className="user-role">{currentUser?.role}</span>
          </div>
          <div className="user-avatar">
            <img 
              src={avatar} 
              alt="User Avatar" 
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
          </div>
        </div>
      </header>

      <div className="dashboard-section active">
        <h2>DORA Metrics Dashboard</h2>
        <p>Your team's performance metrics will appear here.</p>
      </div>
    </>
  );
}

export default Metrics;