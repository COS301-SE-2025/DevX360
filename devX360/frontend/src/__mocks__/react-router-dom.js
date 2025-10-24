const React = require('react');

module.exports = {
  MemoryRouter: ({ children }) => React.createElement('div', null, children),
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  useNavigate: () => () => {},
  NavLink: ({ children }) => React.createElement('a', null, children),
  Link: ({ children }) => React.createElement('a', null, children),
};
