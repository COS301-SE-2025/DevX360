<<<<<<< HEAD
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

=======
import ThemeToggle from "./ThemeToggle";
import React from "react";
import ProfileIcon from "./ProfileIcon";

function HeaderInfo() {
  return (
      <div className={"header-info"} >
        <ThemeToggle />
        <ProfileIcon />
      </div>
  )
}

>>>>>>> dev
export default HeaderInfo;