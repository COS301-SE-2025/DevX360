import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/auth'; // Import directly
import AuthLayout from './AuthLayout';
import ThemeToggle from '../common/ThemeToggle';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    
    if (emailErr || passwordErr) {
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // Test by calling loginUser directly first
      // console.log("Attempting login with:", { email, password });
      const userData = await loginUser(email, password);
      // console.log("Login successful:", userData);
      
      // If direct login works, call the context login
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // console.log("Error caught in handleSubmit:", err);
      // console.log("Error type:", typeof err);
      // console.log("Error message:", err.message);
      // console.log("Full error object:", err);
      
      // More robust error handling
      let errorMessage = 'Login failed. Please try again.';
      
      if (err && typeof err === 'object') {
        if (err.message) {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = err.error;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // console.log("Setting error message:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
    if (error) setError('');
  };

  return (
    <AuthLayout>
      <div className="auth-form-container">
        <ThemeToggle position="absolute"/>
        <div className="logo">DevX360</div>
        <div className="tagline">Manage your team's workflow efficiently</div>

        <div className="auth-tabs">
          <div className="auth-tab active">Sign In</div>
          <div className="auth-tab" onClick={() => navigate('/register')}>Sign Up</div>
        </div>

        <form className="auth-form active" onSubmit={handleSubmit}>          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              required
            />
            {emailError && <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{emailError}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#666',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px'
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M1 1l22 22"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.72-6.72a3 3 0 1 0-4.24-4.24"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {passwordError && <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{passwordError}</div>}
          </div>

          {/* Server Error Message */}
          {error && (
            <div style={{ 
              color: 'red', 
              fontSize: '14px', 
              marginBottom: '15px', 
              textAlign: 'center',
              padding: '10px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px'
            }}>
              DEBUG: Error is: "{error}" (Type: {typeof error})
            </div>
          )}
          
          <div className="form-options">
            <div className="remember-me">
              <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    marginRight: "0.5rem",
                    verticalAlign: "middle"
                  }}
              />
              <label htmlFor="remember-me" style={{marginTop:"4px"}}>Remember me</label>
            </div>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <div className="divider">or continue with</div>
          
          <div className="social-logins">
            <button 
              type="button" 
              className="github-btn"
              onClick={() => window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5500'}/api/auth/github`}
            >
              <img 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" 
                className="social-icon" 
                alt="GitHub" 
              />
              <span>Continue with GitHub</span>
            </button>
          </div>
          
          <div className="auth-footer">
            Don't have an account? <a href="/register">Sign up</a>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Login;