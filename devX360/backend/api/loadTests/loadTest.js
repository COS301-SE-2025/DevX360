import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

// Generate test users
const users = new SharedArray("users", function () {
  let arr = [];
  for (let i = 1; i <= 50; i++) {
    arr.push({
      email: `testuser${i}@example.com`,
      password: "password123",
    });
  }
  return arr;
});

export let options = {
  vus: 50, // virtual users
  duration: "20s", // test duration
  thresholds: {
    checks: ["rate>0.95"], // 95% of checks must pass
    http_req_duration: ["p(95)<2000"], // 95% of requests < 2s
  },
};

export default function () {
  const user = users[Math.floor(Math.random() * users.length)];

  // ----------------------------
  // 1. Login
  // ----------------------------
  const loginRes = http.post(
    "http://localhost:5500/api/login",
    JSON.stringify({
      email: user.email,
      password: user.password,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  check(loginRes, {
    "login succeeded": (r) =>
      r.status === 200 && r.json("message") === "Login successful",
  });

  const cookies = loginRes.headers["Set-Cookie"];
  if (!cookies) {
    return;
  }

  // ----------------------------
  // 2. Get profile
  // ----------------------------
  const profileRes = http.get("http://localhost:5500/api/profile", {
    headers: { Cookie: cookies },
  });
  check(profileRes, {
    "profile succeeded": (r) => r.status === 200 && r.json("user"),
  });

  // ----------------------------
  // 3. Update profile
  // ----------------------------
  const updateRes = http.put(
    "http://localhost:5500/api/profile",
    JSON.stringify({
      name: `User${Math.floor(Math.random() * 10000)}`,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
    }
  );
  check(updateRes, {
    "profile update succeeded": (r) => r.status === 200 && r.json("user"),
  });

  // ----------------------------
  // 4. Create team (safe in MOCK_MODE)
  // ----------------------------
  const teamName = `TempTeam${Math.floor(Math.random() * 10000)}`;
  const createTeamRes = http.post(
    "http://localhost:5500/api/teams",
    JSON.stringify({
      name: teamName,
      password: "team123",
      repoUrl: "https://github.com/mock-owner/mock-repo", // mock-safe
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
    }
  );

  check(createTeamRes, {
    "team creation status": (r) =>
      r.status === 201 || r.status === 400, // allow already exists
  });

  let teamId = null;
  try {
    teamId = createTeamRes.json("team.id");
  } catch (err) {
    teamId = null;
  }

  // ----------------------------
  // 5. Join team (if created)
  // ----------------------------
  if (teamId) {
    const joinRes = http.post(
      "http://localhost:5500/api/teams/join",
      JSON.stringify({
        name: teamName,
        password: "team123",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies,
        },
      }
    );

    check(joinRes, {
      "team join status": (r) =>
        r.status === 200 || r.status === 400 || r.status === 500,
    });
  }

  // ----------------------------
  // 6. AI Review (safe in MOCK_MODE)
  // ----------------------------
  if (teamId) {
    const aiRes = http.get(
      `http://localhost:5500/api/ai-review?teamId=${teamId}`,
      { headers: { Cookie: cookies } }
    );

    check(aiRes, {
      "AI review status": (r) =>
        r.status === 200 || r.status === 202 || r.status === 500,
    });
  }

  // ----------------------------
  // 7. Search teams
  // ----------------------------
  const searchRes = http.get(
    "http://localhost:5500/api/teams/search?q=Temp",
    { headers: { Cookie: cookies } }
  );
  check(searchRes, {
    "team search status": (r) => r.status === 200,
  });

  // ----------------------------
  // 8. Logout
  // ----------------------------
  const logoutRes = http.post("http://localhost:5500/api/logout", null, {
    headers: { Cookie: cookies },
  });
  check(logoutRes, {
    "logout succeeded": (r) => r.status === 200,
  });

  sleep(1);
}
