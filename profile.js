document.addEventListener("DOMContentLoaded", async () => {
  const userSession = JSON.parse(localStorage.getItem("userSession"));
  const token = userSession?.token;

  if (!token) {
    alert("You are not logged in!");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch profile");
    }

    const user = data.user;

    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-role").textContent = user.role;
    document.getElementById("profile-created").textContent = new Date(
      user.createdAt
    ).toLocaleDateString();
    document.getElementById("profile-last-login").textContent = user.lastLogin
      ? new Date(user.lastLogin).toLocaleDateString()
      : "Never";

    document.getElementById("header-user-name").textContent = user.name;
    document.getElementById("header-user-role").textContent = user.role;

    const avatarUrl = user.avatar
      ? `http://localhost:5000${user.avatar}`
      : "default-avatar.png";

    document.getElementById("profile-avatar-image").src = avatarUrl;
    document.getElementById("avatar-image").src = avatarUrl;
  } catch (error) {
    console.error("Error loading profile:", error);
    alert(`Error loading profile: ${error.message}`);
  }

  initThemeToggle();
});

// Trigger file picker
document.getElementById("change-avatar-btn").addEventListener("click", () => {
  document.getElementById("avatar-upload").click();
});

document
  .getElementById("avatar-upload")
  .addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userSession = JSON.parse(localStorage.getItem("userSession"));
    const token = userSession?.token;
    if (!token) return alert("Not authenticated");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("http://localhost:5000/api/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      alert("Avatar uploaded successfully!");

      // Use the server-provided URL to update the image preview
      const baseUrl = "http://localhost:5000";
      const avatarUrl = data.avatarUrl
        ? `http://localhost:5000${data.avatarUrl}`
        : "default-avatar.png";
      document.getElementById("profile-avatar-image").src = avatarUrl;
      document.getElementById("avatar-image").src = avatarUrl;
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    }
  });

// Theme toggle (reused from script.js)
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
