//This is the root file that will basically display or render the App component App.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/main.css';

//We wrap the App with ThemeProvider and AuthProver for the theme and authenticaation context
ReactDOM.render(
  //We use the React.StrictMode for development checks
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);