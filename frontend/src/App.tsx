import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import type { Application } from './services/api'
import './App.css';

function App() {
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

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Momentum - Job Application Tracker</h1>
        <p> Track your job application and never miss an opportunity</p>
      </header>

      <main className="app-main">
        <div className="stats">
          <div className="stat-card">
            <h3>Total Applications</h3>
            <p className="stat-number">{applications.length}</p>
          </div>
          <div className="stat-card">
            <h3>Active Applications</h3>
            <p className="stat-number">
              {applications.filter(app => !["REJECTED", "WITHDRAWN"].includes(app.status)).length}
            </p>
          </div>
        </div>

        <div className="applications-section">
          <h2>Your Applications</h2>
          {applications.length === 0 ? (
            <div className="empty-state">
              <p>No Applications yet. Add your first job application!</p>
            </div>
          ) : (
            <div className="applications-grid">
              {applications.map((app) => (
                <div key={app.id} className="application-card">
                  <h3>{app.company_name}</h3>
                  <p className="role">{app.role}</p>
                  <span className={`status status-${app.status?.toLowerCase()}`}>
                    {app.status}
                  </span>
                  {app.notes && <p className="notes">{app.notes}</p>}
                </div>      
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;