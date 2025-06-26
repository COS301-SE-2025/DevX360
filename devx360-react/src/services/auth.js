// This is meant to send and recieve the login data to or from our API server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

//=========================================Login USER Function=====================================
//This function sends a POST request to the api and then if the info is valid the api sends it back with a token to show a user has login
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Send/receive cookies
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
}

//============================================================Register a USER Function======================================
//Does the same thing as login user but this one just registers a user
export async function registerUser(name, role, email, password, inviteCode = '') {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, role, email, password, inviteCode }),
    credentials: 'include', // Send/receive cookies
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
}
//============================================================getProfile USER Function======================================
//Sends a GET request to the api, it uses the token to basically ask who is the 
export async function getProfile() {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    credentials: 'include', // Auto-sends cookies
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch profile');
  }
  return data.user;
}


