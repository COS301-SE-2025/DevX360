//Metrics.jsx
//formatContributors.test.js

//Standalone copy of the formatting function, same logic as in Metrics.jsx
function formatContributors(apiData) {
  return apiData.map(({ login, contributions, avatar_url, html_url }) => ({
    name: login,
    contributions,
    avatar: avatar_url.startsWith('http') ? avatar_url : `http://localhost:5500${avatar_url}`,
    profile: html_url,
  }));
}

describe('formatContributors', () => {
  test('formats contributor data correctly', () => {
    const apiData = [
      { login: 'user1', contributions: 42, avatar_url: '/avatar1', html_url: '/profile1' }
    ];

    const expected = [
      {
        name: 'user1',
        contributions: 42,
        avatar: 'http://localhost:5500/avatar1',
        profile: '/profile1'
      }
    ];

    expect(formatContributors(apiData)).toEqual(expected);
  });
});
