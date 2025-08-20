# DevX360 – AI Analysis Branch

DevX360 is a Node.js toolkit for advanced GitHub repository analytics, DORA metrics, and AI-powered code analysis. This branch focuses on universal DORA metrics, repository info, and robust AI code analysis services.

---

## Features

- **Universal DORA Metrics:** Calculate DORA metrics (Deployment Frequency, Lead Time, Change Failure Rate, MTTR) for any GitHub repository.
- **Repository Info Service:** Fetch contributors, languages, and other metadata for any repo.
- **AI-Powered Code Analysis:** Fetch code files in 30+ languages and interpret them using a local or remote AI model.
- **Robust REST API:** User authentication, team management, and AI review endpoints.
- **Production-Ready:** Comprehensive error handling, rate limiting, and modular architecture.

---

## Project Structure

```
Data Collection/
  universal-dora-service.js      # Universal DORA metrics for any repo
  repository-info-service.js     # Fetches repo info (contributors, languages, etc.)
  fetch-osgeo-data.js           # OSGeo-specific data fetcher
  usage-example.js              # Example usage of data services
  test-repository-service.js    # Test script for repo info service

services/
  codeFetcher.js                # Fetches code files from GitHub repos
  codeInterpretor.js            # Interprets code using AI (local/remote)
  aiReviewer.js                 # AI-powered code review logic

api/
  app.js                        # Main Express app with all API endpoints
  server.js                     # Server entry point
  models/                       # Mongoose models (User, Team, RepoMetrics)
  utils/                        # Auth utilities
  uploads/                      # File uploads (e.g., avatars)
```

---

## Setup

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd DevX360
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set environment variables:**
   - Create a `.env` file or export in your shell:
     ```
     GITHUB_TOKEN=your_github_token
     OPENAI_API_KEY=your_openai_api_key
     JWT_SECRET=your_jwt_secret
     ```

4. **Start the server:**
   ```sh
   npm run dev
   ```
   or
   ```sh
   npm start
   ```

---

## Usage

### Live Demo Script

To run a full workflow (repo info, DORA metrics, code fetch, AI interpretation):

```sh
node live-demo-openai-cs-agents-demo.js https://github.com/openai/openai-python
```

---

## API Endpoints

| Method | Path                   | Purpose                                      | Auth Required? |
|--------|------------------------|----------------------------------------------|---------------|
| GET    | `/api/health`          | Health check/status of the API               | No            |
| POST   | `/api/register`        | Register a new user                          | No            |
| POST   | `/api/login`           | User login                                   | No            |
| GET    | `/api/profile`         | Get current user's profile                   | Yes           |
| PUT    | `/api/profile`         | Update current user's profile                | Yes           |
| GET    | `/api/users`           | List all users (admin only)                  | Yes           |
| POST   | `/api/logout`          | Log out the current user                     | Yes           |
| POST   | `/api/teams`           | Create a new team                            | Yes           |
| POST   | `/api/teams/join`      | Join a team                                  | Yes           |
| GET    | `/api/teams/:name`     | Get info about a specific team               | Yes           |
| POST   | `/api/ai-review`       | AI-powered code review                       | Yes           |

**Authentication:**  
Most endpoints require a JWT token (set as an HTTP-only cookie after login).

---

## Service Descriptions

### Data Collection

- **universal-dora-service.js:**  
  Calculates DORA metrics for any GitHub repo using the GitHub API. Handles rate limits, errors, and supports custom repo URLs.

- **repository-info-service.js:**  
  Fetches contributors, languages, and other metadata for any GitHub repo.

- **fetch-osgeo-data.js:**  
  Specialized data fetcher for OSGeo projects.

### AI Services

- **codeFetcher.js:**  
  Fetches code files in 30+ languages from a GitHub repo.

- **codeInterpretor.js:**  
  Interprets code using an AI model/service.

- **aiReviewer.js:**  
  Provides AI-powered code review and analysis.

---

## Example: DORA Metrics Usage

```js
const { getDoraMetrics } = require('./Data Collection/universal-dora-service');
getDoraMetrics('openai', 'openai-python').then(console.log);
```

---

## Example: Code Fetching & Interpretation

```js
const { fetchRepoCodeFiles } = require('./services/codeFetcher');
const { interpretCodeLocally } = require('./services/codeInterpretor');

const files = await fetchRepoCodeFiles('openai', 'openai-python');
const analysis = await interpretCodeLocally(files);
console.log(analysis);
```

---

## Troubleshooting

- **Rate limit errors:**  
  Ensure your `GITHUB_TOKEN` is set and valid.
- **AI errors:**  
  Check your `OPENAI_API_KEY` and network connectivity.
- **Database errors:**  
  Ensure MongoDB is running and accessible.

---

## Scripts

- `npm start` – Start the server
- `npm run dev` – Start with nodemon for development
- `npm run reset` – Reinstall all dependencies

---

## Dependencies

- express, mongoose, octokit, node-fetch, bcryptjs, jsonwebtoken, multer, dotenv, cors, cookie-parser, express-rate-limit, nodemon (dev)

---

## License

MIT

---

**For more details, see the code comments and each service's file header. If you need API request/response examples or want to auto-generate docs, consider using Swagger or Postman.** 
