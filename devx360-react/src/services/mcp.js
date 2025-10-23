const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

/**
 * Generate a new MCP token
 * @param {string} name - Token name/description
 * @param {number} expiresInDays - Number of days until expiration (optional)
 * @returns {Promise<Object>} Token data including the plain token (only shown once)
 */
export async function createMCPToken(name, expiresInDays) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/mcp-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, expiresInDays }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create MCP token');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all MCP tokens for the current user
 * @returns {Promise<Object>} List of tokens (without actual token values)
 */
export async function getMCPTokens() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/mcp-tokens`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch MCP tokens');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Revoke (deactivate) an MCP token
 * @param {string} tokenId - Token ID to revoke
 * @returns {Promise<Object>} Success message
 */
export async function revokeMCPToken(tokenId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/mcp-tokens/${tokenId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to revoke MCP token');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Update MCP token details (name only)
 * @param {string} tokenId - Token ID to update
 * @param {string} name - New token name
 * @returns {Promise<Object>} Updated token data
 */
export async function updateMCPToken(tokenId, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/mcp-tokens/${tokenId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update MCP token');
    }

    return data;
  } catch (error) {
    throw error;
  }
}


