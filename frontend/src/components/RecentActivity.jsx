import { useContext, useState } from "react";
import { ActivityContext } from "../context/ActivityContext";

function RecentActivity() {
  const { activities } = useContext(ActivityContext);
  const [showAll, setShowAll] = useState(false);

  const displayedActivities = showAll ? activities : activities.slice(0, 5);

  return (
    <div className="dashboard-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Recent Activity</h3>
        {activities.length > 5 && (
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowAll(!showAll)}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', borderRadius: '4px' }}
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>
      {activities.length === 0 ? (
        <p className="empty-state">No recent activity.</p>
      ) : (
        <ul className="activity-list">
          {displayedActivities.map((activity) => (
            <li key={activity.id} className="activity-item">
              <p className="activity-text">{activity.text}</p>
              <span className="activity-time">{activity.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentActivity;
