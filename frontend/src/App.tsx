import { useState, useEffect } from 'react';
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
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);

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

  const handleApplicationCreated = (application: Application) => {
    if (editingApplication) {
      // Update existing application in the list
      setApplications(applications.map(app => 
        app.id === application.id ? application : app
      ));
      setEditingApplication(null);
    } else {
      // Add new application to the list
      setApplications([...applications, application]);
    }
    setShowForm(false);
  };

  const handleEdit = (application: Application) => {
    setEditingApplication(application);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      await api.deleteApplication(id);
      // Remove from list
      setApplications(applications.filter(app => app.id !== id));
    } catch (error) {
      console.error("Failed to delete application:", error);
      alert(error instanceof Error ? error.message : 'Failed to delete application');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingApplication(null);
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
              onClick={() => {
                setEditingApplication(null);
                setShowForm(!showForm);
              }} 
              className="add-button"
            >
              {showForm ? 'Cancel' : '+ Add Application'}
            </button>
          </div>

          {showForm && (
            <div className="form-container">
              <ApplicationForm 
                application={editingApplication || undefined}
                onSuccess={handleApplicationCreated}
                onCancel={handleCancelForm}
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
                  <div className="card-header">
                    <h3>{app.company_name}</h3>
                    <div className="card-actions">
                      <button 
                        onClick={() => handleEdit(app)}
                        className="edit-button"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(app.id)}
                        className="delete-button"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
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