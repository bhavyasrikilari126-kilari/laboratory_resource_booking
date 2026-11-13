import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Check,
  X,
  CheckCheck,
  Download,
  ClipboardList,
  Eye
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import CategoryIcon from '../components/CategoryIcon';
import Modal from '../components/Modal';
import { bookingAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  BOOKING_STATUSES,
  RESOURCE_CATEGORIES,
  formatDisplayDate
} from '../utils/categories';

const ManageBookingsPage = () => {
  const { showSuccess, showError } = useToast();

  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search.trim()) params.search = search.trim();

      const res = await bookingAPI.getAllAdmin(params);
      setBookings(res.data.data || []);
      if (res.data.summary) setSummary(res.data.summary);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, startDate, endDate, search, showError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBookings();
    }, 180);
    return () => clearTimeout(timer);
  }, [loadBookings]);

  const handleStatusChange = async (id, newStatus) => {
    setProcessingId(id);
    try {
      await bookingAPI.updateStatus(id, newStatus);
      showSuccess(`Booking marked as ${newStatus}.`);
      loadBookings();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setProcessingId(null);
    }
  };

  const exportCsvReport = () => {
    if (!bookings.length) {
      showError('No bookings available to export.');
      return;
    }

    const headers = [
      'Booking ID',
      'User Name',
      'User Email',
      'Role',
      'Department',
      'Resource',
      'Category',
      'Location',
      'Booking Date',
      'Start Time',
      'End Time',
      'Status',
      'Purpose'
    ];

    const escapeCsv = (val) =>
      `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = bookings.map((b) => [
      b._id,
      b.userId?.name || 'N/A',
      b.userId?.email || 'N/A',
      b.userId?.role || 'N/A',
      b.userId?.department || 'N/A',
      b.resourceId?.resourceName || 'Removed Resource',
      b.resourceId?.category || 'N/A',
      b.resourceId?.location || 'N/A',
      b.bookingDate,
      b.startTime,
      b.endTime,
      b.status,
      b.purpose
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lab-bookings-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSuccess('Booking report exported as CSV.');
  };

  return (
    <DashboardLayout
      title="Manage Bookings & Reports"
      subtitle="Approve or reject requests, mark sessions completed, and export booking reports"
      actions={
        <button type="button" className="btn btn-soft btn-sm" onClick={exportCsvReport}>
          <Download size={16} />
          Export CSV Report
        </button>
      }
    >
      {/* Summary Strip */}
      <div className="report-summary-strip">
        <div className="report-mini-card">
          <strong>{summary.total}</strong>
          <span>Total Shown</span>
        </div>
        <div className="report-mini-card">
          <strong style={{ color: '#b45309' }}>{summary.pending}</strong>
          <span>Pending</span>
        </div>
        <div className="report-mini-card">
          <strong style={{ color: '#15803d' }}>{summary.approved}</strong>
          <span>Approved</span>
        </div>
        <div className="report-mini-card">
          <strong style={{ color: '#1d4ed8' }}>{summary.completed}</strong>
          <span>Completed</span>
        </div>
        <div className="report-mini-card">
          <strong style={{ color: '#b91c1c' }}>{summary.rejected}</strong>
          <span>Rejected</span>
        </div>
        <div className="report-mini-card">
          <strong style={{ color: '#475569' }}>{summary.cancelled}</strong>
          <span>Cancelled</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-controls-row">
          <div className="search-input-wrap">
            <Search size={18} className="search-input-icon" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search user, department, resource, or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {BOOKING_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            className="form-control filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {RESOURCE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-controls-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              From:
            </span>
            <input
              type="date"
              className="form-control"
              style={{ width: 'auto' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              To:
            </span>
            <input
              type="date"
              className="form-control"
              style={{ width: 'auto' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {(startDate || endDate || statusFilter !== 'All' || categoryFilter !== 'All' || search) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setCategoryFilter('All');
                setStartDate('');
                setEndDate('');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Loading booking requests...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ClipboardList size={26} />
          </div>
          <h4>No Booking Requests Found</h4>
          <p>No bookings match the selected filters.</p>
        </div>
      ) : (
        <div className="panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Resource</th>
                  <th>Date & Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.userId?.name || 'Deleted User'}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {b.userId?.role} · {b.userId?.department || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CategoryIcon category={b.resourceId?.category} size={18} />
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
                      <div style={{ fontWeight: 600 }}>{formatDisplayDate(b.bookingDate)}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {b.startTime} – {b.endTime}
                      </div>
                    </td>
                    <td style={{ maxWidth: 220 }}>{b.purpose}</td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDetailTarget(b)}
                        >
                          <Eye size={14} />
                        </button>

                        {b.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              disabled={processingId === b._id}
                              onClick={() => handleStatusChange(b._id, 'Approved')}
                            >
                              <Check size={14} />
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              disabled={processingId === b._id}
                              onClick={() => handleStatusChange(b._id, 'Rejected')}
                            >
                              <X size={14} />
                              Reject
                            </button>
                          </>
                        )}

                        {b.status === 'Approved' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={processingId === b._id}
                              onClick={() => handleStatusChange(b._id, 'Completed')}
                            >
                              <CheckCheck size={14} />
                              Complete
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger-outline btn-sm"
                              disabled={processingId === b._id}
                              onClick={() => handleStatusChange(b._id, 'Cancelled')}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title="Booking Request Details"
        footer={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setDetailTarget(null)}
          >
            Close
          </button>
        }
      >
        {detailTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Status</span>
              <StatusBadge status={detailTarget.status} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Requested By</span>
              <div style={{ fontWeight: 700 }}>{detailTarget.userId?.name}</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {detailTarget.userId?.email} · {detailTarget.userId?.role} ·{' '}
                {detailTarget.userId?.department}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resource</span>
              <div style={{ fontWeight: 700 }}>
                {detailTarget.resourceId?.resourceName || 'Removed Resource'}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {detailTarget.resourceId?.category} · {detailTarget.resourceId?.location}
              </div>
            </div>
            <div className="form-row">
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date</span>
                <div style={{ fontWeight: 600 }}>
                  {formatDisplayDate(detailTarget.bookingDate)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time Slot</span>
                <div style={{ fontWeight: 600 }}>
                  {detailTarget.startTime} – {detailTarget.endTime}
                </div>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Purpose</span>
              <div style={{ fontSize: '0.92rem', marginTop: 2 }}>{detailTarget.purpose}</div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default ManageBookingsPage;

