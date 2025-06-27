const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

//===========================================================updates your profile pic Function======================================
//Sends a POST request to the api to change your profile photo
export async function updateAvatar(file, currentUser) {
  try {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch(`${API_BASE_URL}/api/avatar`, {
      method: 'POST', 
      credentials: 'include', 
      body: formData, 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update avatar');
    }

    return await response.json(); 
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
}

//===========================================================updateProfile Function======================================
//Sends a PUT request to update user profile (name, email, role)
export async function updateProfile(profileData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}

//===========================================================getTeams Function======================================
//Sends a GET request to the api to get all the teams the person who is logged in
export async function getMyTeams() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile data');
    }

    const data = await response.json();
    
    // Ensure the response structure matches what we expect
    if (!data.user || !Array.isArray(data.user.teams)) {
      return [];
    }

    return data.user.teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}