document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("http://localhost:5000/api/profile", {
      credentials: "include",
    });

    if (!res.ok) {
      alert("You are not logged in!");
      window.location.href = "../UI/index.html";
      return;
    }

    const data = await res.json();
    const user = data.user;

    document.getElementById("header-user-name").textContent = user.name;
    document.getElementById("header-user-role").textContent = user.role;

    const avatarUrl = user.avatar
      ? `http://localhost:5000/uploads/${user.avatar}`
      : "default-avatar.png";
    document.getElementById("avatar-image").src = avatarUrl;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    alert("Error loading user data.");
  }

  initThemeToggle();

  document.getElementById("logout-btn").addEventListener("click", async () => {
    await fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "../UI/index.html";
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

  const res = await fetch("http://localhost:5000/api/teams", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, password }),
  });

  const data = await res.json();
  alert(data.message);
}

async function joinTeam() {
  const name = document.getElementById("join-team-name").value;
  const password = document.getElementById("join-team-password").value;

  const res = await fetch("http://localhost:5000/api/teams/join", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, password }),
  });

  const data = await res.json();
  alert(data.message);
}

async function searchTeam() {
  const name = document.getElementById("search-team-name").value.trim();

  const container = document.getElementById("search-result-container");

  if (!name) {
    container.innerHTML = "<p>Please enter a team name to search.</p>";
    return;
  }

  const res = await fetch(`http://localhost:5000/api/teams/${name}`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    container.innerHTML = `<p style="color: red;">${data.message}</p>`;
    return;
  }

  const team = data.team;

  container.innerHTML = `
    <div class="team-block">
      <h3>${team.name}</h3>
      <p><strong>Creator:</strong> ${team.creator.name}</p>
      <button onclick="promptJoinTeam('${team.name}')" class="btn btn-secondary">Join Team</button>
    </div>
  `;
}
function promptJoinTeam(teamName) {
  const password = prompt(`Enter password to join "${teamName}"`);
  if (password) joinTeam(teamName, password);
}

async function joinTeam(name, password) {
  const res = await fetch("http://localhost:5000/api/teams/join", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, password }),
  });

  const data = await res.json();
  alert(data.message);
}

document.getElementById("toggle-create-form").addEventListener("click", () => {
  const form = document.getElementById("create-form");
  form.style.display = form.style.display === "none" ? "block" : "none";
});
