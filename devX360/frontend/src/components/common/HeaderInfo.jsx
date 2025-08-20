import ThemeToggle from "./ThemeToggle";
import ProfileIcon from "./ProfileIcon";
import React from "react";

function HeaderInfo({ currentUser, avatar, defaultAvatar }) {
    return (
        <div className={"header-info"} >
            <ThemeToggle />
            <ProfileIcon currentUser={currentUser} avatar={avatar} defaultAvatar={defaultAvatar} />
        </div>
    )
}

export default HeaderInfo;