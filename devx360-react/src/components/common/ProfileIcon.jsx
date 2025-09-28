import React from "react";

function ProfileIcon({ currentUser, avatar }) {
    // console.log(currentUser);
  const defaultAvatar = "/default-avatar.png";
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

export default ProfileIcon;