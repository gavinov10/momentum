import { useState, useEffect, useRef, type DragEvent, type MouseEvent } from "react";
import { api } from "../services/api";
import { ApplicationForm } from "../components/ApplicationForm";
import { ApplicationDetailModal } from "../components/ApplicationDetailModal";
import type { Application, CreateApplication } from "../services/api";
import { useAuthStore } from "../stores/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type ViewMode = "list" | "grid";
type ApplicationScope = "active" | "archived";

function getTimeAgo(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return "";
  const sec = Math.floor((Date.now() - then) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

// Available column options and their mappings to backend statuses
const KANBAN_COLUMN_OPTIONS = {
  applied: { label: "APPLIED", backendStatus: "applied" },
  screen: { label: "SCREEN", backendStatus: "oa" },
  interviewing: { label: "INTERVIEWING", backendStatus: "interview" },
  offer: { label: "OFFER", backendStatus: "offer" },
  withdrawn: { label: "WITHDRAWN", backendStatus: "withdrawn" },
  rejected: { label: "REJECTED", backendStatus: "rejected" },
  accepted: { label: "ACCEPTED", backendStatus: "accepted" },
};

type KanbanColumn = keyof typeof KANBAN_COLUMN_OPTIONS;

function findColumnKeyForStatus(
  status: string | undefined,
): KanbanColumn | null {
  if (!status) return null;
  const lowered = status.toLowerCase();
  const entries = Object.entries(KANBAN_COLUMN_OPTIONS) as [
    KanbanColumn,
    (typeof KANBAN_COLUMN_OPTIONS)[KanbanColumn],
  ][];
  const found = entries.find(([, meta]) => meta.backendStatus === lowered);
  return found ? found[0] : null;
}

export const JobTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  /** HTML5 Kanban drag: dragged application ID; column receiving hover; suppress card click after drag */
  const [draggingApplicationId, setDraggingApplicationId] = useState<number | null>(null);
  const [dragOverColumnKey, setDragOverColumnKey] =
    useState<KanbanColumn | null>(null);
  const suppressKanbanCardClickRef = useRef(false);
  const kanbanDraggingIdRef = useRef<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [applicationScope, setApplicationScope] =
    useState<ApplicationScope>("active");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Load selected columns from localStorage or use defaults
  const [selectedColumns, setSelectedColumns] = useState<KanbanColumn[]>(() => {
    const saved = localStorage.getItem("kanban-columns");
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
    return ["applied", "screen", "interviewing", "offer", "rejected"];
  });

  const tokenFromAuth = useAuthStore((s) => s.token);

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

  // Fetch last Gmail sync time whenever we have an access token (incl. post-hydration)
  useEffect(() => {
    const access = tokenFromAuth ?? localStorage.getItem("access_token");
    if (!access) return;

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/gmail/last-sync`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        const data: { last_synced?: string | null } = await response.json();
        console.log("[gmail/last-sync] response body:", data);

        if (cancelled) return;
        if (!response.ok) {
          console.warn(
            "[gmail/last-sync] request failed",
            response.status,
            data,
          );
          return;
        }

        const iso = data.last_synced;
        if (typeof iso === "string" && iso.length > 0) {
          setLastSynced(iso);
        }
      } catch (err) {
        console.warn("[gmail/last-sync] fetch error", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokenFromAuth]);

  const handleApplicationCreated = (application: Application) => {
    setApplications((prev) => [...prev, application]);
    setShowForm(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleKanbanDragStart =
    (application: Application) => (event: DragEvent<HTMLDivElement>) => {
      event.stopPropagation();
      suppressKanbanCardClickRef.current = false;
      kanbanDraggingIdRef.current = application.id;
      setDraggingApplicationId(application.id);
      try {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(
          "application/x-momentum-application-id",
          String(application.id),
        );
        event.dataTransfer.setData("text/plain", String(application.id));
      } catch {
        /* ignore setData quirks */
      }
    };

  const cleanupKanbanDragState = () => {
    kanbanDraggingIdRef.current = null;
    setDraggingApplicationId(null);
    setDragOverColumnKey(null);

    // Ensure stale drag visuals are always cleared, even if DnD events are flaky.
    document
      .querySelectorAll<HTMLElement>(".kanban-card.dragging")
      .forEach((card) => {
        card.classList.remove("dragging");
        card.style.opacity = "";
        card.style.filter = "";
        card.style.transform = "";
      });

    document
      .querySelectorAll<HTMLElement>(".kanban-column.kanban-column-drag-over")
      .forEach((column) => {
        column.classList.remove("kanban-column-drag-over");
      });
  };

  const handleKanbanDragEnd = () => {
    suppressKanbanCardClickRef.current = true;
    window.setTimeout(() => {
      suppressKanbanCardClickRef.current = false;
    }, 220);
    cleanupKanbanDragState();
  };

  const handleKanbanCardActivate =
    (application: Application) => (event: MouseEvent<HTMLDivElement>) => {
      if (suppressKanbanCardClickRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      setSelectedApplication(application);
    };

  const handleKanbanColumnDragOver =
    (columnKey: KanbanColumn) => (event: DragEvent<HTMLDivElement>) => {
      if (kanbanDraggingIdRef.current == null) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
      setDragOverColumnKey(columnKey);
    };

  const handleKanbanColumnDragLeave =
    (columnKey: KanbanColumn) => (event: DragEvent<HTMLDivElement>) => {
      const nextTarget = event.relatedTarget as Node | null;
      if (nextTarget && event.currentTarget.contains(nextTarget)) return;
      setDragOverColumnKey((previous) =>
        previous === columnKey ? null : previous,
      );
    };

  const handleKanbanColumnDrop =
    (columnKey: KanbanColumn) => async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      let applicationId: number | null = null;
      let rollback: Application | null = null;
      const meta = KANBAN_COLUMN_OPTIONS[columnKey];

      try {
        const raw =
          event.dataTransfer.getData("application/x-momentum-application-id") ||
          event.dataTransfer.getData("text/plain");
        applicationId = parseInt(raw, 10);
        if (!Number.isFinite(applicationId)) return;

        const application = applications.find((a) => a.id === applicationId);
        if (!application) return;

        const sourceKey = findColumnKeyForStatus(application.status ?? undefined);
        if (!sourceKey) return;

        if (sourceKey === columnKey) return;

        const newStatusBackend = meta.backendStatus;
        if (
          (application.status ?? "").toLowerCase() ===
          newStatusBackend.toLowerCase()
        )
          return;

        rollback = { ...application };

        setApplications((previousApplications) =>
          previousApplications.map((applicationItem) =>
            applicationItem.id === applicationId
              ? {
                  ...applicationItem,
                  status: newStatusBackend as Application["status"],
                }
              : applicationItem,
          ),
        );
        setSelectedApplication((current) =>
          current && current.id === applicationId
            ? {
                ...current,
                status: newStatusBackend as Application["status"],
              }
            : current,
        );

        await api.updateApplication(applicationId, {
          status: newStatusBackend as CreateApplication["status"],
        });
      } catch (error) {
        if (applicationId != null && rollback) {
          const rollbackSnapshot = rollback;
          setApplications((previousApplications) =>
            previousApplications.map((applicationItem) =>
              applicationItem.id === applicationId
                ? rollbackSnapshot
                : applicationItem,
            ),
          );
          setSelectedApplication((current) =>
            current && current.id === applicationId ? rollbackSnapshot : current,
          );
        }
        const message =
          error instanceof Error ? error.message : "Please try again.";
        alert(`Failed to move application to "${meta.label}". ${message}`);
      } finally {
        cleanupKanbanDragState();
      }
    };

  const handleDetailUpdate = (updated: Application) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    );
    setSelectedApplication(updated);
  };

  const handleDetailDeleted = (id: number) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setSelectedApplication(null);
  };

  // Save selected columns to localStorage
  const handleColumnToggle = (column: KanbanColumn) => {
    const newColumns = selectedColumns.includes(column)
      ? selectedColumns.filter((col) => col !== column)
      : [...selectedColumns, column];

    setSelectedColumns(newColumns);
    localStorage.setItem("kanban-columns", JSON.stringify(newColumns));
  };

  // Reset to default columns
  const handleResetColumns = () => {
    const defaults: KanbanColumn[] = [
      "applied",
      "screen",
      "interviewing",
      "offer",
      "rejected",
    ];
    setSelectedColumns(defaults);
    localStorage.setItem("kanban-columns", JSON.stringify(defaults));
  };

  const isArchived = (app: Application) => {
    const status = (app.status ?? "").toLowerCase();
    return status === "rejected" || status === "withdrawn";
  };

  const activeApplications = applications.filter((app) => !isArchived(app));
  const archivedApplications = applications.filter((app) => isArchived(app));
  const visibleApplications =
    applicationScope === "active" ? activeApplications : archivedApplications;
  const columnsToShow: KanbanColumn[] =
    applicationScope === "archived"
      ? ["withdrawn", "rejected"]
      : selectedColumns;

  const handleGmailSync = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please log in to sync Gmail.");
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/gmail/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg =
          typeof data.detail === "string"
            ? data.detail
            : "Sync failed. Make sure your Google account is connected.";
        throw new Error(msg);
      }

      alert(typeof data.message === "string" ? data.message : "Sync complete.");
      if (typeof data.last_synced === "string") {
        setLastSynced(data.last_synced);
      }
      await loadApplications();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Sync failed. Make sure your Google account is connected.",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportCsv = () => {
    if (!visibleApplications.length) {
      window.alert("No applications to export for this view.");
      return;
    }

    const headers = [
      "ID",
      "Company",
      "Role",
      "Status",
      "Location",
      "Recruiter",
      "Date Applied",
      "Job URL",
      "Notes",
    ];

    const escape = (value: unknown): string => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes('"') || str.includes(",") || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = visibleApplications.map((app) => [
      app.id,
      app.company_name,
      app.role,
      app.status ?? "",
      app.location ?? "",
      app.recruiter ?? "",
      app.date_applied
        ? new Date(app.date_applied).toISOString().slice(0, 10)
        : "",
      app.job_url ?? "",
      app.notes ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    const scopeLabel = applicationScope === "active" ? "active" : "archived";
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `momentum_applications_${scopeLabel}_${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="job-tracker">
      <div className="job-tracker-header">
        <h1 className="job-tracker-title">YOUR JOB TRACKER</h1>
        <div className="job-tracker-subrow">
          <div className="job-tracker-left">
            <div className="job-tracker-count">
              {visibleApplications.length} total applications
            </div>
            <div
              className="application-scope-toggle"
              role="tablist"
              aria-label="Application scope"
            >
              <button
                type="button"
                className={`scope-button ${applicationScope === "active" ? "active" : ""}`}
                onClick={() => {
                  setApplicationScope("active");
                  setShowColumnSettings(false);
                }}
              >
                Active
              </button>
              <button
                type="button"
                className={`scope-button ${applicationScope === "archived" ? "active" : ""}`}
                onClick={() => {
                  setApplicationScope("archived");
                  setShowColumnSettings(false);
                }}
              >
                Archived
              </button>
            </div>
          </div>
          <div className="job-tracker-actions">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                className={`sync-button ${isSyncing ? "syncing" : ""}`}
                onClick={handleGmailSync}
                disabled={isSyncing}
                title="Sync Gmail"
                aria-label="Sync Gmail"
              >
                <svg
                  className="sync-icon"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
              {lastSynced && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#999",
                    whiteSpace: "nowrap",
                  }}
                >
                  Last synced {getTimeAgo(lastSynced)}
                </span>
              )}
            </div>
            <button
              type="button"
              className="export-button"
              onClick={handleExportCsv}
            >
              Export CSV
            </button>
            <button
              type="button"
              className="add-button"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "+ Add Application"}
            </button>
          </div>
        </div>
      </div>

      <div className="applications-section">
        <div className="section-header">
          <div className="header-actions">
            <div className="view-toggle">
              <button
                onClick={() => setViewMode("list")}
                className={`view-button ${viewMode === "list" ? "active" : ""}`}
                title="List View"
              >
                ☰ List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`view-button ${viewMode === "grid" ? "active" : ""}`}
                title="Kanban View"
              >
                ⊞ Kanban
              </button>
            </div>
            {viewMode === "grid" && applicationScope === "active" && (
              <div className="column-actions">
                <button
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  className="settings-button"
                  title="Edit columns"
                  type="button"
                >
                  <span>Columns</span>
                  <i className="fi fi-rr-pencil column-settings-icon" />
                </button>
              </div>
            )}
          </div>

          {/* Column Settings Dropdown */}
          {viewMode === "grid" &&
            applicationScope === "active" &&
            showColumnSettings && (
              <div className="column-settings-panel">
                <div className="column-checkboxes">
                  {Object.entries(KANBAN_COLUMN_OPTIONS).map(
                    ([key, option]) => (
                      <label key={key} className="column-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(
                            key as KanbanColumn,
                          )}
                          onChange={() =>
                            handleColumnToggle(key as KanbanColumn)
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ),
                  )}
                </div>
                <div className="settings-actions">
                  <button onClick={handleResetColumns} className="reset-button">
                    Reset to Defaults
                  </button>
                </div>
              </div>
            )}
        </div>

        {showForm && (
          <div className="form-container">
            <ApplicationForm
              onSuccess={handleApplicationCreated}
              onCancel={handleCancelForm}
            />
          </div>
        )}

        {appLoading ? (
          <div className="loading">Loading applications...</div>
        ) : visibleApplications.length === 0 ? (
          <div className="empty-state">
            <p>
              {applicationScope === "archived"
                ? "No archived applications yet."
                : "No applications yet. Add your first job application!"}
            </p>
          </div>
        ) : viewMode === "list" ? (
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
                </tr>
              </thead>
              <tbody>
                {visibleApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="table-row table-row-clickable"
                    onClick={() => setSelectedApplication(app)}
                  >
                    <td className="company-cell">
                      <strong>{app.company_name}</strong>
                    </td>
                    <td className="location-cell">{app.location || "N/A"}</td>
                    <td className="link-cell">
                      {app.job_url ? (
                        <a
                          href={app.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="job-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Job
                        </a>
                      ) : (
                        <span className="no-link">No link</span>
                      )}
                    </td>
                    <td className="role-cell">{app.role}</td>
                    <td className="recruiter-cell">{app.recruiter || "N/A"}</td>
                    <td className="date-cell">
                      {app.date_applied
                        ? new Date(app.date_applied).toLocaleDateString()
                        : "Not set"}
                    </td>
                    <td className="status-cell">
                      <span
                        className={`status status-${app.status?.toLowerCase()}`}
                      >
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Kanban Board View
          <div className="kanban-board">
            {columnsToShow.map((columnKey) => {
              const option = KANBAN_COLUMN_OPTIONS[columnKey];
              const backendStatus = option.backendStatus;

              // Filter applications by the backend status
              const statusApplications = visibleApplications.filter(
                (app) => app.status?.toLowerCase() === backendStatus,
              );

              return (
                <div
                  key={columnKey}
                  className={`kanban-column${
                    dragOverColumnKey === columnKey
                      ? " kanban-column-drag-over"
                      : ""
                  }`}
                  onDragOver={handleKanbanColumnDragOver(columnKey)}
                  onDragLeave={handleKanbanColumnDragLeave(columnKey)}
                  onDrop={handleKanbanColumnDrop(columnKey)}
                >
                  <div className="kanban-column-header">
                    <h3>{option.label}</h3>
                    <span className="column-count">
                      {statusApplications.length}
                    </span>
                  </div>
                  <div className="kanban-column-content">
                    {statusApplications.length === 0 ? (
                      <div className="empty-column">
                        <p>No applications</p>
                      </div>
                    ) : (
                      statusApplications.map((app) => (
                        <div
                          key={app.id}
                          className={`kanban-card kanban-card-clickable${
                            draggingApplicationId === app.id ? " dragging" : ""
                          }`}
                          draggable
                          role="presentation"
                          onDragStart={handleKanbanDragStart(app)}
                          onDragEnd={handleKanbanDragEnd}
                          onClick={handleKanbanCardActivate(app)}
                        >
                          <div className="card-header">
                            <h4>{app.company_name}</h4>
                          </div>
                          <p className="role">{app.role}</p>
                          {app.location && (
                            <p className="location">📍 {app.location}</p>
                          )}
                          {app.recruiter && (
                            <p className="recruiter">👤 {app.recruiter}</p>
                          )}
                          {app.date_applied && (
                            <p className="date">
                              📅{" "}
                              {new Date(app.date_applied).toLocaleDateString()}
                            </p>
                          )}
                          {app.notes && <p className="notes">{app.notes}</p>}
                          {app.job_url && (
                            <a
                              href={app.job_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="job-link"
                              draggable={false}
                              onClick={(e) => e.stopPropagation()}
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

      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdate={handleDetailUpdate}
          onDelete={handleDetailDeleted}
        />
      )}
    </div>
  );
};
