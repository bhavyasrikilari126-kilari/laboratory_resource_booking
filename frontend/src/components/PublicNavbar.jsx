import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FlaskConical, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PublicNavbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="public-navbar">
      <div className="public-navbar-inner">
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <FlaskConical size={22} />
          </div>
          <span>LabReserve</span>
        </Link>

        <nav className="public-nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `public-nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/resources"
            className={({ isActive }) => `public-nav-link ${isActive ? 'active' : ''}`}
          >
            Resources
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to={isAdmin ? '/admin' : '/dashboard'}
              className={({ isActive }) => `public-nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="public-nav-actions">
          {isAuthenticated ? (
            <>
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="btn btn-primary btn-sm"
              >
                <LayoutDashboard size={16} />
                {isAdmin ? 'Admin Panel' : 'Dashboard'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={16} />
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={16} />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;

