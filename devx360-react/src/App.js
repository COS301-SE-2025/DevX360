// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Profile from './components/Dashboard/Profile';
import Overview from './components/Dashboard/Overview';
import Team from './components/Dashboard/Team';
import Metrics from './components/Dashboard/Metrics';
import HelpMenu from './components/Dashboard/HelpMenu';
import { useAuth } from './context/AuthContext'; 
import LandingPage from './components/LandingPage';
import FAQPage from './components/Dashboard/FAQPage';
import { Toaster } from 'react-hot-toast';
import Admin from "./components/Dashboard/Admin";

// ProtectedRoute: protects authenticated routes
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/landingpage" state={{ from: location }} replace />;
  }

  return children;
};

// App component with routing
function App() {
  const { currentUser, loading } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <Router>
      <Routes>
        {/* Redirect root to dashboard overview */}
        <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />

        {/* Public routes */}
        <Route path="/landingpage" element={<LandingPage />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="team" element={<Team />} />
          {isAdmin && (<Route path="admin" element={<Admin />} />)}
          <Route path="metrics" element={<Metrics />} />
          <Route path="help" element={<HelpMenu />} />
          <Route path="faqpage" element={<FAQPage />} /> 
        </Route>
      </Routes>

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-container)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            zIndex: 10002,
          },
          custom: { duration: 6000 }
        }}
        containerStyle={{ zIndex: 10002 }}
      />
    </Router>
  );
}

export default App;
