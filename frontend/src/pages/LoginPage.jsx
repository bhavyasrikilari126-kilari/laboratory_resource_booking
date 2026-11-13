import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fillDemoCredentials = (type) => {
    setError('');
    if (type === 'admin') {
      setActiveTab('admin');
      setEmail('admin@labbook.edu');
      setPassword('password123');
    } else if (type === 'faculty') {
      setActiveTab('user');
      setEmail('faculty@labbook.edu');
      setPassword('password123');
    } else {
      setActiveTab('user');
      setEmail('student@labbook.edu');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const userData = await login({ email: email.trim(), password });
      showSuccess(`Welcome back, ${userData.name}!`);

      const redirectFrom = location.state?.from?.pathname;
      if (userData.role === 'admin') {
        navigate(redirectFrom && redirectFrom.startsWith('/admin') ? redirectFrom : '/admin', {
          replace: true
        });
      } else {
        navigate(
          redirectFrom && !redirectFrom.startsWith('/admin') ? redirectFrom : '/dashboard',
          { replace: true }
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PublicNavbar />
      <div className="auth-wrapper">
        <div className="auth-container">
          <div className="auth-info-panel">
            <div>
              <h2>
                {activeTab === 'admin'
                  ? 'Administrator Control Portal'
                  : 'Welcome Back to LabReserve'}
              </h2>
              <p style={{ color: '#dbeafe', fontSize: '0.95rem' }}>
                {activeTab === 'admin'
                  ? 'Sign in with administrator credentials to manage lab resources, review booking requests, and monitor department usage.'
                  : 'Sign in as a student or faculty member to browse lab facilities, reserve time slots, and track booking status.'}
              </p>

              <ul className="auth-info-list">
                <li>
                  <CheckCircle2 size={18} color="#93c5fd" />
                  Role-based dashboard redirection
                </li>
                <li>
                  <CheckCircle2 size={18} color="#93c5fd" />
                  Encrypted JWT authentication & secure APIs
                </li>
                <li>
                  <CheckCircle2 size={18} color="#93c5fd" />
                  Instant resource availability & booking history
                </li>
              </ul>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#bfdbfe' }}>
              New student or faculty member?{' '}
              <Link
                to="/register"
                style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'underline' }}
              >
                Register an account
              </Link>
            </div>
          </div>

          <div className="auth-form-panel">
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${activeTab === 'user' ? 'active' : ''}`}
                onClick={() => setActiveTab('user')}
              >
                Student / Faculty Login
              </button>
              <button
                type="button"
                className={`auth-tab ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                Admin Login
              </button>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>
              {activeTab === 'admin' ? 'Administrator Sign In' : 'Sign In to Your Account'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              Enter your registered email and password below.
            </p>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  placeholder={
                    activeTab === 'admin' ? 'admin@labbook.edu' : 'student@labbook.edu'
                  }
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={submitting}
              >
                {activeTab === 'admin' ? <ShieldCheck size={18} /> : <LogIn size={18} />}
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="demo-box">
              <div className="demo-box-title">Quick Fill Seeded Demo Accounts</div>
              <div className="demo-buttons">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fillDemoCredentials('student')}
                >
                  Student Demo
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fillDemoCredentials('faculty')}
                >
                  Faculty Demo
                </button>
                <button
                  type="button"
                  className="btn btn-soft btn-sm"
                  onClick={() => fillDemoCredentials('admin')}
                >
                  Admin Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

