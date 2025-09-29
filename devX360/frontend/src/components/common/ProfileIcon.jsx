<<<<<<< HEAD
import React from "react";

function ProfileIcon({ currentUser, avatar, defaultAvatar }) {
    // console.log(currentUser);
    return (
        <div className="user-profile">
            <div className="user-avatar">
                <img
                    className="user-avatar"
                    src={avatar}
                    alt="User Avatar"
                    onError={(e) => {
                        e.target.src = defaultAvatar;
                    }}
                />
            </div>
            <div className="user-info">
                <span className="user-name">{currentUser?.name}</span>
                <span className="user-role">{currentUser?.role}</span>
            </div>
        </div>
    );
}

=======
import React from "react";
import {useAuth} from "../../context/AuthContext";

function ProfileIcon() {
  const { currentUser, avatarUrl } = useAuth();
  const defaultAvatar = "/default-avatar.png";

  return (
      <div className="user-profile">
        <div className="user-avatar">
          <img
              className="user-avatar"
              src={avatarUrl}
              alt="User Avatar"
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
          />
        </div>
        <div className="user-info">
          <span className="user-name">{currentUser?.name}</span>
          <span className="user-role">{currentUser?.role}</span>
        </div>
      </div>
  );
}

>>>>>>> dev
export default ProfileIcon;