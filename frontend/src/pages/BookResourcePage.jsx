import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  CalendarPlus,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Layers,
  Clock,
  ArrowLeft
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import CategoryIcon from '../components/CategoryIcon';
import StatusBadge from '../components/StatusBadge';
import { bookingAPI, resourceAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { getTodayDateString, formatDisplayDate } from '../utils/categories';

const TIME_PRESETS = [
  { label: '09:00 – 11:00', start: '09:00', end: '11:00' },
  { label: '11:00 – 13:00', start: '11:00', end: '13:00' },
  { label: '14:00 – 16:00', start: '14:00', end: '16:00' },
  { label: '16:00 – 18:00', start: '16:00', end: '18:00' }
];

const BookResourcePage = () => {
  const { resourceId: paramResourceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState(paramResourceId || '');
  const [bookingDate, setBookingDate] = useState(
    searchParams.get('date') || getTodayDateString()
  );
  const [startTime, setStartTime] = useState(searchParams.get('start') || '10:00');
  const [endTime, setEndTime] = useState(searchParams.get('end') || '12:00');
  const [purpose, setPurpose] = useState('');

  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllResources = async () => {
      setLoadingResources(true);
      try {
        const res = await resourceAPI.getAll({ availability: 'true' });
        const list = res.data.data || [];
        setResources(list);
        if (!paramResourceId && list.length > 0 && !selectedResourceId) {
          setSelectedResourceId(list[0]._id);
        }
      } catch (err) {
        showError(err.response?.data?.message || 'Unable to load available resources.');
      } finally {
        setLoadingResources(false);
      }
    };
    fetchAllResources();
  }, [paramResourceId, showError]);

  const checkLiveAvailability = useCallback(async () => {
    if (!selectedResourceId || !bookingDate || !startTime || !endTime) {
      setAvailabilityStatus(null);
      return;
    }
    if (startTime >= endTime) {
      setAvailabilityStatus({
        invalidTime: true,
        message: 'End time must be later than start time.'
      });
      return;
    }
    try {
      const res = await resourceAPI.checkAvailability(selectedResourceId, {
        date: bookingDate,
        startTime,
        endTime
      });
      setAvailabilityStatus(res.data);
    } catch {
      setAvailabilityStatus(null);
    }
  }, [selectedResourceId, bookingDate, startTime, endTime]);

  useEffect(() => {
    checkLiveAvailability();
  }, [checkLiveAvailability]);

  const selectedResource = resources.find((r) => r._id === selectedResourceId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedResourceId) {
      setError('Please select a laboratory resource.');
      return;
    }
    if (!bookingDate || !startTime || !endTime || !purpose.trim()) {
      setError('Please fill in booking date, start time, end time, and purpose.');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be later than start time.');
      return;
    }

    setSubmitting(true);
    try {
      await bookingAPI.create({
        resourceId: selectedResourceId,
        bookingDate,
        startTime,
        endTime,
        purpose: purpose.trim()
      });
      showSuccess('Booking request submitted! Status is now Pending approval.');
      navigate('/my-bookings');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit booking request.';
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Book Laboratory Resource"
      subtitle="Reserve equipment or lab facilities with conflict-free time validation"
    >
      <div style={{ marginBottom: 16 }}>
        <Link to="/resources" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          Browse Catalog
        </Link>
      </div>

      {loadingResources ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Loading available resources...</p>
        </div>
      ) : (
        <div className="details-grid">
          <div className="panel" style={{ marginBottom: 0 }}>
            <div className="panel-header">
              <h3>Reservation Request Form</h3>
            </div>
            <div className="panel-body">
              {error && (
                <div className="alert alert-error">
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-resource">
                    Select Laboratory Resource
                  </label>
                  <select
                    id="book-resource"
                    className="form-control"
                    value={selectedResourceId}
                    onChange={(e) => {
                      setSelectedResourceId(e.target.value);
                      setError('');
                    }}
                    required
                  >
                    <option value="">-- Choose an available resource --</option>
                    {resources.map((res) => (
                      <option key={res._id} value={res._id}>
                        {res.resourceName} ({res.category}) — {res.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="book-date">
                    Booking Date
                  </label>
                  <input
                    id="book-date"
                    type="date"
                    className="form-control"
                    min={getTodayDateString()}
                    value={bookingDate}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      setError('');
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <span className="form-label" style={{ display: 'block', marginBottom: 8 }}>
                    Quick Time Presets
                  </span>
                  <div className="preset-chips">
                    {TIME_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="preset-chip"
                        onClick={() => {
                          setStartTime(preset.start);
                          setEndTime(preset.end);
                          setError('');
                        }}
                      >
                        <Clock size={12} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="book-start">
                      Start Time
                    </label>
                    <input
                      id="book-start"
                      type="time"
                      className="form-control"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        setError('');
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="book-end">
                      End Time
                    </label>
                    <input
                      id="book-end"
                      type="time"
                      className="form-control"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        setError('');
                      }}
                      required
                    />
                  </div>
                </div>

                {availabilityStatus && (
                  <div
                    className={`alert ${
                      availabilityStatus.invalidTime
                        ? 'alert-warning'
                        : availabilityStatus.isSlotAvailable
                        ? 'alert-success'
                        : 'alert-error'
                    }`}
                  >
                    {availabilityStatus.invalidTime ? (
                      <>
                        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                        <span>{availabilityStatus.message}</span>
                      </>
                    ) : availabilityStatus.isSlotAvailable ? (
                      <>
                        <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                        <span>
                          Slot is open on {formatDisplayDate(bookingDate)} ({startTime} –{' '}
                          {endTime}).
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                        <span>
                          {availabilityStatus.conflict
                            ? `Time conflict detected: Already booked from ${availabilityStatus.conflict.startTime} to ${availabilityStatus.conflict.endTime} (${availabilityStatus.conflict.status}).`
                            : 'This resource is currently unavailable.'}
                        </span>
                      </>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="book-purpose">
                    Purpose / Experiment Details
                  </label>
                  <textarea
                    id="book-purpose"
                    className="form-control"
                    placeholder="Briefly describe your coursework, lab experiment, or research requirement..."
                    value={purpose}
                    onChange={(e) => {
                      setPurpose(e.target.value);
                      setError('');
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-full"
                  disabled={
                    submitting ||
                    availabilityStatus?.invalidTime ||
                    availabilityStatus?.isSlotAvailable === false
                  }
                >
                  <CalendarPlus size={18} />
                  {submitting ? 'Submitting Booking...' : 'Confirm & Submit Booking'}
                </button>
              </form>
            </div>
          </div>

          {/* Selected Resource Summary & Existing Slots */}
          <div className="panel" style={{ marginBottom: 0 }}>
            <div className="panel-header">
              <h3>Selected Resource Summary</h3>
            </div>
            <div className="panel-body">
              {selectedResource ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 14
                    }}
                  >
                    <CategoryIcon category={selectedResource.category} size={24} />
                    <StatusBadge
                      status={
                        selectedResource.availability && selectedResource.quantity > 0
                          ? 'Available'
                          : 'Unavailable'
                      }
                    />
                  </div>
                  <span className="resource-category-tag">
                    {selectedResource.category}
                  </span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>
                    {selectedResource.resourceName}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      marginBottom: 14
                    }}
                  >
                    {selectedResource.description}
                  </p>

                  <div className="resource-meta" style={{ marginBottom: 18 }}>
                    <span className="resource-meta-item">
                      <MapPin size={14} color="#2563eb" />
                      {selectedResource.location}
                    </span>
                    <span className="resource-meta-item">
                      <Layers size={14} color="#2563eb" />
                      Quantity: <strong>{selectedResource.quantity}</strong>
                    </span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 8 }}>
                      Existing Bookings on {formatDisplayDate(bookingDate)}
                    </h4>
                    {availabilityStatus?.bookedSlots?.length > 0 ? (
                      <div className="slot-chip-list">
                        {availabilityStatus.bookedSlots.map((slot, i) => (
                          <div key={i} className="slot-chip">
                            <span style={{ fontWeight: 600 }}>
                              {slot.startTime} – {slot.endTime}
                            </span>
                            <StatusBadge status={slot.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        No bookings scheduled on this date yet — all slots are free.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>
                  Select a resource from the dropdown to view details and open time slots.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BookResourcePage;

