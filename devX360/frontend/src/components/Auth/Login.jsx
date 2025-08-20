import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import ThemeToggle from '../common/ThemeToggle';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
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
              onClick={() => window.location.href = `${API_BASE_URL}/api/auth/github`}
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