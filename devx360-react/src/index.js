// This is the root file that will basically display or render the App component App.js
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/main.css';

// Get the root element
const container = document.getElementById('root');
const root = createRoot(container);

// We wrap the App with ThemeProvider and AuthProvider for the theme and authentication context
root.render(
  // We use the React.StrictMode for development checks
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);