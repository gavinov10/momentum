import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import type { Application, CreateApplication } from "../services/api";

type EditableKey = keyof Pick<
  CreateApplication,
  | "company_name"
  | "role"
  | "status"
  | "location"
  | "recruiter"
  | "date_applied"
  | "job_url"
  | "notes"
>;

const STATUS_OPTIONS: { value: NonNullable<CreateApplication["status"]>; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "oa", label: "Online Assessment" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

function formatDateForInput(iso?: string): string {
  if (!iso) return "";
  return iso.split("T")[0] ?? "";
}

function PencilIcon() {
  return (
    <svg
      className="application-detail-field__pencil"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
  onUpdate: (application: Application) => void;
  onDelete: (id: number) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [local, setLocal] = useState<Application>(application);
  const [editingField, setEditingField] = useState<EditableKey | null>(null);
  const [savingField, setSavingField] = useState<EditableKey | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocal(application);
    setEditingField(null);
  }, [application]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const savePartial = useCallback(
    async (
      patch: Partial<CreateApplication>,
    ): Promise<Application | null> => {
      try {
        const updated = await api.updateApplication(local.id, patch);
        setLocal(updated);
        onUpdate(updated);
        return updated;
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Failed to save");
        return null;
      }
    },
    [local.id, onUpdate],
  );

  const commitField = useCallback(
    async (key: EditableKey, value: string | undefined) => {
      setSavingField(key);
      try {
        const patch: Partial<CreateApplication> = {};
        if (key === "notes") {
          patch.notes = value?.trim() || undefined;
        } else if (key === "date_applied") {
          if (value?.trim()) {
            patch.date_applied = value.trim();
          } else {
            patch.date_applied = undefined;
          }
        } else if (key === "status") {
          patch.status = value as CreateApplication["status"];
        } else if (key === "company_name" || key === "role") {
          const v = value?.trim() ?? "";
          if (!v) {
            alert("This field cannot be empty.");
            return;
          }
          (patch as Record<string, string>)[key] = v;
        } else {
          const v = value?.trim();
          (patch as Record<string, string | undefined>)[key] = v || undefined;
        }
        await savePartial(patch);
        setEditingField(null);
      } finally {
        setSavingField(null);
      }
    },
    [savePartial],
  );

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Delete this application? This cannot be undone.",
      )
    ) {
      return;
    }
    setDeleteBusy(true);
    try {
      await api.deleteApplication(local.id);
      onDelete(local.id);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleteBusy(false);
    }
  };

  const renderRow = (
    key: EditableKey,
    label: string,
    display: React.ReactNode,
    editor: (commit: () => void) => React.ReactNode,
  ) => {
    const isEditing = editingField === key;
    const isSaving = savingField === key;

    return (
      <div
        className={`application-detail-field${isEditing ? " application-detail-field--editing" : ""}`}
      >
        <div className="application-detail-field__label-row">
          <span className="application-detail-field__label">{label}</span>
          {!isEditing && (
            <button
              type="button"
              className="application-detail-field__edit-btn"
              onClick={() => setEditingField(key)}
              aria-label={`Edit ${label}`}
            >
              <PencilIcon />
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="application-detail-field__editor">
            {editor(() => setEditingField(null))}
            {isSaving && (
              <span className="application-detail-field__saving">Saving…</span>
            )}
          </div>
        ) : (
          <div className="application-detail-field__value">{display}</div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={backdropRef}
      className="application-detail-modal-backdrop"
      onMouseDown={handleBackdropMouseDown}
      role="presentation"
    >
      <div
        className="application-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-detail-title"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="application-detail-modal__header">
          <h2 id="application-detail-title" className="application-detail-modal__title">
            Application details
          </h2>
          <button
            type="button"
            className="application-detail-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="application-detail-modal__body">
          {renderRow("company_name", "Company", local.company_name, (cancel) => (
            <input
              type="text"
              className="application-detail-input"
              key={`${local.id}-company`}
              defaultValue={local.company_name}
              disabled={!!savingField}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== local.company_name) void commitField("company_name", v);
                else cancel();
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  cancel();
                  return;
                }
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              autoFocus
            />
          ))}

          {renderRow("role", "Role", local.role, (cancel) => (
            <input
              type="text"
              className="application-detail-input"
              defaultValue={local.role}
              disabled={!!savingField}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== local.role) void commitField("role", v);
                else cancel();
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  cancel();
                  return;
                }
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              autoFocus
            />
          ))}

          {renderRow(
            "status",
            "Status",
            <span className={`status status-${local.status?.toLowerCase() ?? ""}`}>
              {local.status ?? "—"}
            </span>,
            (cancel) => (
              <select
                className="application-detail-input"
                value={local.status ?? "saved"}
                disabled={!!savingField}
                onChange={(e) => {
                  void commitField("status", e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    cancel();
                  }
                }}
                autoFocus
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ),
          )}

          {renderRow(
            "location",
            "Location",
            local.location || "—",
            (cancel) => (
              <input
                type="text"
                className="application-detail-input"
                defaultValue={local.location ?? ""}
                disabled={!!savingField}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v !== (local.location ?? ""))
                    void commitField("location", v || undefined);
                  else cancel();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    cancel();
                    return;
                  }
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                autoFocus
              />
            ),
          )}

          {renderRow(
            "recruiter",
            "Recruiter",
            local.recruiter || "—",
            (cancel) => (
              <input
                type="text"
                className="application-detail-input"
                defaultValue={local.recruiter ?? ""}
                disabled={!!savingField}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v !== (local.recruiter ?? ""))
                    void commitField("recruiter", v || undefined);
                  else cancel();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    cancel();
                    return;
                  }
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                autoFocus
              />
            ),
          )}

          {renderRow(
            "date_applied",
            "Date applied",
            local.date_applied
              ? new Date(local.date_applied).toLocaleDateString()
              : "—",
            (cancel) => (
              <input
                type="date"
                className="application-detail-input"
                defaultValue={formatDateForInput(local.date_applied)}
                disabled={!!savingField}
                onBlur={(e) => {
                  const raw = e.target.value;
                  const prev = formatDateForInput(local.date_applied);
                  if (raw !== prev)
                    void commitField("date_applied", raw || undefined);
                  else cancel();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    cancel();
                    return;
                  }
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                autoFocus
              />
            ),
          )}

          {renderRow(
            "job_url",
            "Job URL",
            local.job_url ? (
              <a
                href={local.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="application-detail-job-link"
              >
                {local.job_url}
              </a>
            ) : (
              "—"
            ),
            (cancel) => (
              <input
                type="url"
                className="application-detail-input"
                defaultValue={local.job_url ?? ""}
                placeholder="https://..."
                disabled={!!savingField}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v !== (local.job_url ?? ""))
                    void commitField("job_url", v || undefined);
                  else cancel();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    cancel();
                    return;
                  }
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                autoFocus
              />
            ),
          )}

          {renderRow("notes", "Notes", local.notes || "—", (cancel) => (
            <textarea
              className="application-detail-textarea"
              defaultValue={local.notes ?? ""}
              rows={4}
              disabled={!!savingField}
              onBlur={(e) => {
                const v = e.target.value;
                if (v !== (local.notes ?? "")) void commitField("notes", v);
                else cancel();
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  cancel();
                }
              }}
              autoFocus
            />
          ))}
        </div>

        <div className="application-detail-modal__footer">
          <button
            type="button"
            className="application-detail-modal__delete"
            onClick={handleDelete}
            disabled={deleteBusy}
          >
            {deleteBusy ? "Deleting…" : "Delete application"}
          </button>
        </div>
      </div>
    </div>
  );
};
