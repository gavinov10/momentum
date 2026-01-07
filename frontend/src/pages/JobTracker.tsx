import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ApplicationForm } from '../components/ApplicationForm';
import type { Application } from '../services/api';

type ViewMode = 'list' | 'grid';

// Available column options and their mappings to backend statuses
const KANBAN_COLUMN_OPTIONS = {
  applied: { label: 'Applied', backendStatus: 'applied' },
  screen: { label: 'Screen', backendStatus: 'oa' },
  interviewing: { label: 'Interviewing', backendStatus: 'interview' },
  offer: { label: 'Offer', backendStatus: 'offer' },
  withdrawn: { label: 'Withdrawn', backendStatus: 'withdrawn' },
  rejected: { label: 'Rejected', backendStatus: 'rejected' },
  accepted: { label: 'Accepted', backendStatus: 'accepted' }, // Note: may need backend support
};

type KanbanColumn = keyof typeof KANBAN_COLUMN_OPTIONS;

export const JobTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  
  // Load selected columns from localStorage or use defaults
  const [selectedColumns, setSelectedColumns] = useState<KanbanColumn[]>(() => {
    const saved = localStorage.getItem('kanban-columns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate that all selected columns are valid
        return parsed.filter((col: string) => col in KANBAN_COLUMN_OPTIONS);
      } catch {
        // If parsing fails, use defaults
      }
    }
    // Default columns
    return ['applied', 'screen', 'interviewing', 'offer', 'rejected'];
  });

  // Load applications on mount
  useEffect(() => {
    loadApplications();
  }, []);

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

  // Save selected columns to localStorage
  const handleColumnToggle = (column: KanbanColumn) => {
    const newColumns = selectedColumns.includes(column)
      ? selectedColumns.filter(col => col !== column)
      : [...selectedColumns, column];
    
    setSelectedColumns(newColumns);
    localStorage.setItem('kanban-columns', JSON.stringify(newColumns));
  };

  // Reset to default columns
  const handleResetColumns = () => {
    const defaults: KanbanColumn[] = ['applied', 'screen', 'interviewing', 'offer', 'rejected'];
    setSelectedColumns(defaults);
    localStorage.setItem('kanban-columns', JSON.stringify(defaults));
  };

  return (
    <div className="job-tracker">
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
          <div className="header-actions">
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('list')}
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                title="List View"
              >
                ☰ List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                title="Kanban View"
              >
                ⊞ Kanban
              </button>
            </div>
            {viewMode === 'grid' && (
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="settings-button"
                title="Column Settings"
              >
                ⚙️ Columns
              </button>
            )}
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
        </div>

        {/* Column Settings Panel */}
        {viewMode === 'grid' && showColumnSettings && (
          <div className="column-settings-panel">
            <div className="settings-header">
              <h3>Select Kanban Columns</h3>
              <button 
                onClick={() => setShowColumnSettings(false)}
                className="close-settings"
              >
                ×
              </button>
            </div>
            <div className="column-checkboxes">
              {Object.entries(KANBAN_COLUMN_OPTIONS).map(([key, option]) => (
                <label key={key} className="column-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key as KanbanColumn)}
                    onChange={() => handleColumnToggle(key as KanbanColumn)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <div className="settings-actions">
              <button onClick={handleResetColumns} className="reset-button">
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
        

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
        ) : viewMode === 'list' ? (
            // Table List View
            <div className="table-container">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Application Link</th>
                    <th>Role</th>
                    <th>Recruiter</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th>Important Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="table-row">
                      <td className="company-cell">
                        <strong>{app.company_name}</strong>
                      </td>
                      <td className="location-cell">
                        {app.location || 'N/A'}
                      </td>
                      <td className="link-cell">
                        {app.job_url ? (
                          <a 
                            href={app.job_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="job-link"
                          >
                            View Job
                          </a>
                        ) : (
                          <span className="no-link">No link</span>
                        )}
                      </td>
                      <td className="role-cell">{app.role}</td>
                      <td className="recruiter-cell">
                        {app.recruiter || 'N/A'}
                      </td>
                      <td className="date-cell">
                        {app.date_applied 
                          ? new Date(app.date_applied).toLocaleDateString()
                          : 'Not set'}
                      </td>
                      <td className="status-cell">
                        <span className={`status status-${app.status?.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="notes-cell">
                        {app.notes ? (
                          <span className="notes-preview" title={app.notes}>
                            {app.notes.length > 50 
                              ? `${app.notes.substring(0, 50)}...` 
                              : app.notes}
                          </span>
                        ) : (
                          <span className="no-notes">-</span>
                        )}
                      </td>
                      <td className="actions-cell">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        ) : (
            // Kanban Board View
            <div className="kanban-board">
              {selectedColumns.map((columnKey) => {
                const option = KANBAN_COLUMN_OPTIONS[columnKey];
                const backendStatus = option.backendStatus;
                
                // Filter applications by the backend status
                const statusApplications = applications.filter(
                  app => app.status?.toLowerCase() === backendStatus
                );
          
                return (
                  <div key={columnKey} className="kanban-column">
                    <div className="kanban-column-header">
                      <h3>{option.label}</h3>
                      <span className="column-count">{statusApplications.length}</span>
                    </div>
                    <div className="kanban-column-content">
                      {statusApplications.length === 0 ? (
                        <div className="empty-column">
                          <p>No applications</p>
                        </div>
                      ) : (
                        statusApplications.map((app) => (
                          <div key={app.id} className="kanban-card">
                            <div className="card-header">
                              <h4>{app.company_name}</h4>
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
                            {app.location && (
                              <p className="location">📍 {app.location}</p>
                            )}
                            {app.recruiter && (
                              <p className="recruiter">👤 {app.recruiter}</p>
                            )}
                            {app.date_applied && (
                              <p className="date">📅 {new Date(app.date_applied).toLocaleDateString()}</p>
                            )}
                            {app.notes && (
                              <p className="notes">{app.notes}</p>
                            )}
                            {app.job_url && (
                              <a 
                                href={app.job_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="job-link"
                              >
                                View Job →
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
};