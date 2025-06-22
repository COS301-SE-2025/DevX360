# DevX360 Backend — AI-Powered DORA Metrics and Code Review

This is the backend system for **DevX360**, a developer experience monitoring platform that integrates **DORA metrics**, **AI-driven code review**, and **team management**.

The system automatically collects GitHub repository data, calculates DORA metrics, and provides AI feedback on code using open-source models via [Ollama](https://ollama.com/). Teams can register, manage projects, and view their delivery performance in real time.

---

## 🛠️ Technologies Used & Justifications

| Technology                            | Purpose                | Justification                                             |
| ------------------------------------- | ---------------------- | --------------------------------------------------------- |
| **Node.js + Express**                 | Backend framework      | Lightweight and perfect for building scalable REST APIs   |
| **MongoDB + Mongoose**                | Data storage           | Flexible schema for teams, users, and DORA metrics        |
| **JWT (jsonwebtoken)**                | Auth sessions          | Secure, stateless token-based authentication              |
| **Ollama + Mistral/CodeLlama**        | AI code review         | Local, free and privacy-preserving LLM-based insights     |
| **Octokit (GitHub API)**              | Repo analysis          | Reliable access to commits, PRs, tags for DORA metrics    |
| **Multer**                            | File upload middleware | Efficient for user avatar uploads via multipart/form-data |
| **bcryptjs**                          | Password hashing       | Securely stores team and user passwords                   |
| **Rate-limiter (express-rate-limit)** | API protection         | Prevents brute-force and abuse attacks                    |
| **dotenv**                            | Env config             | Keeps secrets like GitHub token and JWT key safe          |

---

## Security Measures

| Feature                         | Description                                 | Why it Matters                            |
| ------------------------------- | ------------------------------------------- | ----------------------------------------- |
| **JWT with `httpOnly` Cookies** | Access token stored securely in cookies     | Prevents client-side JS attacks like XSS  |
| **Rate Limiting**               | Limits requests per IP                      | Prevents brute-force or denial-of-service |
| **Password Hashing (bcrypt)**   | Hashes passwords before storage             | Keeps user data safe in case of breach    |
| **CORS Restrictions**           | Whitelisted frontend origins                | Protects API from unauthorized domains    |
| **Multer File Validation**      | Avatar upload restricted to specific folder | Prevents file-based vulnerabilities       |

### Why Multer?

Multer is used for securely handling **avatar uploads** for users. It:

- Handles multipart/form-data parsing
- Saves images to a controlled location (`/uploads`)
- Prevents malicious file injection via type checks and path constraints

We chose Multer because it's lightweight, secure, and easily integrated with Express.

---

## API Overview

### `POST /api/register`

Register a new user.

**Request**

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123",
  "role": "developer"
}
```

**Response**

```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "developer"
  }
}
```

---

### `POST /api/login`

Login a user.

**Request**

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response**

```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "developer"
  }
}
```

---

### `POST /api/teams`

Create a new team and ingest DORA metrics.

**Request**

```json
{
  "name": "Platform Devs",
  "password": "securepass",
  "repoUrl": "https://github.com/OSGeo/gdal"
}
```

**Response**

```json
{
  "message": "Team created",
  "team": {
    "_id": "team_id",
    "name": "Platform Devs",
    "repoUrl": "https://github.com/OSGeo/gdal"
  }
}
```

---

### `POST /api/teams/join`

Join a team.

**Request**

```json
{
  "name": "Platform Devs",
  "password": "securepass"
}
```

**Response**

```json
{
  "message": "Joined team",
  "teamId": "team_id"
}
```

---

### `GET /api/teams/:name`

Get team info including DORA metrics.

**Response**

```json
{
  "team": {
    "name": "Platform Devs",
    "repoUrl": "https://github.com/OSGeo/gdal",
    "creator": { "name": "Alice" },
    "members": [
      { "name": "Alice", "email": "alice@example.com" },
      { "name": "Bob", "email": "bob@example.com" }
    ]
  },
  "doraMetrics": {
    "lead_time": {
      "average_days": "2.31"
    },
    "deployment_frequency": {
      "total_deployments": 3,
      "frequency_per_day": "0.11"
    },
    "mttr": {
      "average_days": "1.22"
    },
    "change_failure_rate": {
      "failure_rate": "20.00%"
    }
  },
  "lastUpdated": "2025-06-21T14:35:00.000Z"
}
```

The `doraMetrics` are retrieved from the RepoMetrics collection based on the team ID.

---

### `POST /api/ai-review`

Trigger AI analysis of code using stored DORA metrics.

**Request**

```json
{
  "teamId": "6657e3c5bd9a4a001fb6a9b2"
}
```

**Response**

```json
{
  "aiFeedback": "This repository uses large async controllers which may delay deployment. Consider simplifying your handlers to improve lead time."
}
```

---

## AI Models (Ollama)

| Agent           | Model       | Role                                                             |
| --------------- | ----------- | ---------------------------------------------------------------- |
| **Interpreter** | `codellama` | Reads source code files and summarizes their structure           |
| **Reviewer**    | `mistral`   | Analyzes summaries + DORA metrics and gives improvement feedback |

---

## Getting Started

```bash
git clone https://github.com/COS301-SE-2025/DevX360.git
cd DevX360
npm install
npm start
```

Create a `.env` file:

```env
GITHUB_TOKEN=your_github_token
JWT_SECRET=your_jwt_secret
```

---


