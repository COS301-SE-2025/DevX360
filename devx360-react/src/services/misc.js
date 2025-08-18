const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch users');
  }

  console.log("data", data);

  return data.users; // Returns the array of users
}