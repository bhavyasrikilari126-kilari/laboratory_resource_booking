import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEPARTMENTS } from '../utils/categories';

const RegisterPage = () => {
  const { register } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    department: DEPARTMENTS[0],
    customDepartment: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalDepartment =
      formData.department === 'Other'
        ? formData.customDepartment.trim()
        : formData.department;

    if (!formData.name.trim() || !formData.email.trim() || !finalDepartment) {
      setError('Please complete all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        department: finalDepartment,
        password: formData.password
      });
      showSuccess('Account created successfully! Welcome to LabReserve.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PublicNavbar />
      <div className="auth-wrapper">
        <div className="auth-container">
          <div className="auth-info-panel">
            <div>
              <h2>Create Your Campus Lab Account</h2>
              <p style={{ color: '#dbeafe', fontSize: '0.95rem' }}>
                Register as a student or faculty member to reserve laboratory workstations,
                electronic equipment, software licenses, and instruments.
              </p>

              <ul className="auth-info-list">
                <li>
                  <CheckCircle2 size={18} color="#93c5fd" />
                  Check real-time resource availability by date & time
                </li>
                <li>
                  <CheckCircle2 size={18} color="#93c5fd" />
                  Submit bookings with automatic conflict prevention
                </li>
                <li>
                  <CheckCircle2 size={18} color="#93c5fd" />
                  Track Pending, Approved & Completed status updates
                </li>
                <li>
                  <CheckCircle2 size={18} color="#93c5fd" />
                  Manage and cancel upcoming reservations effortlessly
                </li>
              </ul>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#bfdbfe' }}>
              Already registered?{' '}
              <Link
                to="/login"
                style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'underline' }}
              >
                Sign in here
              </Link>
            </div>
          </div>

          <div className="auth-form-panel">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>
              Student / Faculty Registration
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 22 }}>
              Fill in your academic details to get started.
            </p>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Aarav Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">
                    Academic Email
                  </label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="name@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-role">
                    Role
                  </label>
                  <select
                    id="reg-role"
                    name="role"
                    className="form-control"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-department">
                  Department
                </label>
                <select
                  id="reg-department"
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="Other">Other Department</option>
                </select>
              </div>

              {formData.department === 'Other' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-custom-dept">
                    Specify Department
                  </label>
                  <input
                    id="reg-custom-dept"
                    name="customDepartment"
                    type="text"
                    className="form-control"
                    placeholder="Enter department name"
                    value={formData.customDepartment}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">
                    Password
                  </label>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-confirm">
                    Confirm Password
                  </label>
                  <input
                    id="reg-confirm"
                    name="confirmPassword"
                    type="password"
                    className="form-control"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={submitting}
              >
                <UserPlus size={18} />
                {submitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

