import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarPlus,
  MapPin,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import PublicNavbar from '../components/PublicNavbar';
import CategoryIcon from '../components/CategoryIcon';
import StatusBadge from '../components/StatusBadge';
import { resourceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getTodayDateString, formatDisplayDate } from '../utils/categories';

const ResourceDetailsPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { showError } = useToast();

  const [resource, setResource] = useState(null);
  const [upcomingSlots, setUpcomingSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [checkDate, setCheckDate] = useState(getTodayDateString());
  const [checkStart, setCheckStart] = useState('10:00');
  const [checkEnd, setCheckEnd] = useState('12:00');
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [checkingSlot, setCheckingSlot] = useState(false);

  const loadResource = useCallback(async () => {
    setLoading(true);
    try {
      const res = await resourceAPI.getById(id);
      setResource(res.data.data);
      setUpcomingSlots(res.data.upcomingSlots || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load resource details.');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  const handleCheckAvailability = useCallback(async () => {
    if (!id || !checkDate) return;
    setCheckingSlot(true);
    try {
      const params = { date: checkDate };
      if (checkStart && checkEnd && checkStart < checkEnd) {
        params.startTime = checkStart;
        params.endTime = checkEnd;
      }
      const res = await resourceAPI.checkAvailability(id, params);
      setAvailabilityResult(res.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Unable to check availability.');
    } finally {
      setCheckingSlot(false);
    }
  }, [id, checkDate, checkStart, checkEnd, showError]);

  useEffect(() => {
    loadResource();
  }, [loadResource]);

  useEffect(() => {
    if (resource) {
      handleCheckAvailability();
    }
  }, [resource, handleCheckAvailability]);

  const isAvailable = Boolean(resource?.availability && resource?.quantity > 0);

  const content = loading ? (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p>Loading resource specifications...</p>
    </div>
  ) : !resource ? (
    <div className="empty-state">
      <h4>Resource Not Found</h4>
      <p>This laboratory resource may have been removed or the link is invalid.</p>
      <Link to="/resources" className="btn btn-primary btn-sm">
        Back to Resources
      </Link>
    </div>
  ) : (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 18 }}>
        <Link to="/resources" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          Back to Resources
        </Link>
      </div>

      <div className="details-grid">
        {/* Main Resource Details Card */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-body">
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <CategoryIcon category={resource.category} size={28} />
                <div>
                  <span className="resource-category-tag">{resource.category}</span>
                  <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                    {resource.resourceName}
                  </h1>
                </div>
              </div>
              <StatusBadge status={isAvailable ? 'Available' : 'Unavailable'} />
            </div>

            <div className="detail-spec-grid">
              <div className="detail-spec-box">
                <span>Location / Laboratory</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} color="#2563eb" />
                  {resource.location}
                </strong>
              </div>
              <div className="detail-spec-box">
                <span>Available Units</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={16} color="#2563eb" />
                  {resource.quantity} Unit{resource.quantity === 1 ? '' : 's'}
                </strong>
              </div>
              <div className="detail-spec-box">
                <span>Operational Status</span>
                <strong>{isAvailable ? 'Ready for Booking' : 'Maintenance / Offline'}</strong>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: 8 }}>
                Technical Description & Usage Notes
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
                {resource.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {isAvailable ? (
                <Link
                  to={`/book/${resource._id}?date=${checkDate}&start=${checkStart}&end=${checkEnd}`}
                  className="btn btn-primary btn-lg"
                >
                  <CalendarPlus size={18} />
                  Book This Resource
                </Link>
              ) : (
                <button type="button" className="btn btn-secondary btn-lg" disabled>
                  Currently Unavailable for Booking
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Availability Checker Card */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color="#2563eb" />
              <h3>Check Slot Availability</h3>
            </div>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="form-label" htmlFor="avail-date">
                Select Date
              </label>
              <input
                id="avail-date"
                type="date"
                className="form-control"
                min={getTodayDateString()}
                value={checkDate}
                onChange={(e) => setCheckDate(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="avail-start">
                  Start Time
                </label>
                <input
                  id="avail-start"
                  type="time"
                  className="form-control"
                  value={checkStart}
                  onChange={(e) => setCheckStart(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="avail-end">
                  End Time
                </label>
                <input
                  id="avail-end"
                  type="time"
                  className="form-control"
                  value={checkEnd}
                  onChange={(e) => setCheckEnd(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-soft btn-full"
              onClick={handleCheckAvailability}
              disabled={checkingSlot}
              style={{ marginBottom: 16 }}
            >
              <Clock size={16} />
              {checkingSlot ? 'Checking...' : 'Check Availability'}
            </button>

            {availabilityResult && (
              <>
                {checkStart >= checkEnd ? (
                  <div className="alert alert-warning">
                    <AlertTriangle size={18} />
                    <span>End time must be later than start time.</span>
                  </div>
                ) : availabilityResult.isSlotAvailable ? (
                  <div className="alert alert-success">
                    <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Slot Available!</strong> {formatDisplayDate(checkDate)} from{' '}
                      {checkStart} to {checkEnd} is open for reservation.
                    </span>
                  </div>
                ) : (
                  <div className="alert alert-error">
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>
                      {availabilityResult.conflict
                        ? `Conflict: Booked from ${availabilityResult.conflict.startTime} to ${availabilityResult.conflict.endTime} (${availabilityResult.conflict.status}).`
                        : 'This resource is currently unavailable for booking.'}
                    </span>
                  </div>
                )}

                <div style={{ marginTop: 14 }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, marginBottom: 6 }}>
                    Booked Slots on {formatDisplayDate(checkDate)}
                  </h4>
                  {availabilityResult.bookedSlots?.length === 0 ? (
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      No reservations scheduled for this date yet.
                    </p>
                  ) : (
                    <div className="slot-chip-list">
                      {availabilityResult.bookedSlots.map((slot, idx) => (
                        <div key={idx} className="slot-chip">
                          <span style={{ fontWeight: 600 }}>
                            {slot.startTime} – {slot.endTime}
                          </span>
                          <StatusBadge status={slot.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {upcomingSlots.length > 0 && (
              <div
                style={{
                  marginTop: 22,
                  paddingTop: 16,
                  borderTop: '1px solid var(--border-color)'
                }}
              >
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, marginBottom: 8 }}>
                  Upcoming Scheduled Bookings
                </h4>
                <div className="slot-chip-list">
                  {upcomingSlots.slice(0, 5).map((slot, i) => (
                    <div key={i} className="slot-chip">
                      <span>
                        <strong>{formatDisplayDate(slot.bookingDate)}</strong> · {slot.startTime} –{' '}
                        {slot.endTime}
                      </span>
                      <StatusBadge status={slot.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isAuthenticated) {
    return (
      <DashboardLayout
        title="Resource Details"
        subtitle="Equipment specifications and real-time slot availability"
      >
        {content}
      </DashboardLayout>
    );
  }

  return (
    <div>
      <PublicNavbar />
      <div className="public-page-container">{content}</div>
    </div>
  );
};

export default ResourceDetailsPage;

