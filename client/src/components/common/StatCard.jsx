import { Boxes } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, unit, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        <small>{unit}</small>
      </div>
      <div className="stat-foot">
        <span className="stat-indicator" /> Data tercatat
      </div>
    </div>
  );
}
