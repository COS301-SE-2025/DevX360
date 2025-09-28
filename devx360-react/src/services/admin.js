const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

//=============================================================get all users Function======================================
// This function fetches all users from the API and returns them as an array.
export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch users');
  }

  // console.log("data", data);

  return data.users;
}

export async function getTeams() {
    const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch teams');
    }

    // console.log("data", data);

    return data.teams;
}

export async function getUserAvatar(userId) {
  const response = await fetch(`${API_BASE_URL}/avatar/${userId}`, {
    method: "GET",
    credentials: "include", // send cookies for auth
  });

  if (!response.ok) {
    throw new Error("Failed to fetch avatar");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}


export async function deleteUser(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete user');
  }

  return data;
}


export async function getAnomalies() {
  const response = await fetch(`${API_BASE_URL}/anomalies`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch anomalies');
  }

  return data.anomalies;
}