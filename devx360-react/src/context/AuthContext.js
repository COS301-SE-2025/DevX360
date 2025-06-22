// This manages the users authentication state(so who logged in) for DevX360
// To put it simple if you see line 15 it will give the currentUsers state to all the components
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile } from '../services/auth';

// We create the context
const AuthContext = createContext();

// We make custom hook to use for the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const token = localStorage.getItem('token');
    if (token) {
      getProfile(token)
        .then(user => {
          setCurrentUser(user);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setCurrentUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  
  const login = async (email, password) => {
    try {
      const { token, user } = await loginUser(email, password);
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, role, email, password, inviteCode) => {
    try {
      const { token, user } = await registerUser(name, role, email, password, inviteCode);
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};