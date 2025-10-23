const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

//============================================================search for a team Function======================================
//Sends a GET request to the api server and loooks for a teams name in the database, it need the JWT token to do that to know who is making that request
// export async function searchTeam(name, teamId) {
//   const response = await fetch(`${API_BASE_URL}/api/teams/${name}`, {
//     credentials: 'include', // Auto-sends cookies
//   });
//
//   const data = await response.json();
//   if (!response.ok) {
//     throw new Error(data.message || 'Failed to search team');
//   }
//   return data;
// }


//=============================================================search for a team Function======================================
//This function searches for teams by a search term, it sends a GET request to the API
//It returns an array of teams that match the search term
export async function searchTeams(searchTerm) {
  const url = new URL(`${API_BASE_URL}/api/teams/search`); //without api in prod
  url.searchParams.append("q", searchTerm);

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to search teams');
  }
  console.log("resp", data);
  return data.results; // Returns the teams array
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
    const error = new Error(data.message || 'Failed to create team');
    error.needsGitHubAuth = data.needsGitHubAuth || false;
    error.githubAuthUrl = data.githubAuthUrl;
    error.suggestion = data.suggestion;
    throw error;
  }
  return data;
}


//============================================================join a new team Function======================================
//Does the same thing as search team but it sends a POST request with the name and password to join a team
export async function joinTeam(name, password) {
  const response = await fetch(`${API_BASE_URL}/api/teams/join`, { //found with out /api
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

export async function checkMembership(teamId) {
  if (!teamId) {
    throw new Error('Team ID is required');
  }

  const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/membership`, { //found without api
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to check team membership');
  }
  return data.isMember; //Returns true or false
}

//============================================================delete a team Function======================================
//Sends a DELETE request to the API to delete a team by its name
export const deleteTeam = async (teamName, teamId) => {
  const response = await fetch(`${API_BASE_URL}/api/teams/${encodeURIComponent(teamName)}?teamId=${teamId}`, { //found without api
    method: 'DELETE',
    credentials: 'include',
  });

  console.log("Deleting team:", teamName, "with ID:", teamId);

  if (!response.ok) {
    console.log("error", response);
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete team');
  }

  return response.json();
};