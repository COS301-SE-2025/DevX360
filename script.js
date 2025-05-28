// API Configuration
const API_BASE_URL = "http://localhost:5000"; // Change in production

// Tab switching function - FIXED
function switchTab(tab) {
  console.log("Switching to tab:", tab);

  const tabs = document.querySelectorAll(".auth-tab");
  const forms = document.querySelectorAll(".auth-form");

  // Remove active class from all tabs and forms
  tabs.forEach((t) => t.classList.remove("active"));
  forms.forEach((f) => f.classList.remove("active"));

  if (tab === "signin") {
    document.querySelector(".auth-tab:first-child").classList.add("active");
    document.getElementById("signin-form").classList.add("active");
  } else if (tab === "signup") {
    document.querySelector(".auth-tab:last-child").classList.add("active");
    document.getElementById("signup-form").classList.add("active");
  }
}

// Theme toggle function
function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);

      // Store theme preference in memory (not localStorage for artifacts)
      window.themePreference = newTheme;
    });

    // Set default theme
    const defaultTheme = window.themePreference || "light";
    document.documentElement.setAttribute("data-theme", defaultTheme);
  }
}

// Auth Functions
async function handleLogin(email, password) {
  try {
    console.log("Attempting login for:", email);

    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store token and user info in memory for demo purposes
    localStorage.setItem(
      "userSession",
      JSON.stringify({
        token: data.token,
        userId: data.userId,
        role: data.role,
        user: data.user,
      })
    );

    console.log("Login successful!");
    window.location.href = "dashboard.html";

    // In a real app, you would redirect to dashboard
    // window.location.href = 'dashboard.html';
  } catch (error) {
    console.error("Login error:", error);
    alert(`Login failed: ${error.message}`);
  }
}

async function handleSignUp(name, role, email, password, inviteCode = "") {
  try {
    console.log("Attempting registration:", { name, role, email });

    const requestBody = { name, role, email, password };
    if (inviteCode.trim()) {
      requestBody.inviteCode = inviteCode.trim();
    }

    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log("Registration response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    // Store user session
    window.userSession = {
      token: data.token,
      userId: data.userId,
      role: data.role,
      user: data.user,
    };

    alert(`Registration successful! Welcome, ${data.user.name}!`);
    console.log("Registration successful, user logged in automatically");

    // Clear the form
    document.getElementById("register-form").reset();
  } catch (error) {
    console.error("Registration error:", error);
    alert(`Registration failed: ${error.message}`);
  }
}

// Session Management
function checkAuth() {
  const hasSession = window.userSession && window.userSession.token;
  const currentPage = window.location.pathname;

  console.log(
    "Checking auth. Has session:",
    !!hasSession,
    "Current page:",
    currentPage
  );

  if (
    hasSession &&
    (currentPage.includes("index.html") || currentPage === "/")
  ) {
    console.log("User already logged in");
    // In a real app: window.location.href = 'dashboard.html';
  } else if (!hasSession && currentPage.includes("dashboard.html")) {
    console.log("User not logged in, would redirect to login");
    // In a real app: window.location.href = 'index.html';
  }
}

// Auto-logout after 30 minutes of inactivity
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    console.log("User inactive, logging out");
    window.userSession = null;
    alert("You have been logged out due to inactivity.");
    // In a real app: window.location.href = 'index.html';
  }, 30 * 60 * 1000); // 30 minutes
}

// Logout function
function logout() {
  window.userSession = null;
  console.log("User logged out");
  alert("You have been logged out successfully.");
  // In a real app: window.location.href = 'index.html';
}

// Show/hide invite code field
function toggleInviteField() {
  const inviteField = document.getElementById("invite-field");
  if (inviteField) {
    inviteField.classList.toggle("show");
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing...");

  checkAuth();
  resetInactivityTimer();
  initThemeToggle();

  // Event listeners for user activity
  ["mousemove", "mousedown", "touchstart", "click", "keypress"].forEach(
    (event) => {
      window.addEventListener(event, resetInactivityTimer);
    }
  );

  // Tab click handlers - FIXED
  const signinTab = document.querySelector(".auth-tab:first-child");
  const signupTab = document.querySelector(".auth-tab:last-child");

  if (signinTab) {
    signinTab.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("signin");
    });
  }

  if (signupTab) {
    signupTab.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("signup");
    });
  }

  // Also handle the footer links
  const signupLink = document.querySelector(
    '.auth-footer a[onclick*="signup"]'
  );
  const signinLink = document.querySelector(
    '.auth-footer a[onclick*="signin"]'
  );

  if (signupLink) {
    signupLink.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("signup");
    });
  }

  if (signinLink) {
    signinLink.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("signin");
    });
  }

  // Form submission handlers
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("Login form submitted");

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;

      if (!email || !password) {
        alert("Please fill in all fields");
        return;
      }

      if (!email.includes("@")) {
        alert("Please enter a valid email address");
        return;
      }

      handleLogin(email, password);
    });
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("Register form submitted");

      const name = document.getElementById("register-name").value.trim();
      const email = document.getElementById("register-email").value.trim();
      const role = document.getElementById("register-role").value.trim();
      const password = document.getElementById("register-password").value;
      const confirmPassword = document.getElementById("register-confirm").value;
      const inviteCode = document.getElementById("invite-code").value.trim();
      const termsAccepted = document.getElementById("terms").checked;

      // Validation
      if (!name || !role || !email || !password || !confirmPassword) {
        alert("Please fill in all required fields");
        return;
      }

      if (!email.includes("@")) {
        alert("Please enter a valid email address");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      if (!termsAccepted) {
        alert("Please accept the Terms and Privacy Policy");
        return;
      }

      handleSignUp(name, role, email, password, inviteCode);
    });
  }

  // Add button to toggle invite field (optional)
  const inviteToggle = document.createElement("button");
  inviteToggle.type = "button";
  inviteToggle.textContent = "Have an invite code?";
  inviteToggle.className = "btn btn-secondary";
  inviteToggle.style.marginTop = "0.5rem";
  inviteToggle.style.fontSize = "0.8rem";
  inviteToggle.style.padding = "0.5rem";
  inviteToggle.onclick = toggleInviteField;

  const inviteField = document.getElementById("invite-field");
  if (inviteField && inviteField.parentNode) {
    inviteField.parentNode.insertBefore(inviteToggle, inviteField);
  }

  // Test server connection
  fetch(`${API_BASE_URL}/api/health`)
    .then((response) => response.json())
    .then((data) => {
      console.log("✅ Server connection successful:", data);
    })
    .catch((error) => {
      console.error("❌ Server connection failed:", error);
      console.log("Make sure your server is running on http://localhost:5000");
    });
});
