import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  ClipboardList,
  Clock,
  CheckCircle2,
  Users,
  Plus,
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import CategoryIcon from '../components/CategoryIcon';
import { bookingAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDisplayDate } from '../utils/categories';

const AdminDashboardPage = () => {
  const { showSuccess, showError } = useToast();

  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadAdminStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getStats();
      setStats(res.data.stats);
      setRecentBookings(res.data.recentBookings || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load administrator dashboard.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadAdminStats();
  }, [loadAdminStats]);

  const handleQuickAction = async (bookingId, status) => {
    setProcessingId(bookingId);
    try {
      await bookingAPI.updateStatus(bookingId, status);
      showSuccess(`Booking ${status.toLowerCase()} successfully.`);
      loadAdminStats();
    } catch (err) {
      showError(err.response?.data?.message || 'Unable to update booking status.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingQueue = recentBookings.filter((b) => b.status === 'Pending');
  const maxCategoryCount = Math.max(
    1,
    ...(stats?.bookingsByCategory || []).map((c) => c.count)
  );

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Monitor laboratory resources, booking requests, and campus utilization"
      actions={
        <Link to="/admin/resources" className="btn btn-primary btn-sm">
          <Plus size={16} />
          Add Resource
        </Link>
      }
    >
      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Loading administrator metrics...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              label="Total Resources"
              value={stats?.totalResources ?? 0}
              subtext={`${stats?.availableResources ?? 0} available · ${
                stats?.unavailableResources ?? 0
              } unavailable`}
              icon={Boxes}
              variant="blue"
            />
            <StatCard
              label="Total Bookings"
              value={stats?.totalBookings ?? 0}
              subtext={`${stats?.completedBookings ?? 0} completed · ${
                stats?.rejectedBookings ?? 0
              } rejected`}
              icon={ClipboardList}
              variant="sky"
            />
            <StatCard
              label="Pending Bookings"
              value={stats?.pendingBookings ?? 0}
              subtext="Awaiting administrator review"
              icon={Clock}
              variant="amber"
            />
            <StatCard
              label="Approved Bookings"
              value={stats?.approvedBookings ?? 0}
              subtext={`${stats?.totalUsers ?? 0} registered users`}
              icon={CheckCircle2}
              variant="green"
            />
          </div>

          <div className="admin-split-grid">
            {/* Pending Queue */}
            <div className="panel" style={{ marginBottom: 0 }}>
              <div className="panel-header">
                <div>
                  <h3>Pending Approval Queue</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Latest requests needing approval
                  </span>
                </div>
                <Link to="/admin/bookings" className="btn btn-soft btn-sm">
                  Manage All <ArrowRight size={14} />
                </Link>
              </div>
              <div className="panel-body">
                {pendingQueue.length === 0 ? (
                  <div className="empty-state" style={{ padding: '28px 18px' }}>
                    <h4>No Pending Requests</h4>
                    <p style={{ marginBottom: 0 }}>
                      All recent booking requests have been reviewed.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pendingQueue.map((item) => (
                      <div
                        key={item._id}
                        style={{
                          padding: '14px',
                          borderRadius: 10,
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-page)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 12,
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <CategoryIcon
                            category={item.resourceId?.category}
                            size={19}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                              {item.resourceId?.resourceName || 'Removed Resource'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {item.userId?.name} ({item.userId?.role}) ·{' '}
                              {formatDisplayDate(item.bookingDate)} · {item.startTime}–
                              {item.endTime}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            disabled={processingId === item._id}
                            onClick={() => handleQuickAction(item._id, 'Approved')}
                          >
                            <Check size={14} />
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={processingId === item._id}
                            onClick={() => handleQuickAction(item._id, 'Rejected')}
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown & Quick Links */}
            <div className="panel" style={{ marginBottom: 0 }}>
              <div className="panel-header">
                <h3>Bookings by Category</h3>
                <Link to="/admin/users" className="btn btn-secondary btn-sm">
                  <Users size={14} />
                  Users ({stats?.totalUsers ?? 0})
                </Link>
              </div>
              <div className="panel-body">
                {!stats?.bookingsByCategory?.length ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No booking statistics available yet.
                  </p>
                ) : (
                  stats.bookingsByCategory.map((row) => (
                    <div key={row.category} className="bar-row">
                      <div className="bar-label-row">
                        <span>{row.category}</span>
                        <span style={{ color: 'var(--primary)' }}>{row.count}</span>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${Math.round((row.count / maxCategoryCount) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}

                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: '1px solid var(--border-color)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 10,
                    textAlign: 'center'
                  }}
                >
                  <div className="report-mini-card">
                    <strong>{stats?.completedBookings ?? 0}</strong>
                    <span>Completed</span>
                  </div>
                  <div className="report-mini-card">
                    <strong>{stats?.rejectedBookings ?? 0}</strong>
                    <span>Rejected</span>
                  </div>
                  <div className="report-mini-card">
                    <strong>{stats?.cancelledBookings ?? 0}</strong>
                    <span>Cancelled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="panel">
            <div className="panel-header">
              <h3>Recent Booking Activity</h3>
              <Link to="/admin/bookings" className="btn btn-secondary btn-sm">
                Full History & Reports <ArrowRight size={14} />
              </Link>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Requested By</th>
                    <th>Resource</th>
                    <th>Date & Slot</th>
                    <th>Purpose</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.userId?.name || 'Deleted User'}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {b.userId?.department || '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <CategoryIcon category={b.resourceId?.category} size={17} />
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {b.resourceId?.resourceName || 'Removed Resource'}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              {b.resourceId?.category || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{formatDisplayDate(b.bookingDate)}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {b.startTime} – {b.endTime}
                        </div>
                      </td>
                      <td style={{ maxWidth: 260 }}>{b.purpose}</td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboardPage;

