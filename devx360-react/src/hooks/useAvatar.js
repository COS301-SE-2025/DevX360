import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';
const defaultAvatar = '/default-avatar.png';

const getFullAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return defaultAvatar;
  if (avatarUrl.startsWith('http')) return avatarUrl;

  const cleanPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export const useAvatar = () => {
  const { currentUser } = useAuth();

  return useMemo(() => {
    if (currentUser?.avatarUrl) {
      const fullUrl = getFullAvatarUrl(currentUser.avatarUrl);
      return `${fullUrl}?t=${Date.now()}`;
    }
    return defaultAvatar;
  }, [currentUser?.avatarUrl]);
};