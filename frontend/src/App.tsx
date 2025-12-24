import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { useAuthStore } from './stores/authStore';
import { Login } from './components/Login';
import { ApplicationForm } from './components/ApplicationForm';
import type { Application } from './services/api';
import './App.css';

function App() {
  const { isAuthenticated, user, loadUser, token } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Load user data on mount if token exists
  useEffect(() => {
    if (token) {
      loadUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, loadUser]);

  // Load applications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
    }
  }, [isAuthenticated]);

  const loadApplications = async () => {
    setAppLoading(true);
    try {
      const data = await api.getApplications();
      setApplications(data);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setAppLoading(false);
    }
  };

  const handleApplicationCreated = (newApplication: Application) => {
    // Add new application to the list
    setApplications([...applications, newApplication]);
    setShowForm(false);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }
    return <Login />;
  }

  // Show main app if authenticated
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🚀 Momentum - Job Application Tracker</h1>
            <p>Track your job applications and never miss an opportunity</p>
          </div>
          <div className="user-info">
            <span>Welcome, {user?.name || user?.email}!</span>
            <button onClick={() => useAuthStore.getState().logout()} className="logout-button">
              Logout
            </button>
          </div>
        </div>
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
              {applications.filter(app => 
                app.status && !["rejected", "withdrawn"].includes(app.status.toLowerCase())
              ).length}
            </p>
          </div>
        </div>

        <div className="applications-section">
          <div className="section-header">
            <h2>Your Applications</h2>
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="add-button"
            >
              {showForm ? 'Cancel' : '+ Add Application'}
            </button>
          </div>

          {showForm && (
            <div className="form-container">
              <ApplicationForm 
                onSuccess={handleApplicationCreated}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {appLoading ? (
            <div className="loading">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <p>No applications yet. Add your first job application!</p>
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