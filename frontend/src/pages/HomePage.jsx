import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  FlaskConical,
  Search
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import CategoryIcon from '../components/CategoryIcon';
import StatusBadge from '../components/StatusBadge';
import { RESOURCE_CATEGORIES, CATEGORY_DETAILS } from '../utils/categories';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div>
      <PublicNavbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-inner">
          <div>
            <div className="hero-pill">
              <FlaskConical size={15} />
              Smart Campus Laboratory Scheduling
            </div>
            <h1 className="hero-title">
              Reserve Campus <span>Laboratory Resources</span> Without Conflicts
            </h1>
            <p className="hero-subtitle">
              A unified platform for students, faculty members, and lab administrators to
              discover laboratory equipment, check real-time slot availability, book
              resources, and streamline approvals.
            </p>

            <div className="hero-actions">
              {isAuthenticated ? (
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="btn btn-primary btn-lg"
                >
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Register Account
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Sign In
                  </Link>
                </>
              )}
              <Link to="/resources" className="btn btn-soft btn-lg">
                <Search size={18} />
                Browse Resources
              </Link>
            </div>

            <div className="hero-metrics">
              <div className="hero-metric-item">
                <strong>7</strong>
                <span>Equipment Categories</span>
              </div>
              <div className="hero-metric-item">
                <strong>Zero</strong>
                <span>Double-Booking Conflicts</span>
              </div>
              <div className="hero-metric-item">
                <strong>Real-Time</strong>
                <span>Slot Availability & Tracking</span>
              </div>
            </div>
          </div>

          <div className="hero-preview-card">
            <div className="hero-preview-header">
              <div>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 700 }}>
                  Live Lab Resource Overview
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Instant availability & booking status updates
                </p>
              </div>
              <StatusBadge status="Available" />
            </div>

            <div className="preview-slot-list">
              <div className="preview-slot-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CategoryIcon category="Computer Systems" size={20} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      NVIDIA DGX AI Workstation
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Lab CS-204 · 14:00 – 16:30
                    </div>
                  </div>
                </div>
                <StatusBadge status="Pending" />
              </div>

              <div className="preview-slot-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CategoryIcon category="Electronic Equipment" size={20} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      Keysight 4-Channel Oscilloscope
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Lab EC-301 · 10:00 – 12:00
                    </div>
                  </div>
                </div>
                <StatusBadge status="Approved" />
              </div>

              <div className="preview-slot-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CategoryIcon category="Projectors" size={20} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      Epson 4K Laser Projector
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Seminar Lab B-01 · 09:30 – 11:30
                    </div>
                  </div>
                </div>
                <StatusBadge status="Approved" />
              </div>

              <div className="preview-slot-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CategoryIcon category="Software Resources" size={20} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      MATLAB & Simulink Floating Node
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Virtual Server · 16:00 – 18:00
                    </div>
                  </div>
                </div>
                <StatusBadge status="Completed" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="home-section">
        <div className="section-header">
          <span className="section-tag">Equipment Catalog</span>
          <h2>All Laboratory Categories in One Place</h2>
          <p>
            Explore dedicated computing systems, specialized electronics, networking gear,
            and licensed software tools across campus departments.
          </p>
        </div>

        <div className="category-showcase-grid">
          {RESOURCE_CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/resources?category=${encodeURIComponent(category)}`}
              className="category-showcase-card"
            >
              <CategoryIcon category={category} size={24} />
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700 }}>{category}</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                {CATEGORY_DETAILS[category]?.shortDesc}
              </p>
              <span
                style={{
                  marginTop: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--primary)'
                }}
              >
                Explore category <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="home-section" style={{ paddingTop: 10 }}>
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2>Streamlined Booking & Approval Workflow</h2>
          <p>
            Designed for fast student access and rigorous administrative oversight.
          </p>
        </div>

        <div className="workflow-grid">
          <div className="workflow-step">
            <div className="workflow-number">1</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
              Browse & Filter
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Search resources by name, location, or category and inspect live availability.
            </p>
          </div>
          <div className="workflow-step">
            <div className="workflow-number">
              <Clock size={18} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
              Pick Date & Time
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Select your preferred date and time slot with automatic conflict detection.
            </p>
          </div>
          <div className="workflow-step">
            <div className="workflow-number">
              <ShieldCheck size={18} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
              Admin Verification
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Lab administrators review requests, prevent overlaps, and approve bookings.
            </p>
          </div>
          <div className="workflow-step">
            <div className="workflow-number">
              <CalendarCheck2 size={18} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
              Track & Complete
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Monitor approval status, cancel anytime if plans change, or review history.
            </p>
          </div>
        </div>
      </section>

      {/* Role CTA Banner */}
      <section className="home-section" style={{ paddingTop: 0 }}>
        <div className="welcome-banner" style={{ marginBottom: 0 }}>
          <div>
            <h2>Ready to Book Your Next Lab Session?</h2>
            <p>
              Join students and faculty across departments using LabReserve for conflict-free
              laboratory scheduling.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-secondary">
              <CheckCircle2 size={17} />
              Create Student / Faculty Account
            </Link>
            <Link
              to="/login"
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.16)',
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.35)'
              }}
            >
              Admin & User Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="public-footer">
        <div className="public-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FlaskConical size={20} color="#60a5fa" />
            <strong style={{ color: '#ffffff' }}>LabReserve</strong>
            <span>— Laboratory Resource Booking System</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Built with React, Node.js, Express & MongoDB
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

