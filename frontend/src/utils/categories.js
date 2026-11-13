export const RESOURCE_CATEGORIES = [
  'Computer Systems',
  'Projectors',
  'Electronic Equipment',
  'Networking Devices',
  'Laboratory Instruments',
  'Software Resources',
  'Other Equipment'
];

export const BOOKING_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'Cancelled',
  'Completed'
];

export const CATEGORY_DETAILS = {
  'Computer Systems': {
    shortDesc: 'GPU workstations, CAD terminals & high-compute desktops',
    bg: '#eff6ff',
    color: '#2563eb'
  },
  Projectors: {
    shortDesc: '4K laser seminar projectors & interactive display rigs',
    bg: '#e0f2fe',
    color: '#0284c7'
  },
  'Electronic Equipment': {
    shortDesc: 'Oscilloscopes, power supplies & soldering workbenches',
    bg: '#eef2ff',
    color: '#4f46e5'
  },
  'Networking Devices': {
    shortDesc: 'Enterprise routing racks, switches & RF analyzers',
    bg: '#ecfeff',
    color: '#0891b2'
  },
  'Laboratory Instruments': {
    shortDesc: 'Digital microscopes, spectrophotometers & precision sensors',
    bg: '#f0f9ff',
    color: '#0369a1'
  },
  'Software Resources': {
    shortDesc: 'MATLAB, Simulink, ANSYS & engineering floating seats',
    bg: '#eff6ff',
    color: '#1d4ed8'
  },
  'Other Equipment': {
    shortDesc: '3D printers, robotics rigs & specialized prototyping tools',
    bg: '#f1f5f9',
    color: '#334155'
  }
};

export const getTodayDateString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return dt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Information Technology',
  'Physics & Applied Sciences',
  'Chemistry & Bio-Sciences',
  'Civil Engineering',
  'Central Laboratory Administration'
];

