import React, { useState, useEffect } from 'react';
import StatCard from '../common/StatCard';
import { useAuth } from '../../context/AuthContext';
import HeaderInfo from "../common/HeaderInfo";

//===========================================================Overview Component Function======================================
// The main dashboard overview page showing welcome message, platform info, and stat cards
function Overview() {
  const { currentUser } = useAuth();
  const defaultAvatar = '/default-avatar.png';
  const [avatar, setAvatar] = useState(defaultAvatar);

  // Update avatar when currentUser changes
 useEffect(() => {
    if (currentUser?.avatar) {
      // Handle both full URLs and backend paths
      const avatarUrl = currentUser.avatar.startsWith('http') 
        ? currentUser.avatar 
        : `${process.env.REACT_APP_API_URL || 'http://localhost:5500'}${currentUser.avatar}`;
      
      setAvatar(avatarUrl);
    } else {
      setAvatar(defaultAvatar);
    }
}, [currentUser]);

  return (
    <>
      <header className="main-header">
        <h1>Overview</h1>
        {/*<div className="user-profile">*/}
        {/*  <div className="user-info">*/}
        {/*    <span className="user-name">{currentUser?.name}</span>*/}
        {/*    <span className="user-role">{currentUser?.role}</span>*/}
        {/*  </div>*/}
        {/*  <div className="user-avatar">*/}
        {/*    <img */}
        {/*      src={avatar} */}
        {/*      alt="User Avatar" */}
        {/*      onError={(e) => {*/}
        {/*        e.target.src = defaultAvatar;*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</div>*/}
          <HeaderInfo currentUser={currentUser} avatar={avatar} defaultAvatar={defaultAvatar} />
      </header>

      {/* Welcome card with platform introduction */}
      <div className="welcome-card">
        <h2>Welcome to DevX360</h2>
        <p>
          Your engineering intelligence platform that helps you measure and
          improve your team's performance using DORA metrics and AI-driven
          insights.
        </p>
      </div>

      {/* About card with platform features */}
      <div className="about-card">
        <h3>About DevX360</h3>
        <p>
          DevX360 is a comprehensive platform designed to help engineering
          teams measure, understand, and improve their performance. We
          provide:
        </p>
        <ul>
          <li>Real-time DORA metrics tracking</li>
          <li>AI-powered performance insights</li>
          <li>Team and individual analytics</li>
          <li>Automated reporting</li>
          <li>Integration with GitHub and other development tools</li>
        </ul>
      </div>

      {/* Stat cards showing performance metrics (currently placeholders) */}
      <div className="quick-stats">
        <StatCard title="Deployment Frequency" value="--" trend="+12% from last week" trendType="up" />
        <StatCard title="Lead Time" value="--" trend="-8% from last week" trendType="down" />
        <StatCard title="Change Fail Rate" value="--" trend="+3% from last week" trendType="up" />
        <StatCard title="MTTR" value="--" trend="-15% from last week" trendType="down" />
      </div>
    </>
  );
}

export default Overview;