import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  LayoutDashboard,
  Cpu,
  CalendarPlus,
  CalendarCheck,
  ShieldCheck,
  Boxes,
  ClipboardList,
  Users,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';

const DashboardLayout = ({ title, subtitle, actions, children }) => {
  const { user, isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-shell">
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/" className="sidebar-brand-text" onClick={closeSidebar}>
            <div className="brand-icon" style={{ width: 34, height: 34, borderRadius: 9 }}>
              <FlaskConical size={18} />
            </div>
            <span>LabReserve</span>
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {isAdmin ? (
            <>
              <div className="sidebar-section-label">Administration</div>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <ShieldCheck size={18} />
                Admin Dashboard
              </NavLink>
              <NavLink
                to="/admin/resources"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <Boxes size={18} />
                Manage Resources
              </NavLink>
              <NavLink
                to="/admin/bookings"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <ClipboardList size={18} />
                Manage Bookings
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <Users size={18} />
                Manage Users
              </NavLink>

              <div className="sidebar-section-label">Catalog & Portal</div>
              <NavLink
                to="/resources"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <Cpu size={18} />
                Browse Resources
              </NavLink>
              <NavLink
                to="/book"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <CalendarPlus size={18} />
                Book Resource
              </NavLink>
              <NavLink
                to="/my-bookings"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <CalendarCheck size={18} />
                My Bookings
              </NavLink>
            </>
          ) : (
            <>
              <div className="sidebar-section-label">Workspace</div>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <LayoutDashboard size={18} />
                User Dashboard
              </NavLink>
              <NavLink
                to="/resources"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <Cpu size={18} />
                Resources
              </NavLink>
              <NavLink
                to="/book"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <CalendarPlus size={18} />
                Book Resource
              </NavLink>
              <NavLink
                to="/my-bookings"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <CalendarCheck size={18} />
                My Bookings
              </NavLink>
            </>
          )}

          <div className="sidebar-section-label">General</div>
          <Link to="/" className="sidebar-link" onClick={closeSidebar}>
            <Home size={18} />
            Public Home
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div className="sidebar-user-meta">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">
                {user?.role} · {user?.department}
              </div>
            </div>
          </div>
          <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="topbar-title">{title}</div>
              {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
            </div>
          </div>

          <div className="topbar-right">
            {actions}
            <div className="topbar-user-pill">
              <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.72rem' }}>
                {getInitials(user?.name)}
              </div>
              <span>{user?.name}</span>
              <StatusBadge status={user?.role} />
            </div>
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;

