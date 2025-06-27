//Teams.jsx
// validateTeamPassword.test.js
// Standalone implementation of the password validation logic
function validateTeamPassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  // Check for special character (non-alphanumeric)
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password requires a special character';
  }
  return null;
}

describe('validateTeamPassword', () => {
  test('validates team passwords', () => {
    // Valid case
    expect(validateTeamPassword('ValidPass123!')).toBe(null);
    
    // Invalid cases
    expect(validateTeamPassword('short')).toBe('Password must be at least 8 characters');
    expect(validateTeamPassword('nospchars')).toBe('Password requires a special character');
  });
});
