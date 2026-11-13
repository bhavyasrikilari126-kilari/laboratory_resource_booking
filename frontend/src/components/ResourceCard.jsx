import { Link } from 'react-router-dom';
import { MapPin, Layers, ArrowRight, CalendarPlus } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import StatusBadge from './StatusBadge';

const ResourceCard = ({ resource }) => {
  const isAvailable = Boolean(resource.availability && resource.quantity > 0);

  return (
    <div className="resource-card animate-fade-in">
      <div>
        <div className="resource-card-top">
          <CategoryIcon category={resource.category} size={24} />
          <StatusBadge status={isAvailable ? 'Available' : 'Unavailable'} />
        </div>

        <div style={{ marginTop: 14 }}>
          <span className="resource-category-tag">{resource.category}</span>
          <h3 className="resource-title">{resource.resourceName}</h3>
          <p className="resource-desc">{resource.description}</p>
        </div>
      </div>

      <div>
        <div className="resource-meta">
          <span className="resource-meta-item">
            <MapPin size={14} color="#2563eb" />
            {resource.location}
          </span>
          <span className="resource-meta-item">
            <Layers size={14} color="#2563eb" />
            Qty: <strong>{resource.quantity}</strong>
          </span>
        </div>

        <div className="resource-card-actions" style={{ marginTop: 14 }}>
          <Link to={`/resources/${resource._id}`} className="btn btn-secondary btn-sm">
            Details
            <ArrowRight size={15} />
          </Link>
          {isAvailable ? (
            <Link to={`/book/${resource._id}`} className="btn btn-primary btn-sm">
              <CalendarPlus size={15} />
              Book Now
            </Link>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm" disabled>
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;

