import '@testing-library/jest-dom';

// Mock window.matchMedia for RTL in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Silence noisy console during tests; re-enable selectively in tests where needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const first = args[0] || '';
    if (typeof first === 'string' && (first.includes('Warning:') || first.includes('act('))) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

// Lightweight mock for react-router-dom to avoid ESM/Jest resolution issues in CRA
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  BrowserRouter: ({ children }) => children,
  useNavigate: () => () => {},
  Link: ({ children }) => children,
}));
