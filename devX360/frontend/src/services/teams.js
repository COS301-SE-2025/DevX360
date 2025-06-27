const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

//============================================================search for a team Function======================================
//Sends a GET request to the api server and loooks for a teams name in the database, it need the JWT token to do that to know who is making that request
export async function searchTeam(name) {
  const response = await fetch(`${API_BASE_URL}/api/teams/${name}`, {
    credentials: 'include', // Auto-sends cookies
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to search team');
  }
  return data;
}

//============================================================creat a new team Function======================================
//Does the same thing as search team but it sends a POST request with the name and password
export async function createTeam(name, password, repoUrl) {
  const response = await fetch(`${API_BASE_URL}/api/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, repoUrl }),
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create team');
  }
  return data;
}


//============================================================join a new team Function======================================
//Does the same thing as search team but it sends a POST request with the name and password to join a team
export async function joinTeam(name, password) {
  const response = await fetch(`${API_BASE_URL}/api/teams/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to join team');
  }
  return data;
}

