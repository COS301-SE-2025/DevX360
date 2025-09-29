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
import ErrorBoundary from "./components/common/ErrorBoundary";
import AdminRoute from "./utils/AdminRoute";

// ProtectedRoute: protects authenticated routes
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// PublicRoute: redirects authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (currentUser) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  return children;
};

// App component with routing
function App() {
  return (
    <ErrorBoundary onRetry={() => window.location.reload()}>
      <Router>
        <Routes>
          {/* Root path goes to landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public routes that redirect if already authenticated */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

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
            <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="metrics" element={<Metrics />} />
            <Route path="help" element={<HelpMenu />} />
            <Route path="faqpage" element={<FAQPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
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
    </ErrorBoundary>
  );
}

export default App;