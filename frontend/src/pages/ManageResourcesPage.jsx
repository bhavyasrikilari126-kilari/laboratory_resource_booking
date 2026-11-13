import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Boxes
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import CategoryIcon from '../components/CategoryIcon';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { resourceAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { RESOURCE_CATEGORIES } from '../utils/categories';

const EMPTY_FORM = {
  resourceName: '',
  category: RESOURCE_CATEGORIES[0],
  description: '',
  quantity: 1,
  location: '',
  availability: true
};

const ManageResourcesPage = () => {
  const { showSuccess, showError } = useToast();

  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await resourceAPI.getAll();
      setResources(res.data.data || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const openAddModal = () => {
    setEditingResource(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (res) => {
    setEditingResource(res);
    setFormData({
      resourceName: res.resourceName,
      category: res.category,
      description: res.description,
      quantity: res.quantity,
      location: res.location,
      availability: res.availability
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.resourceName.trim() || !formData.description.trim() || !formData.location.trim()) {
      showError('Please fill in all required resource fields.');
      return;
    }

    setSaving(true);
    try {
      if (editingResource) {
        await resourceAPI.update(editingResource._id, {
          ...formData,
          quantity: Number(formData.quantity)
        });
        showSuccess('Laboratory resource updated successfully.');
      } else {
        await resourceAPI.create({
          ...formData,
          quantity: Number(formData.quantity)
        });
        showSuccess('New laboratory resource added successfully.');
      }
      setModalOpen(false);
      loadResources();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save resource.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (res) => {
    try {
      await resourceAPI.update(res._id, { availability: !res.availability });
      showSuccess(
        `${res.resourceName} marked as ${!res.availability ? 'Available' : 'Unavailable'}.`
      );
      loadResources();
    } catch (err) {
      showError(err.response?.data?.message || 'Unable to update availability.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await resourceAPI.remove(deleteTarget._id);
      showSuccess('Resource deleted successfully.');
      setDeleteTarget(null);
      loadResources();
    } catch (err) {
      showError(err.response?.data?.message || 'Unable to delete resource.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = resources.filter((r) => {
    const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
    const isAvail = r.availability && r.quantity > 0;
    const matchesAvail =
      availabilityFilter === 'All' ||
      (availabilityFilter === 'available' && isAvail) ||
      (availabilityFilter === 'unavailable' && !isAvail);
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.resourceName.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);
    return matchesCat && matchesAvail && matchesSearch;
  });

  return (
    <DashboardLayout
      title="Manage Resources"
      subtitle="Add new equipment, edit resource details, toggle availability, or delete items"
      actions={
        <button type="button" className="btn btn-primary btn-sm" onClick={openAddModal}>
          <Plus size={16} />
          Add Resource
        </button>
      }
    >
      <div className="filter-bar">
        <div className="filter-controls-row">
          <div className="search-input-wrap">
            <Search size={18} className="search-input-icon" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search resources by name, category, or lab location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

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

          <select
            className="form-control filter-select"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Loading laboratory resources...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Boxes size={26} />
          </div>
          <h4>No Matching Resources</h4>
          <p>Add a new laboratory resource or adjust your filter selection.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={openAddModal}>
            <Plus size={16} /> Add New Resource
          </button>
        </div>
      ) : (
        <div className="panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Quantity</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((res) => {
                  const isAvail = res.availability && res.quantity > 0;
                  return (
                    <tr key={res._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <CategoryIcon category={res.category} size={19} />
                          <div>
                            <div style={{ fontWeight: 700 }}>{res.resourceName}</div>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--text-muted)',
                                maxWidth: 320,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {res.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{res.category}</td>
                      <td>{res.location}</td>
                      <td>
                        <strong>{res.quantity}</strong>
                      </td>
                      <td>
                        <StatusBadge status={isAvail ? 'Available' : 'Unavailable'} />
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="Toggle Availability"
                            onClick={() => handleToggleAvailability(res)}
                          >
                            {res.availability ? (
                              <ToggleRight size={15} color="#16a34a" />
                            ) : (
                              <ToggleLeft size={15} color="#64748b" />
                            )}
                            {res.availability ? 'Set Offline' : 'Set Online'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-soft btn-sm"
                            onClick={() => openEditModal(res)}
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => setDeleteTarget(res)}
                          >
                            <Trash2 size={14} />
                            Delete
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

      {/* Add / Edit Resource Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingResource ? 'Edit Laboratory Resource' : 'Add New Laboratory Resource'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="res-name">
              Resource Name
            </label>
            <input
              id="res-name"
              type="text"
              className="form-control"
              placeholder="e.g. Keysight 4-Channel Oscilloscope"
              value={formData.resourceName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, resourceName: e.target.value }))
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="res-category">
                Category
              </label>
              <select
                id="res-category"
                className="form-control"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                {RESOURCE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="res-quantity">
                Quantity
              </label>
              <input
                id="res-quantity"
                type="number"
                min="0"
                className="form-control"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="res-location">
              Location / Lab Room
            </label>
            <input
              id="res-location"
              type="text"
              className="form-control"
              placeholder="e.g. Electronics Block - Lab EC-301"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="res-description">
              Description
            </label>
            <textarea
              id="res-description"
              className="form-control"
              placeholder="Technical specifications, model, and usage requirements..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(formData.availability)}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, availability: e.target.checked }))
                }
              />
              Resource is currently Available for booking
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingResource
                ? 'Save Changes'
                : 'Add Resource'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Resource"
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
              {deleting ? 'Deleting...' : 'Delete Resource'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to permanently delete{' '}
          <strong>{deleteTarget?.resourceName}</strong>? Any pending booking requests for
          this item will be automatically cancelled.
        </p>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageResourcesPage;

