const React = require('react');

module.exports = {
  MemoryRouter: ({ children }) => React.createElement('div', null, children),
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  useNavigate: () => () => {},
  Link: ({ children }) => React.createElement('a', null, children),
};
