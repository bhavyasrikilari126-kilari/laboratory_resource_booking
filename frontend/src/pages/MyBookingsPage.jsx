import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CalendarPlus,
  XCircle,
  CalendarCheck,
  Eye
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import CategoryIcon from '../components/CategoryIcon';
import Modal from '../components/Modal';
import { bookingAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { BOOKING_STATUSES, formatDisplayDate } from '../utils/categories';

const MyBookingsPage = () => {
  const { showSuccess, showError } = useToast();

  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data.data || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load booking history.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setProcessingId(cancelTarget._id);
    try {
      await bookingAPI.cancel(cancelTarget._id);
      showSuccess('Booking cancelled successfully.');
      setCancelTarget(null);
      loadBookings();
    } catch (err) {
      showError(err.response?.data?.message || 'Unable to cancel booking.');
    } finally {
      setProcessingId(null);
    }
  };

  const getCountByStatus = (status) => {
    if (status === 'All') return bookings.length;
    return bookings.filter((b) => b.status === status).length;
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (b.resourceId?.resourceName || '').toLowerCase().includes(q) ||
      (b.resourceId?.category || '').toLowerCase().includes(q) ||
      (b.purpose || '').toLowerCase().includes(q) ||
      (b.bookingDate || '').includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout
      title="My Bookings"
      subtitle="Track reservation approvals, view booking history, or cancel requests"
      actions={
        <Link to="/book" className="btn btn-primary btn-sm">
          <CalendarPlus size={16} />
          New Booking
        </Link>
      }
    >
      <div className="filter-bar">
        <div className="filter-controls-row">
          <div className="search-input-wrap">
            <Search size={18} className="search-input-icon" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search by resource name, category, date, or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="category-pills">
          {['All', ...BOOKING_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              className={`category-pill ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st} ({getCountByStatus(st)})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Loading your bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CalendarCheck size={26} />
          </div>
          <h4>No Bookings Found</h4>
          <p>
            {bookings.length === 0
              ? 'You have not made any laboratory resource reservations yet.'
              : 'No bookings match your current filter criteria.'}
          </p>
          <Link to="/book" className="btn btn-primary btn-sm">
            Book a Resource
          </Link>
        </div>
      ) : (
        <div className="panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Booking Date</th>
                  <th>Time Window</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CategoryIcon category={booking.resourceId?.category} size={18} />
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {booking.resourceId?.resourceName || 'Removed Resource'}
                          </div>
                          <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                            {booking.resourceId?.category || '-'} ·{' '}
                            {booking.resourceId?.location || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{formatDisplayDate(booking.bookingDate)}</td>
                    <td>
                      <strong>
                        {booking.startTime} – {booking.endTime}
                      </strong>
                    </td>
                    <td style={{ maxWidth: 240 }}>{booking.purpose}</td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(booking.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDetailTarget(booking)}
                        >
                          <Eye size={14} />
                          View
                        </button>
                        {['Pending', 'Approved'].includes(booking.status) && (
                          <button
                            type="button"
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => setCancelTarget(booking)}
                          >
                            <XCircle size={14} />
                            Cancel
                          </button>
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

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel Reservation"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setCancelTarget(null)}
            >
              Keep Booking
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={confirmCancel}
              disabled={processingId === cancelTarget?._id}
            >
              {processingId === cancelTarget?._id ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to cancel your reservation for{' '}
          <strong>{cancelTarget?.resourceId?.resourceName}</strong> on{' '}
          <strong>{formatDisplayDate(cancelTarget?.bookingDate)}</strong> (
          {cancelTarget?.startTime} – {cancelTarget?.endTime})?
        </p>
      </Modal>

      {/* Booking Details Modal */}
      <Modal
        isOpen={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title="Booking Details"
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

export default MyBookingsPage;

