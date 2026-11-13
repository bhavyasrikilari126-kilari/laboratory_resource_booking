const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  let badgeClass = 'badge-cancelled';
  if (normalized === 'pending') badgeClass = 'badge-pending';
  else if (normalized === 'approved' || normalized === 'available') badgeClass = 'badge-approved';
  else if (normalized === 'rejected' || normalized === 'unavailable') badgeClass = 'badge-rejected';
  else if (normalized === 'completed') badgeClass = 'badge-completed';
  else if (normalized === 'admin') badgeClass = 'badge-role-admin';
  else if (normalized === 'faculty') badgeClass = 'badge-role-faculty';
  else if (normalized === 'student') badgeClass = 'badge-role-student';

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
};

export default StatusBadge;

