//This is where all the routing happens
//We use BrowserRouter for the client-side routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Profile from './components/Dashboard/Profile';
import Overview from './components/Dashboard/Overview';
import Team from './components/Dashboard/Team';
import Metrics from './components/Dashboard/Metrics';
import HelpMenu from './components/Dashboard/HelpMenu';
import { AuthProvider, useAuth } from './context/AuthContext'; // Added useAuth import
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';


//ProtectedRoute, this protects all the authenticated routes
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

//This is where the all the aplication routes are 
//For example: /login and /register for authentication and then /dashboard with nested routes for Overview, Metrics, Team, and Profile
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
              <Route path="metrics" element={<Metrics />} />
              <Route path="help" element={<HelpMenu />} />
            </Route>
          </Routes>
          <Toaster position="top-center" />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;