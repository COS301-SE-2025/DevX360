import ThemeToggle from "./ThemeToggle";
import ProfileIcon from "./ProfileIcon";
import React from "react";

function HeaderInfo({ currentUser, avatar }) {
    return (
        <div className={"header-info"} >
            <ThemeToggle />
            <ProfileIcon currentUser={currentUser} avatar={avatar} />
        </div>
    )
}

export default HeaderInfo;