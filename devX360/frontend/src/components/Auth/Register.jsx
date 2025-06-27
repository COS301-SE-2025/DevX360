import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import AuthLayout from './AuthLayout';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInviteField, setShowInviteField] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      await register(name, role, email, password, inviteCode);
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
        <ThemeToggle />
        <div className="logo">DevX360</div>
        <div className="tagline">Engineering Intelligence Platform</div>

        <div className="auth-tabs">
          <div className="auth-tab" onClick={() => navigate('/login')}>Sign In</div>
          <div className="auth-tab active">Sign Up</div>
        </div>

        <form className="auth-form active" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="register-name">Full Name</label>
            <input
              type="text"
              id="register-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-role">Role</label>
            <input
              type="text"
              id="register-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Developer"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input
              type="email"
              id="register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              type="password"
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="register-confirm">Confirm Password</label>
            <input
              type="password"
              id="register-confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowInviteField(!showInviteField)}
          >
            {showInviteField ? 'Hide Invite Code' : 'Have an invite code?'}
          </button>
          
          {showInviteField && (
            <div className="form-group">
              <label htmlFor="invite-code">Invite Code (optional)</label>
              <input
                type="text"
                id="invite-code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code if you have one"
              />
            </div>
          )}
          
          <div className="form-group terms">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
            />
            <label htmlFor="terms">I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a></label>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="divider">or sign up with</div>
          
          <div className="social-logins">
            <div className="social-btn">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" className="social-icon" alt="Google" />
            </div>
            <div className="social-btn">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" className="social-icon" alt="Facebook" />
            </div>
            <div className="social-btn">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/discord/discord-original.svg" className="social-icon" alt="Discord" />
            </div>
          </div>
          
          <div className="auth-footer">
            Already have an account? <a href="#" onClick={() => navigate('/login')}>Sign in</a>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Register;