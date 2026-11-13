const StatCard = ({ label, value, subtext, icon: Icon, variant = 'blue' }) => {
  return (
    <div className="stat-card animate-fade-in">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtext && <div className="stat-sub">{subtext}</div>}
      </div>
      {Icon && (
        <div className={`stat-icon-box stat-icon-${variant}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default StatCard;

