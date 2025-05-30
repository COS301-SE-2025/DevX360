document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("http://localhost:5000/api/profile", {
      credentials: "include",
    });

    if (res.status === 401) {
      alert("You are not logged in!");
      window.location.href = "../UI/index.html";
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch profile");
    }

    const user = data.user;
    const teamsList = user.teams || [];
    const teamListEl = document.getElementById("user-teams");

    teamListEl.innerHTML = teamsList.length
      ? teamsList
          .map(
            (t) =>
              `<li style="margin-bottom: 0.5rem"><a href="#">${t.name}</a></li>`
          )
          .join("")
      : "<li>No teams yet.</li>";

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
      ? `http://localhost:5000/uploads/${user.avatar}`
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

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("http://localhost:5000/api/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      const avatarUrl = data.avatarUrl
        ? `http://localhost:5000/uploads/${data.avatarUrl}`
        : "default-avatar.png";
      document.getElementById("profile-avatar-image").src = avatarUrl;
      document.getElementById("avatar-image").src = avatarUrl;
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    }
  });

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
