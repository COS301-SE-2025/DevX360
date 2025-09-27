import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
 const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setCurrentUser(null);
        // You might want to add retry logic or show a message to the user
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      // Construct full avatar URL if needed
      if (data.user?.avatar) {
        data.user.avatar = `${API_BASE_URL}/uploads/${data.user.avatar}`;
      }
      setCurrentUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, role, email, password, inviteCode = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, email, password, inviteCode }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      setCurrentUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Helper function to update user data (useful for profile updates, avatar changes, etc.)
  const updateCurrentUser = (updatedUserData) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedUserData
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      setCurrentUser, // Add this to the context value
      updateCurrentUser, // Alternative helper function
      login, 
      logout, 
      register, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

