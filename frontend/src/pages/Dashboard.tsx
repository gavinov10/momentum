import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';
import type { Application } from '../services/api';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalApplications = applications.length;
  const activeApplications = applications.filter(app => 
    app.status && !["rejected", "withdrawn"].includes(app.status.toLowerCase())
  ).length;
  const appliedCount = applications.filter(app => 
    app.status?.toLowerCase() === "applied"
  ).length;
  const interviewedCount = applications.filter(app => 
    app.status?.toLowerCase() === "interview"
  ).length;
  const offersCount = applications.filter(app => 
    app.status?.toLowerCase() === "offer"
  ).length;
  const rejectionsCount = applications.filter(app => 
    app.status?.toLowerCase() === "rejected"
  ).length;

  // Get recent activity (sorted by last_activity or updated_at)
  const recentActivity = [...applications]
    .sort((a, b) => {
      const dateA = a.last_activity || a.updated_at || a.created_at || '';
      const dateB = b.last_activity || b.updated_at || b.created_at || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 5); // Get top 5 most recent

  // Calculate status breakdown for progress bars
  const statusCounts = {
    saved: applications.filter(app => app.status?.toLowerCase() === "saved").length,
    applied: appliedCount,
    oa: applications.filter(app => app.status?.toLowerCase() === "oa").length,
    interview: interviewedCount,
    offer: offersCount,
    rejected: rejectionsCount,
    withdrawn: applications.filter(app => app.status?.toLowerCase() === "withdrawn").length,
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || user?.email}! 🚀</h1>
        <p>Here's your job application overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Applications</h3>
          <p className="stat-number">{totalApplications}</p>
        </div>
        <div className="stat-card">
          <h3>Active Applications</h3>
          <p className="stat-number">{activeApplications}</p>
        </div>
        <div className="stat-card">
          <h3>Applied</h3>
          <p className="stat-number">{appliedCount}</p>
        </div>
        <div className="stat-card">
          <h3>Interviews</h3>
          <p className="stat-number">{interviewedCount}</p>
        </div>
        <div className="stat-card">
          <h3>Offers</h3>
          <p className="stat-number">{offersCount}</p>
        </div>
        <div className="stat-card">
          <h3>Rejections</h3>
          <p className="stat-number">{rejectionsCount}</p>
        </div>
      </div>

      {/* Status Breakdown with Progress Bars */}
      <div className="status-breakdown">
        <h2>Application Status Breakdown</h2>
        <div className="progress-bars">
          {Object.entries(statusCounts).map(([status, count]) => {
            const percentage = totalApplications > 0 
              ? (count / totalApplications) * 100 
              : 0;
            
            return (
              <div key={status} className="progress-item">
                <div className="progress-label">
                  <span className="status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  <span className="status-count">{count}</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className={`progress-bar progress-${status}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <Link to="/job-tracker" className="view-all-link">
            View All →
          </Link>
        </div>
        {recentActivity.length === 0 ? (
          <div className="empty-state">
            <p>No recent activity. Start tracking your applications!</p>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((app) => (
              <div key={app.id} className="activity-item">
                <div className="activity-content">
                  <h4>{app.company_name}</h4>
                  <p className="activity-role">{app.role}</p>
                  <span className={`status-badge status-${app.status?.toLowerCase()}`}>
                    {app.status}
                  </span>
                </div>
                <div className="activity-date">
                  {app.last_activity 
                    ? new Date(app.last_activity).toLocaleDateString()
                    : app.updated_at 
                    ? new Date(app.updated_at).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};