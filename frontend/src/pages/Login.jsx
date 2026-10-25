import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username/email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
    setLoading(true);

    try {
      await login('admin', 'admin123');
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Demo login failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Header / Logo */}
        <div className="login-header">
          <div className="login-icon">🏠</div>
          <h1 className="login-title">Hostel Portal Login</h1>
          <p className="login-subtitle">
            Admin & Warden Management System
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-alert" role="alert">
            <span className="login-alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-username">Username or Email</label>
            <div className="login-input-wrapper">
              <span className="login-field-icon">👤</span>
              <input
                id="login-username"
                type="text"
                className="form-control login-input"
                placeholder="e.g. admin or warden@hostel.edu"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="login-input-wrapper">
              <span className="login-field-icon">🔒</span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control login-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="login-toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="login-btn-loading">
                <span className="login-spinner"></span>
                Logging in...
              </span>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        {/* Quick Demo Section */}
        <div className="login-demo-box">
          <div className="login-demo-header">
            <span>💡 Evaluation / Demo Access:</span>
          </div>
          <div className="login-demo-details">
            <code>admin</code> / <code>admin123</code>
          </div>
          <button
            type="button"
            className="btn btn-outline login-demo-btn"
            onClick={handleQuickDemo}
            disabled={loading}
          >
            ⚡ 1-Click Demo Login
          </button>
        </div>

        <div className="login-footer">
          Hostel Room Allocation System &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
