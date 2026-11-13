import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Users,
  GraduationCap,
  ShieldCheck,
  Pencil,
  Trash2,
  UserCheck
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEPARTMENTS } from '../utils/categories';

const ManageUsersPage = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'student', department: '' });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data.data || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load registered users.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({
      name: u.name,
      role: u.role,
      department: u.department
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    try {
      await userAPI.update(editTarget._id, editForm);
      showSuccess('User profile updated successfully.');
      setEditTarget(null);
      loadUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userAPI.remove(deleteTarget._id);
      showSuccess('User removed successfully.');
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Unable to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const studentCount = users.filter((u) => u.role === 'student').length;
  const facultyCount = users.filter((u) => u.role === 'faculty').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <DashboardLayout
      title="Manage Users"
      subtitle="View registered students, faculty members, and administrator accounts"
    >
      <div className="stats-grid">
        <StatCard
          label="Total Users"
          value={users.length}
          subtext="Active campus accounts"
          icon={Users}
          variant="blue"
        />
        <StatCard
          label="Students"
          value={studentCount}
          subtext="Student lab accounts"
          icon={GraduationCap}
          variant="sky"
        />
        <StatCard
          label="Faculty Members"
          value={facultyCount}
          subtext="Academic staff accounts"
          icon={UserCheck}
          variant="green"
        />
        <StatCard
          label="Administrators"
          value={adminCount}
          subtext="System & lab coordinators"
          icon={ShieldCheck}
          variant="amber"
        />
      </div>

      <div className="filter-bar">
        <div className="filter-controls-row">
          <div className="search-input-wrap">
            <Search size={18} className="search-input-icon" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search users by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Loading registered users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={26} />
          </div>
          <h4>No Users Found</h4>
          <p>No registered accounts match your search criteria.</p>
        </div>
      ) : (
        <div className="panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name & Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Total Bookings</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelf = u._id === currentUser?._id;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>
                          {u.name}{' '}
                          {isSelf && (
                            <span
                              style={{
                                fontSize: '0.74rem',
                                color: 'var(--primary)',
                                fontWeight: 600
                              }}
                            >
                              (You)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {u.email}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={u.role} />
                      </td>
                      <td>{u.department}</td>
                      <td>
                        <strong>{u.totalBookings ?? 0}</strong>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn btn-soft btn-sm"
                            onClick={() => openEdit(u)}
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger-outline btn-sm"
                            disabled={isSelf}
                            title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                            onClick={() => setDeleteTarget(u)}
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title="Edit User Account"
      >
        <form onSubmit={handleSaveUser}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-user-name">
              Full Name
            </label>
            <input
              id="edit-user-name"
              type="text"
              className="form-control"
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-user-role">
              Role
            </label>
            <select
              id="edit-user-role"
              className="form-control"
              value={editForm.role}
              onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
              disabled={editTarget?._id === currentUser?._id}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-user-dept">
              Department
            </label>
            <input
              id="edit-user-dept"
              type="text"
              list="dept-options"
              className="form-control"
              value={editForm.department}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, department: e.target.value }))
              }
              required
            />
            <datalist id="dept-options">
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Remove User Account"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Removing...' : 'Confirm Remove'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to remove <strong>{deleteTarget?.name}</strong> (
          {deleteTarget?.email})? Any active bookings belonging to this user will be
          cancelled.
        </p>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageUsersPage;

