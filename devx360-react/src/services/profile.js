const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

//===========================================================updates your profile pic Function======================================
//Sends a POST request to the api to change your profile photo so it sends the photos "Avatars" link that the api will handle
export async function updateAvatar(formData) {
  const userSession = JSON.parse(localStorage.getItem('userSession'));
  const token = userSession?.token;
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update avatar');
  }

  return data;
}

//===========================================================getTeams Function======================================
//Sends a GET request to the api to get all the teams the person who is logined to display them we need the token to know who is logged
export async function getMyTeams() {
  const userSession = JSON.parse(localStorage.getItem('userSession'));
  const token = userSession?.token;

  const response = await fetch('http://localhost:5000/api/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);

  return data.user.teams || [];
}

