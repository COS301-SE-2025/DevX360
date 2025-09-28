import {useEffect, useState} from "react";
import { useAuth } from "../context/AuthContext";
import {getUserAvatar} from "../services/admin";


const defaultAvatar = '/default-avatar.png';

export const useAvatar = () => {
  const { currentUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);

  useEffect(() => {
    let active = true;

    async function fetchAvatar() {
      if (!currentUser?._id) {
        setAvatarUrl(defaultAvatar);
        return;
      }

      try {
        const url = await getUserAvatar(currentUser._id);
        if (active) setAvatarUrl(url);
      } catch (error) {
        console.error("Error fetching avatar:", error);
        setAvatarUrl(defaultAvatar);
      }
    }

    fetchAvatar();

    return () => {
      active = false;
      if (avatarUrl && avatarUrl !== defaultAvatar) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [currentUser?._id]);


  return avatarUrl;
};