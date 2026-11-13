import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  CalendarCheck,
  Clock,
  CheckCircle2,
  CalendarPlus,
  Search,
  ArrowRight,
  XCircle
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import ResourceCard from '../components/ResourceCard';
import StatusBadge from '../components/StatusBadge';
import CategoryIcon from '../components/CategoryIcon';
import { bookingAPI, resourceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RESOURCE_CATEGORIES, formatDisplayDate } from '../utils/categories';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, resRes] = await Promise.all([
        bookingAPI.getStats(),
        resourceAPI.getAll({ availability: 'true' })
      ]);
      setStats(statsRes.data.stats);
      setRecentBookings(statsRes.data.recentBookings || []);
      setResources(resRes.data.data || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingAPI.cancel(bookingId);
      showSuccess('Booking cancelled successfully.');
      loadDashboard();
    } catch (err) {
      showError(err.response?.data?.message || 'Unable to cancel booking.');
    }
  };

  const filteredResources = resources
    .filter((r) => {
      const matchesCat =
        selectedCategory === 'All' || r.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.resourceName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    })
    .slice(0, 6);

  return (
    <DashboardLayout
      title="User Dashboard"
      subtitle="Overview of available laboratory resources and your bookings"
      actions={
        <Link to="/book" className="btn btn-primary btn-sm">
          <CalendarPlus size={16} />
          Book Resource
        </Link>
      }
    >
      <div className="welcome-banner animate-fade-in">
        <div>
          <h2>Welcome back, {user?.name}</h2>
          <p>
            {user?.role === 'faculty' ? 'Faculty Member' : 'Student'} ·{' '}
            {user?.department}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/resources" className="btn btn-secondary">
            Explore All Resources
          </Link>
          <Link
            to="/book"
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.18)',
              color: '#ffffff',
              borderColor: 'rgba(255,255,255,0.35)'
            }}
          >
            <CalendarPlus size={17} />
            New Reservation
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Loading your dashboard...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              label="Available Resources"
              value={stats?.availableResources ?? 0}
              subtext={`Out of ${stats?.totalResources ?? 0} total lab items`}
              icon={Boxes}
              variant="blue"
            />
            <StatCard
              label="My Total Bookings"
              value={stats?.myTotalBookings ?? 0}
              subtext={`${stats?.myCompleted ?? 0} completed sessions`}
              icon={CalendarCheck}
              variant="sky"
            />
            <StatCard
              label="Pending Requests"
              value={stats?.myPending ?? 0}
              subtext="Awaiting admin approval"
              icon={Clock}
              variant="amber"
            />
            <StatCard
              label="Approved Bookings"
              value={stats?.myApproved ?? 0}
              subtext="Confirmed laboratory slots"
              icon={CheckCircle2}
              variant="green"
            />
          </div>

          {/* Available Resources Section */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Available Laboratory Resources</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Quick search and filter across ready-to-book facilities
                </span>
              </div>
              <Link to="/resources" className="btn btn-soft btn-sm">
                View Full Catalog <ArrowRight size={15} />
              </Link>
            </div>

            <div className="panel-body">
              <div className="filter-controls-row" style={{ marginBottom: 14 }}>
                <div className="search-input-wrap">
                  <Search size={17} className="search-input-icon" />
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search available equipment, labs, or software..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="category-pills" style={{ marginBottom: 18 }}>
                <button
                  type="button"
                  className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('All')}
                >
                  All Categories
                </button>
                {RESOURCE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <CategoryIcon category={cat} size={14} withBox={false} />
                    {cat}
                  </button>
                ))}
              </div>

              {filteredResources.length === 0 ? (
                <div className="empty-state">
                  <h4>No matching available resources</h4>
                  <p>Try clearing your search or choosing a different category.</p>
                </div>
              ) : (
                <div className="resources-grid">
                  {filteredResources.map((res) => (
                    <ResourceCard key={res._id} resource={res} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings Section */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Recent Bookings</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Track approval status or cancel upcoming reservations
                </span>
              </div>
              <Link to="/my-bookings" className="btn btn-secondary btn-sm">
                All My Bookings <ArrowRight size={15} />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="panel-body">
                <div className="empty-state">
                  <h4>No bookings yet</h4>
                  <p>Browse available laboratory resources to reserve your first slot.</p>
                  <Link to="/book" className="btn btn-primary btn-sm">
                    Book a Resource
                  </Link>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Resource</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Purpose</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CategoryIcon
                              category={booking.resourceId?.category}
                              size={18}
                            />
                            <div>
                              <div style={{ fontWeight: 600 }}>
                                {booking.resourceId?.resourceName || 'Removed Resource'}
                              </div>
                              <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                                {booking.resourceId?.location || '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{formatDisplayDate(booking.bookingDate)}</td>
                        <td>
                          {booking.startTime} – {booking.endTime}
                        </td>
                        <td style={{ maxWidth: 240 }}>{booking.purpose}</td>
                        <td>
                          <StatusBadge status={booking.status} />
                        </td>
                        <td>
                          {['Pending', 'Approved'].includes(booking.status) ? (
                            <button
                              type="button"
                              className="btn btn-danger-outline btn-sm"
                              onClick={() => handleCancelBooking(booking._id)}
                            >
                              <XCircle size={14} />
                              Cancel
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default UserDashboardPage;

