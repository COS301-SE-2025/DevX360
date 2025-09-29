import React from 'react';
import '../../styles/auth.css';

function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      <div className="graphic-side">
        <div className="graphic-content">
          <h1>Welcome to DevX360</h1>
          <p>Streamline your team's workflow with our intuitive task management system. Collaborate, track progress, and achieve more together.</p>
        </div>
      </div>
      <div className="auth-side">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;