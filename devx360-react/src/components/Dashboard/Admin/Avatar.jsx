import { useEffect, useState } from "react";
import {getUserAvatar} from "../../../services/admin";

const defaultAvatar = "/default-avatar.png";

function UserAvatar({ userId, alt, size = 40, className = "" }) {
  const [src, setSrc] = useState(defaultAvatar);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setSrc(defaultAvatar);
      return;
    }

    getUserAvatar(userId)
        .then((url) => {
          if (active) setSrc(url);
        })
        .catch(() => setSrc(defaultAvatar));

    return () => {
      active = false;
      if (src && src !== defaultAvatar) {
        URL.revokeObjectURL(src);
      }
    };
  }, [userId]);

  return (
      <img
          src={src}
          alt={alt || "User avatar"}
          className={`rounded-full border-2 border-[var(--border)] shadow-sm ${className}`}
          style={{ width: size, height: size }}
      />
  );
}

export default UserAvatar;
