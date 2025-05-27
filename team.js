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
    const user = data.user;

    document.getElementById("header-user-name").textContent = user.name;
    document.getElementById("header-user-role").textContent = user.role;

    const avatarUrl = user.avatar
      ? `http://localhost:5000${user.avatar}`
      : "default-avatar.png";
    document.getElementById("avatar-image").src = avatarUrl;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    alert("Error loading user data.");
  }

  initThemeToggle();

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("userSession");
    window.location.href = "index.html";
  });
});

function initThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

async function createTeam() {
  const name = document.getElementById("create-team-name").value;
  const password = document.getElementById("create-team-password").value;
  const token = getToken();

  const res = await fetch("http://localhost:5000/api/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, password }),
  });

  const data = await res.json();
  alert(data.message);
}

async function joinTeam() {
  const name = document.getElementById("join-team-name").value;
  const password = document.getElementById("join-team-password").value;
  const token = getToken();

  const res = await fetch("http://localhost:5000/api/teams/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, password }),
  });

  const data = await res.json();
  alert(data.message);
}

async function searchTeam() {
  const name = document.getElementById("search-team-name").value;
  const token = getToken();

  const res = await fetch(`http://localhost:5000/api/teams/${name}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const infoEl = document.getElementById("team-info");
  const data = await res.json();

  if (!res.ok) {
    infoEl.innerHTML = `<p>${data.message}</p>`;
    return;
  }

  const team = data.team;
  infoEl.innerHTML = `
    <h4>${team.name}</h4>
    <p><strong>Creator:</strong> ${team.creator.name}</p>
    <p><strong>Members:</strong></p>
    <ul>
      ${team.members.map((m) => `<li>${m.name} (${m.email})</li>`).join("")}
    </ul>
  `;
}

function getToken() {
  const session = localStorage.getItem("userSession");
  return session ? JSON.parse(session).token : null;
}
