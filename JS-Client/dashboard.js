document.addEventListener("DOMContentLoaded", function () {
  // Init theme toggle, profile, nav, logout
  initThemeToggle();
  loadUserProfile();

  document.getElementById("logout-btn").addEventListener("click", logout);
});

async function loadUserProfile() {
  try {
    const response = await fetch("http://localhost:5000/api/profile", {
      credentials: "include",
    });

    if (response.status === 401 || response.status === 403) {
      alert("You are not logged in!");
      window.location.href = "../UI/index.html";
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    const user = data.user;

    // Update header
    document.getElementById("header-user-name").textContent = user.name;
    document.getElementById("header-user-role").textContent = user.role;

    // Update profile section
    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-role").textContent = user.role;

    const createdDate = new Date(user.createdAt).toLocaleDateString();
    const lastLogin = user.lastLogin
      ? new Date(user.lastLogin).toLocaleString()
      : "First login";

    document.getElementById("profile-created").textContent = createdDate;
    document.getElementById("profile-last-login").textContent = lastLogin;

    // Load avatar from server
    const avatarUrl = user.avatar
      ? `http://localhost:5000/uploads/${user.avatar}`
      : "default-avatar.png";

    document.getElementById("avatar-image").src = avatarUrl;
    document.getElementById("profile-avatar-image").src = avatarUrl;
  } catch (error) {
    console.error("Error loading profile:", error);
    alert("Failed to load user profile");
  }
}

async function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const reader = new FileReader();

    reader.onload = function (event) {
      document.getElementById("avatar-image").src = event.target.result;
      document.getElementById("profile-avatar-image").src = event.target.result;
    };

    reader.readAsDataURL(file);
  } catch (error) {
    console.error("Error uploading avatar:", error);
    alert("Failed to upload avatar");
  }
}

function md5(string) {
  return CryptoJS.MD5(string).toString();
}

// Theme toggle
function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });

    // Set default theme
    const defaultTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", defaultTheme);
  }
}

// Logout function
async function logout() {
  await fetch("http://localhost:5000/api/logout", {
    method: "POST",
    credentials: "include",
  });
  window.location.href = "../UI/index.html";
}
