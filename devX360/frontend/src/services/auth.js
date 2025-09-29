// This is meant to send and receive the login data to or from our API server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

//=========================================Login USER Function=====================================
//This function sends a POST request to the api and then if the info is valid the api sends it back with a token to show a user has login
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Send/receive cookies
    });

    // console.log("Login response status:", response.status);
    // console.log("Login response ok:", response.ok);
    
    const data = await response.json();
    // console.log("Login response data:", data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // console.log("Login user data:", data);
    return data;
  } catch (error) {
    // console.error("Login error:", error);
    // Re-throw the error so it can be caught by the Login component
    throw error;
  }
}

//============================================================Register a USER Function======================================
//Does the same thing as login user but this one just registers a user
export async function registerUser(name, email, password, inviteCode = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, inviteCode }),
      credentials: 'include', // Send/receive cookies
    });

    // console.log("Register response status:", response.status);
    
    const data = await response.json();
    // console.log("Register response data:", data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    // console.error("Register error:", error);
    throw error;
  }
}

//============================================================getProfile USER Function======================================
//Sends a GET request to the api, it uses the token to basically ask who is the user
export async function getProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      credentials: 'include', // Auto-sends cookies
    });

    // console.log("Profile response status:", response.status);
    
    const data = await response.json();
  //  console.log("Profile response data:", data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }
    
    return data.user;
  } catch (error) {
    console.error("Profile error:", error);
    throw error;
  }
}
