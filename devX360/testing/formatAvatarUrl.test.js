// formatAvatarUrl.test.js

// Example utility implementation (you can import from the actual util file if already separated)
function formatAvatarUrl(avatar) {
  if (!avatar) return '/default-avatar.png';
  return avatar.startsWith('http')
    ? avatar
    : `http://localhost:5500${avatar}`;
}

// Unit test
describe('formatAvatarUrl', () => {
  test('returns default avatar when input is null', () => {
    expect(formatAvatarUrl(null)).toBe('/default-avatar.png');
  });

  test('preserves full URL avatar paths', () => {
    expect(formatAvatarUrl('https://cdn.com/avatar.jpg')).toBe(
      'https://cdn.com/avatar.jpg'
    );
  });

  test('converts relative avatar paths to full URLs', () => {
    expect(formatAvatarUrl('/uploads/avatar.png')).toBe(
      'http://localhost:5500/uploads/avatar.png'
    );
  });
});
