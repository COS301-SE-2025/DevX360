import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile } from '../services/auth';
import { getUserAvatar } from "../services/admin";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
const defaultAvatar = '/default-avatar.png';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

  // Helper function to fetch and set avatar
  const fetchAndSetAvatar = async (userId) => {
    if (!userId) {
      setAvatarUrl(defaultAvatar);
      return;
    }

    setAvatarLoading(true);
    try {
      const url = await getUserAvatar(userId);
      setAvatarUrl(url);
    } catch (error) {
      console.error('Error fetching avatar:', error);
      setAvatarUrl(defaultAvatar);
    } finally {
      setAvatarLoading(false);
    }
  };

  // Clean up avatar URL when component unmounts or avatar changes
  const cleanupAvatarUrl = (url) => {
    if (url && url !== defaultAvatar && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);

          // Fetch avatar after setting user
          if (data.user?._id) {
            await fetchAndSetAvatar(data.user._id);
          }
        } else {
          setCurrentUser(null);
          setAvatarUrl(defaultAvatar);
        }

      } catch (error) {
        console.error('Auth check failed:', error);
        setCurrentUser(null);
        setAvatarUrl(defaultAvatar);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Cleanup function
    return () => {
      cleanupAvatarUrl(avatarUrl);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);

      // After successful login, fetch the complete profile
      const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
        credentials: 'include',
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setCurrentUser(profileData.user);

        // Fetch avatar after setting complete user data
        if (profileData.user?._id) {
          await fetchAndSetAvatar(profileData.user._id);
        }
      } else {
        // Fallback to login data if profile fetch fails
        setCurrentUser(data.user);
        if (data.user?._id) {
          await fetchAndSetAvatar(data.user._id);
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password, inviteCode = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, inviteCode }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      setCurrentUser(data.user);

      // New users get default avatar (don't fetch from API)
      setAvatarUrl(defaultAvatar);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      // Clean up avatar URL before logout
      cleanupAvatarUrl(avatarUrl);

      setCurrentUser(null);
      setAvatarUrl(defaultAvatar);
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

  // Function to update avatar URL directly (for when profile component updates avatar)
  const updateAvatarUrl = (newAvatarUrl) => {
    // Clean up old avatar URL
    cleanupAvatarUrl(avatarUrl);
    setAvatarUrl(newAvatarUrl);
  };

  return (
      <AuthContext.Provider value={{
        currentUser,
        setCurrentUser,
        updateCurrentUser,
        login,
        logout,
        register,
        loading,
        avatarUrl,
        avatarLoading,
        updateAvatarUrl
      }}>
        {children}
      </AuthContext.Provider>
  );
};