import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, CalendarPlus, Boxes } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import PublicNavbar from '../components/PublicNavbar';
import ResourceCard from '../components/ResourceCard';
import CategoryIcon from '../components/CategoryIcon';
import { resourceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RESOURCE_CATEGORIES } from '../utils/categories';

const ResourcesPage = () => {
  const { isAuthenticated } = useAuth();
  const { showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || 'All';

  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (availabilityFilter !== 'All') params.availability = availabilityFilter;
      if (search.trim()) params.search = search.trim();
      if (sort !== 'newest') params.sort = sort;

      const res = await resourceAPI.getAll(params);
      setResources(res.data.data || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load laboratory resources.');
    } finally {
      setLoading(false);
    }
  }, [category, availabilityFilter, search, sort, showError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 180);
    return () => clearTimeout(timer);
  }, [fetchResources]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const pageContent = (
    <>
      <div className="page-header">
        <div>
          <h1>Laboratory Resources Catalog</h1>
          <p>
            Search and filter available equipment, software tools, and lab instruments
            across campus.
          </p>
        </div>
        {isAuthenticated ? (
          <Link to="/book" className="btn btn-primary">
            <CalendarPlus size={18} />
            Book a Resource
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Sign In to Book
          </Link>
        )}
      </div>

      <div className="filter-bar">
        <div className="filter-controls-row">
          <div className="search-input-wrap">
            <Search size={18} className="search-input-icon" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search by resource name, description, or lab location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control filter-select"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            aria-label="Filter by availability"
          >
            <option value="All">All Availability</option>
            <option value="true">Available Only</option>
            <option value="false">Unavailable Only</option>
          </select>

          <select
            className="form-control filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort resources"
          >
            <option value="newest">Recently Added</option>
            <option value="name_asc">Name (A – Z)</option>
            <option value="name_desc">Name (Z – A)</option>
            <option value="quantity_desc">Highest Quantity</option>
          </select>
        </div>

        <div className="category-pills">
          <button
            type="button"
            className={`category-pill ${category === 'All' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('All')}
          >
            <SlidersHorizontal size={14} />
            All ({RESOURCE_CATEGORIES.length})
          </button>
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              <CategoryIcon category={cat} size={14} withBox={false} />
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Loading laboratory resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Boxes size={26} />
          </div>
          <h4>No Laboratory Resources Found</h4>
          <p>
            No resources match your current search or filter criteria. Try resetting the
            filters.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch('');
              setAvailabilityFilter('All');
              handleCategoryChange('All');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              marginBottom: 14,
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              fontWeight: 500
            }}
          >
            Showing <strong>{resources.length}</strong> laboratory resource
            {resources.length === 1 ? '' : 's'}
          </div>
          <div className="resources-grid">
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        </>
      )}
    </>
  );

  if (isAuthenticated) {
    return (
      <DashboardLayout
        title="Resources"
        subtitle="Browse all campus laboratory facilities and equipment"
      >
        {pageContent}
      </DashboardLayout>
    );
  }

  return (
    <div>
      <PublicNavbar />
      <div className="public-page-container">{pageContent}</div>
    </div>
  );
};

export default ResourcesPage;

