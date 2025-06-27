//Team.jsx

//The validation function
function validateSearchTerm(term) {
  if (!term || term.trim() === '') {
    return 'Please enter a team name to search.';
  }
  return null;
}

// Tests for validateSearchTerm
describe('validateSearchTerm', () => {
  test('returns error message for empty string', () => {
    expect(validateSearchTerm('')).toBe('Please enter a team name to search.');
  });

  test('returns error message for string with only spaces', () => {
    expect(validateSearchTerm('   ')).toBe('Please enter a team name to search.');
  });

  test('returns null for valid non-empty string', () => {
    expect(validateSearchTerm('abc')).toBeNull();
  });
});
