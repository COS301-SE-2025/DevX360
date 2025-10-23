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

export async function updateUserRole(userId, newRole) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: newRole }),
  })

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user role');
  }

  return typeof data === 'object' ? data : { message: data };
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

  return data; // Returns { anomalies, summary }
}

/**
 * Get all MCP tokens across all users (admin only)
 * @returns {Promise<Array>} List of all MCP tokens with user information
 */
export async function getAllMCPTokens() {
  const response = await fetch(`${API_BASE_URL}/api/admin/mcp-tokens`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch MCP tokens');
  }

  return data;
}

/**
 * Admin: Revoke a specific MCP token
 * @param {string} tokenId - Token ID to revoke
 * @param {string} reason - Reason for revocation
 * @returns {Promise<Object>} Revocation result
 */
export async function revokeTokenAdmin(tokenId, reason) {
  const response = await fetch(`${API_BASE_URL}/api/admin/mcp-tokens/${tokenId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to revoke token');
  }

  return data;
}

/**
 * Admin: Revoke all tokens for a specific user
 * @param {string} userId - User ID
 * @param {string} reason - Reason for revocation
 * @returns {Promise<Object>} Revocation result
 */
export async function revokeAllUserTokens(userId, reason) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/revoke-tokens`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to revoke user tokens');
  }

  return data;
}

/**
 * Admin: Update security alert status
 * @param {string} alertId - Alert ID
 * @param {string} status - New status (new, investigating, resolved, false_positive)
 * @param {string} notes - Optional notes
 * @returns {Promise<Object>} Update result
 */
export async function updateSecurityAlertStatus(alertId, status, notes) {
  const response = await fetch(`${API_BASE_URL}/api/admin/security-alerts/${alertId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notes }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update security alert');
  }

  return data;
}

/**
 * Admin: Get tokens with suspicious activity
 * @returns {Promise<Object>} List of suspicious tokens
 */
export async function getSuspiciousTokens() {
  const response = await fetch(`${API_BASE_URL}/api/admin/suspicious-tokens`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch suspicious tokens');
  }

  return data;
}