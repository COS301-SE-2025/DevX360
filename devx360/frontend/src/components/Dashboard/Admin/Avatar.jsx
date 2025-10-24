import { useMemo } from "react";

const defaultAvatar = "/default-avatar.png";

function UserAvatar({ userAvatar, contentType = "image/png", alt, size = 40, className = "" }) {
  const src = useMemo(() => {
    if (!userAvatar) return defaultAvatar;
    return `data:${contentType};base64,${userAvatar}`;
  }, [userAvatar, contentType]);


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
