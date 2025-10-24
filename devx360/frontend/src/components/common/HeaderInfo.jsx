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

export default HeaderInfo;