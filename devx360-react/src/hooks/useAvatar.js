import {useEffect, useState} from "react";
import { useAuth } from "../context/AuthContext";
import {getUserAvatar} from "../services/admin";


const defaultAvatar = '/default-avatar.png';

export const useAvatar = () => {
  const { currentUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);

  useEffect(() => {
    let active = true;
    if (!currentUser?._id) {
      setAvatarUrl(defaultAvatar);
      return;
    }

    getUserAvatar(currentUser._id).then((url) => {
      if (active) setAvatarUrl(url);
    });

    return () => {
      active = false;
      if (avatarUrl && avatarUrl !== defaultAvatar) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [currentUser?._id]);

  return avatarUrl;
};