import React, { useEffect, useState } from "react";

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

const callClaude = async (prompt: string): Promise<string> => {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Missing VITE_ANTHROPIC_API_KEY");
  }
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) {
    throw new Error("AI request failed");
  }
  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error("No AI response");
  return text;
};

export interface BusinessJob {
  id: string;
  company: string;
  location: string;
  title: string;
  dateRange: string;
  bullets: string[];
}

export interface BusinessEducation {
  school: string;
  location: string;
  degree: string;
  date: string;
  bullets: string[];
}

export interface BusinessResumeData {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
  education: BusinessEducation;
  professional: BusinessJob[];
  relevant: BusinessJob[];
  skillsLines: string[];
}

export interface AcademicEducationEntry {
  id: string;
  school: string;
  location: string;
  date: string;
  bullets: string[];
}

export interface AcademicEntry {
  id: string;
  organization: string;
  title: string;
  location: string;
  dateRange: string;
  bullets: string[];
}

export interface AcademicResumeData {
  name: string;
  email: string;
  phone: string;
  schoolAddress: string;
  permanentAddress: string;
  education: AcademicEducationEntry[];
  professional: AcademicEntry[];
  leadership: AcademicEntry[];
  honors: AcademicEntry[];
  skillsLines: string[];
}

type JobSection = "professional" | "relevant";

interface BusinessResumeTemplateProps {
  data: BusinessResumeData;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  onUpdateRoot: (field: "name" | "phone" | "email" | "linkedin", value: string) => void;
  onUpdateEducation: (
    field: "school" | "location" | "degree" | "date",
    value: string,
  ) => void;
  onUpdateEducationBullet: (index: number, value: string) => void;
  onAddEducationBullet: (index: number) => void;
  onRemoveEducationBullet: (index: number) => void;
  onUpdateJob: (
    section: JobSection,
    jobId: string,
    field: "company" | "location" | "title" | "dateRange",
    value: string,
  ) => void;
  onUpdateJobBullet: (
    section: JobSection,
    jobId: string,
    bulletIndex: number,
    value: string,
  ) => void;
  onSetJobBullets: (section: JobSection, jobId: string, bullets: string[]) => void;
  onAddJobBullet: (section: JobSection, jobId: string, bulletIndex: number) => void;
  onRemoveJobBullet: (section: JobSection, jobId: string, bulletIndex: number) => void;
  onAddJob: (section: JobSection) => void;
  onRemoveJob: (section: JobSection, jobId: string) => void;
  onUpdateSkillsLine: (lineIndex: number, value: string) => void;
}

interface InlineEditableProps {
  fieldId: string;
  value: string;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  onSave: (value: string) => void;
  multiline?: boolean;
  className?: string;
  fullWidthInput?: boolean;
}

const InlineEditable: React.FC<InlineEditableProps> = ({
  fieldId,
  value,
  editingField,
  setEditingField,
  onSave,
  multiline = false,
  className,
  fullWidthInput = false,
}) => {
  const isEditing = editingField === fieldId;
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!isEditing) setDraft(value);
  }, [isEditing, value]);

  const commit = () => {
    onSave(draft.trim());
    setEditingField(null);
  };
  const cancel = () => {
    setDraft(value);
    setEditingField(null);
  };

  const moveToAdjacentField = (reverse: boolean) => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-resume-field]"),
    );
    const fieldIds = nodes
      .map((node) => node.dataset.resumeField ?? "")
      .filter(Boolean);
    const currentIndex = fieldIds.indexOf(fieldId);
    if (currentIndex === -1) return;
    const nextIndex = reverse
      ? Math.max(0, currentIndex - 1)
      : Math.min(fieldIds.length - 1, currentIndex + 1);
    setEditingField(fieldIds[nextIndex] ?? null);
  };

  return (
    <span className={`resume-inline-shell ${className ?? ""}`.trim()} data-resume-field={fieldId}>
      {isEditing ? (
        multiline ? (
          <textarea
            autoFocus
            className={`resume-inline-input resume-inline-textarea ${
              fullWidthInput ? "resume-inline-input-full" : "resume-inline-input-auto"
            }`.trim()}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                cancel();
                return;
              }
              if (event.key === "Tab") {
                event.preventDefault();
                commit();
                moveToAdjacentField(event.shiftKey);
              }
            }}
          />
        ) : (
          <input
            autoFocus
            className={`resume-inline-input ${
              fullWidthInput ? "resume-inline-input-full" : "resume-inline-input-auto"
            }`.trim()}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
                return;
              }
              if (event.key === "Escape") {
                event.preventDefault();
                cancel();
                return;
              }
              if (event.key === "Tab") {
                event.preventDefault();
                commit();
                moveToAdjacentField(event.shiftKey);
              }
            }}
          />
        )
      ) : (
        <span
          className="resume-editable"
          onClick={() => setEditingField(fieldId)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setEditingField(fieldId);
            }
          }}
        >
          {value}
        </span>
      )}
    </span>
  );
};

const JobSectionBlock: React.FC<{
  title: string;
  section: JobSection;
  jobs: BusinessJob[];
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  onUpdateJob: BusinessResumeTemplateProps["onUpdateJob"];
  onUpdateJobBullet: BusinessResumeTemplateProps["onUpdateJobBullet"];
  onSetJobBullets: BusinessResumeTemplateProps["onSetJobBullets"];
  onAddJobBullet: BusinessResumeTemplateProps["onAddJobBullet"];
  onRemoveJobBullet: BusinessResumeTemplateProps["onRemoveJobBullet"];
  onAddJob: BusinessResumeTemplateProps["onAddJob"];
  onRemoveJob: BusinessResumeTemplateProps["onRemoveJob"];
}> = ({
  title,
  section,
  jobs,
  editingField,
  setEditingField,
  onUpdateJob,
  onUpdateJobBullet,
  onSetJobBullets,
  onAddJobBullet,
  onRemoveJobBullet,
  onAddJob,
  onRemoveJob,
}) => {
  const [improvingKey, setImprovingKey] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string>("");
  const [generatorKey, setGeneratorKey] = useState<string | null>(null);
  const [generatorTitle, setGeneratorTitle] = useState("");
  const [generatorCompany, setGeneratorCompany] = useState("");
  const [generatorDescription, setGeneratorDescription] = useState("");
  const [isGeneratingBullets, setIsGeneratingBullets] = useState(false);

  return (
  <section className="resume-business-section">
    <h2>{title}</h2>
    <hr />
    {jobs.map((job) => (
      <article className="resume-job-entry" key={job.id}>
        <button
          type="button"
          className="resume-entry-delete"
          onClick={() => onRemoveJob(section, job.id)}
        >
          Delete
        </button>
        <div className="resume-entry-row">
          <InlineEditable
            fieldId={`${section}.${job.id}.company`}
            value={job.company}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateJob(section, job.id, "company", value)}
            className="company"
          />
          <InlineEditable
            fieldId={`${section}.${job.id}.location`}
            value={job.location}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateJob(section, job.id, "location", value)}
            className="right"
          />
        </div>
        <div className="resume-entry-row">
          <InlineEditable
            fieldId={`${section}.${job.id}.title`}
            value={job.title}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateJob(section, job.id, "title", value)}
            className="title"
          />
          <InlineEditable
            fieldId={`${section}.${job.id}.date`}
            value={job.dateRange}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateJob(section, job.id, "dateRange", value)}
            className="right"
          />
        </div>
        <ul className="resume-bullet-list">
          {job.bullets.map((bullet, index) => (
            <li key={`${job.id}-${index}`} className="resume-bullet-row">
              <InlineEditable
                fieldId={`${section}.${job.id}.bullet.${index}`}
                value={bullet}
                editingField={editingField}
                setEditingField={setEditingField}
                onSave={(value) => onUpdateJobBullet(section, job.id, index, value)}
                multiline
                fullWidthInput
              />
              <div className="resume-bullet-actions">
                <button type="button" onClick={() => onAddJobBullet(section, job.id, index)}>
                  +
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveJobBullet(section, job.id, index)}
                >
                  x
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const key = `${section}.${job.id}.${index}`;
                    setImprovingKey(key);
                    setAiError("");
                    try {
                      const rewritten = await callClaude(
                        `Rewrite this resume bullet point to be more impactful. Use strong action verbs, quantify impact where possible, and make it concise. Keep it to one sentence.\n\nJob Title: ${job.title}\nCompany: ${job.company}\nCurrent bullet: ${bullet}\n\nReturn only the rewritten bullet point, nothing else.`,
                      );
                      onUpdateJobBullet(section, job.id, index, rewritten.replace(/^-\s*/, ""));
                    } catch (error) {
                      setAiError(
                        error instanceof Error ? error.message : "Unable to improve bullet",
                      );
                    } finally {
                      setImprovingKey(null);
                    }
                  }}
                >
                  {improvingKey === `${section}.${job.id}.${index}` ? "..." : "✨"}
                </button>
              </div>
            </li>
          ))}
        </ul>
        {!job.company.trim() && !job.title.trim() && (
          <div className="resume-ai-generate-wrap">
            {generatorKey !== job.id ? (
              <button type="button" className="resume-add-entry" onClick={() => {
                setGeneratorKey(job.id);
                setGeneratorTitle(job.title);
                setGeneratorCompany(job.company);
                setGeneratorDescription("");
              }}>
                Generate bullets
              </button>
            ) : (
              <div className="resume-ai-form">
                <input
                  className="resume-inline-input resume-inline-input-full"
                  value={generatorTitle}
                  onChange={(event) => setGeneratorTitle(event.target.value)}
                  placeholder="Job Title"
                />
                <input
                  className="resume-inline-input resume-inline-input-full"
                  value={generatorCompany}
                  onChange={(event) => setGeneratorCompany(event.target.value)}
                  placeholder="Company"
                />
                <textarea
                  className="resume-inline-input resume-inline-textarea resume-inline-input-full"
                  value={generatorDescription}
                  onChange={(event) => setGeneratorDescription(event.target.value)}
                  placeholder="Brief responsibilities (optional)"
                />
                <button
                  type="button"
                  className="resume-add-entry"
                  onClick={async () => {
                    setIsGeneratingBullets(true);
                    setAiError("");
                    try {
                      const generated = await callClaude(
                        `Generate 3-4 strong resume bullet points for this job. Use action verbs, include realistic metrics, and keep each bullet to one sentence.\n\nJob Title: ${generatorTitle || job.title}\nCompany: ${generatorCompany || job.company}\nDescription: ${generatorDescription}\n\nReturn only the bullet points, one per line, starting with a dash (-). Nothing else.`,
                      );
                      const bullets = generated
                        .split("\n")
                        .map((line) => line.trim().replace(/^-+\s*/, ""))
                        .filter(Boolean);
                      onUpdateJob(section, job.id, "title", generatorTitle || job.title);
                      onUpdateJob(section, job.id, "company", generatorCompany || job.company);
                      onSetJobBullets(section, job.id, bullets.slice(0, 4));
                      setGeneratorKey(null);
                    } catch (error) {
                      setAiError(
                        error instanceof Error ? error.message : "Unable to generate bullets",
                      );
                    } finally {
                      setIsGeneratingBullets(false);
                    }
                  }}
                >
                  {isGeneratingBullets ? "Generating..." : "Generate"}
                </button>
              </div>
            )}
          </div>
        )}
      </article>
    ))}
    {aiError && <div className="resume-ai-error">{aiError}</div>}
    <button type="button" className="resume-add-entry" onClick={() => onAddJob(section)}>
      Add Job
    </button>
  </section>
  );
};

const BusinessResumeTemplate: React.FC<BusinessResumeTemplateProps> = ({
  data,
  editingField,
  setEditingField,
  onUpdateRoot,
  onUpdateEducation,
  onUpdateEducationBullet,
  onAddEducationBullet,
  onRemoveEducationBullet,
  onUpdateJob,
  onUpdateJobBullet,
  onSetJobBullets,
  onAddJobBullet,
  onRemoveJobBullet,
  onAddJob,
  onRemoveJob,
  onUpdateSkillsLine,
}) => {
  return (
    <div className="resume-business">
      <header className="resume-business-header">
        <InlineEditable
          fieldId="header.name"
          value={data.name}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateRoot("name", value)}
          className="name"
          fullWidthInput
        />
        <div className="contact-line">
          <InlineEditable
            fieldId="header.phone"
            value={data.phone}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateRoot("phone", value)}
          />
          <span>|</span>
          <InlineEditable
            fieldId="header.email"
            value={data.email}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateRoot("email", value)}
          />
          <span>|</span>
          <InlineEditable
            fieldId="header.linkedin"
            value={data.linkedin}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateRoot("linkedin", value)}
          />
        </div>
      </header>

      <section className="resume-business-section">
        <h2>EDUCATION</h2>
        <hr />
        <div className="resume-entry-row">
          <InlineEditable
            fieldId="education.school"
            value={data.education.school}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateEducation("school", value)}
            className="company"
          />
          <InlineEditable
            fieldId="education.location"
            value={data.education.location}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateEducation("location", value)}
            className="right"
          />
        </div>
        <div className="resume-entry-row">
          <InlineEditable
            fieldId="education.degree"
            value={data.education.degree}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateEducation("degree", value)}
            className="title"
          />
          <InlineEditable
            fieldId="education.date"
            value={data.education.date}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateEducation("date", value)}
            className="right"
          />
        </div>
        <ul className="resume-bullet-list">
          {data.education.bullets.map((bullet, index) => (
            <li key={`edu-${index}`} className="resume-bullet-row">
              <InlineEditable
                fieldId={`education.bullet.${index}`}
                value={bullet}
                editingField={editingField}
                setEditingField={setEditingField}
                onSave={(value) => onUpdateEducationBullet(index, value)}
                multiline
                fullWidthInput
              />
              <div className="resume-bullet-actions">
                <button type="button" onClick={() => onAddEducationBullet(index)}>
                  +
                </button>
                <button type="button" onClick={() => onRemoveEducationBullet(index)}>
                  x
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <JobSectionBlock
        title="PROFESSIONAL EXPERIENCE"
        section="professional"
        jobs={data.professional}
        editingField={editingField}
        setEditingField={setEditingField}
        onUpdateJob={onUpdateJob}
        onUpdateJobBullet={onUpdateJobBullet}
        onSetJobBullets={onSetJobBullets}
        onAddJobBullet={onAddJobBullet}
        onRemoveJobBullet={onRemoveJobBullet}
        onAddJob={onAddJob}
        onRemoveJob={onRemoveJob}
      />

      <JobSectionBlock
        title="RELEVANT EXPERIENCE"
        section="relevant"
        jobs={data.relevant}
        editingField={editingField}
        setEditingField={setEditingField}
        onUpdateJob={onUpdateJob}
        onUpdateJobBullet={onUpdateJobBullet}
        onSetJobBullets={onSetJobBullets}
        onAddJobBullet={onAddJobBullet}
        onRemoveJobBullet={onRemoveJobBullet}
        onAddJob={onAddJob}
        onRemoveJob={onRemoveJob}
      />

      <section className="resume-business-section">
        <h2>SKILLS, ACTIVITIES & INTERESTS</h2>
        <hr />
        {data.skillsLines.map((line, index) => (
          <div key={`skill-${index}`} className="skills-line">
            <InlineEditable
              fieldId={`skills.${index}`}
              value={line}
              editingField={editingField}
              setEditingField={setEditingField}
              onSave={(value) => onUpdateSkillsLine(index, value)}
              fullWidthInput
            />
          </div>
        ))}
      </section>
    </div>
  );
};

export default BusinessResumeTemplate;

interface AcademicResumeTemplateProps {
  data: AcademicResumeData;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  onUpdateHeader: (
    field: "name" | "email" | "phone" | "schoolAddress" | "permanentAddress",
    value: string,
  ) => void;
  onUpdateEducationField: (
    id: string,
    field: "school" | "location" | "date",
    value: string,
  ) => void;
  onUpdateEducationBullet: (id: string, index: number, value: string) => void;
  onAddEducationBullet: (id: string, index: number) => void;
  onRemoveEducationBullet: (id: string, index: number) => void;
  onUpdateEntryField: (
    section: "professional" | "leadership" | "honors",
    id: string,
    field: "organization" | "title" | "location" | "dateRange",
    value: string,
  ) => void;
  onUpdateEntryBullet: (
    section: "professional" | "leadership" | "honors",
    id: string,
    index: number,
    value: string,
  ) => void;
  onSetEntryBullets: (
    section: "professional" | "leadership" | "honors",
    id: string,
    bullets: string[],
  ) => void;
  onAddEntryBullet: (
    section: "professional" | "leadership" | "honors",
    id: string,
    index: number,
  ) => void;
  onRemoveEntryBullet: (
    section: "professional" | "leadership" | "honors",
    id: string,
    index: number,
  ) => void;
  onAddEntry: (section: "professional" | "leadership" | "honors") => void;
  onRemoveEntry: (section: "professional" | "leadership" | "honors", id: string) => void;
  onUpdateSkillsLine: (lineIndex: number, value: string) => void;
}

const AcademicSectionBlock: React.FC<{
  title: string;
  section: "professional" | "leadership" | "honors";
  entries: AcademicEntry[];
  bulletChar: "•" | "–";
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  onUpdateEntryField: AcademicResumeTemplateProps["onUpdateEntryField"];
  onUpdateEntryBullet: AcademicResumeTemplateProps["onUpdateEntryBullet"];
  onSetEntryBullets: AcademicResumeTemplateProps["onSetEntryBullets"];
  onAddEntryBullet: AcademicResumeTemplateProps["onAddEntryBullet"];
  onRemoveEntryBullet: AcademicResumeTemplateProps["onRemoveEntryBullet"];
  onAddEntry: AcademicResumeTemplateProps["onAddEntry"];
  onRemoveEntry: AcademicResumeTemplateProps["onRemoveEntry"];
}> = ({
  title,
  section,
  entries,
  bulletChar,
  editingField,
  setEditingField,
  onUpdateEntryField,
  onUpdateEntryBullet,
  onSetEntryBullets,
  onAddEntryBullet,
  onRemoveEntryBullet,
  onAddEntry,
  onRemoveEntry,
}) => {
  const [improvingKey, setImprovingKey] = useState<string | null>(null);
  const [aiError, setAiError] = useState("");
  const [generatorKey, setGeneratorKey] = useState<string | null>(null);
  const [generatorTitle, setGeneratorTitle] = useState("");
  const [generatorCompany, setGeneratorCompany] = useState("");
  const [generatorDescription, setGeneratorDescription] = useState("");
  const [isGeneratingBullets, setIsGeneratingBullets] = useState(false);

  return (
  <section className="resume-academic-section">
    <h2>{title}</h2>
    {entries.map((entry) => (
      <article className="resume-job-entry resume-academic-entry" key={entry.id}>
        <button
          type="button"
          className="resume-entry-delete"
          onClick={() => onRemoveEntry(section, entry.id)}
        >
          Delete
        </button>
        <div className="resume-entry-row">
          <InlineEditable
            fieldId={`${section}.${entry.id}.org`}
            value={entry.organization}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateEntryField(section, entry.id, "organization", value)}
            className="company"
          />
          <InlineEditable
            fieldId={`${section}.${entry.id}.date`}
            value={entry.dateRange}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateEntryField(section, entry.id, "dateRange", value)}
            className="right"
          />
        </div>
        <div className="resume-entry-row">
          <InlineEditable
            fieldId={`${section}.${entry.id}.title`}
            value={entry.title}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateEntryField(section, entry.id, "title", value)}
          />
          <InlineEditable
            fieldId={`${section}.${entry.id}.location`}
            value={entry.location}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateEntryField(section, entry.id, "location", value)}
            className="right"
          />
        </div>
        <ul className="resume-bullet-list">
          {entry.bullets.map((bullet, index) => (
            <li key={`${entry.id}-b-${index}`} className="resume-bullet-row">
              <span className="resume-academic-bullet-char">{bulletChar}</span>
              <InlineEditable
                fieldId={`${section}.${entry.id}.bullet.${index}`}
                value={bullet}
                editingField={editingField}
                setEditingField={setEditingField}
                onSave={(value) => onUpdateEntryBullet(section, entry.id, index, value)}
                multiline
                fullWidthInput
              />
              <div className="resume-bullet-actions">
                <button type="button" onClick={() => onAddEntryBullet(section, entry.id, index)}>
                  +
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveEntryBullet(section, entry.id, index)}
                >
                  x
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const key = `${section}.${entry.id}.${index}`;
                    setImprovingKey(key);
                    setAiError("");
                    try {
                      const rewritten = await callClaude(
                        `Rewrite this resume bullet point to be more impactful. Use strong action verbs, quantify impact where possible, and make it concise. Keep it to one sentence.\n\nJob Title: ${entry.title}\nCompany: ${entry.organization}\nCurrent bullet: ${bullet}\n\nReturn only the rewritten bullet point, nothing else.`,
                      );
                      onUpdateEntryBullet(section, entry.id, index, rewritten.replace(/^-\s*/, ""));
                    } catch (error) {
                      setAiError(error instanceof Error ? error.message : "Unable to improve bullet");
                    } finally {
                      setImprovingKey(null);
                    }
                  }}
                >
                  {improvingKey === `${section}.${entry.id}.${index}` ? "..." : "✨"}
                </button>
              </div>
            </li>
          ))}
        </ul>
        {!entry.organization.trim() && !entry.title.trim() && (
          <div className="resume-ai-generate-wrap">
            {generatorKey !== entry.id ? (
              <button type="button" className="resume-add-entry" onClick={() => {
                setGeneratorKey(entry.id);
                setGeneratorTitle(entry.title);
                setGeneratorCompany(entry.organization);
                setGeneratorDescription("");
              }}>
                Generate bullets
              </button>
            ) : (
              <div className="resume-ai-form">
                <input
                  className="resume-inline-input resume-inline-input-full"
                  value={generatorTitle}
                  onChange={(event) => setGeneratorTitle(event.target.value)}
                  placeholder="Job Title"
                />
                <input
                  className="resume-inline-input resume-inline-input-full"
                  value={generatorCompany}
                  onChange={(event) => setGeneratorCompany(event.target.value)}
                  placeholder="Company"
                />
                <textarea
                  className="resume-inline-input resume-inline-textarea resume-inline-input-full"
                  value={generatorDescription}
                  onChange={(event) => setGeneratorDescription(event.target.value)}
                  placeholder="Brief responsibilities (optional)"
                />
                <button
                  type="button"
                  className="resume-add-entry"
                  onClick={async () => {
                    setIsGeneratingBullets(true);
                    setAiError("");
                    try {
                      const generated = await callClaude(
                        `Generate 3-4 strong resume bullet points for this job. Use action verbs, include realistic metrics, and keep each bullet to one sentence.\n\nJob Title: ${generatorTitle || entry.title}\nCompany: ${generatorCompany || entry.organization}\nDescription: ${generatorDescription}\n\nReturn only the bullet points, one per line, starting with a dash (-). Nothing else.`,
                      );
                      const bullets = generated
                        .split("\n")
                        .map((line) => line.trim().replace(/^-+\s*/, ""))
                        .filter(Boolean);
                      onUpdateEntryField(section, entry.id, "title", generatorTitle || entry.title);
                      onUpdateEntryField(section, entry.id, "organization", generatorCompany || entry.organization);
                      onSetEntryBullets(section, entry.id, bullets.slice(0, 4));
                      setGeneratorKey(null);
                    } catch (error) {
                      setAiError(error instanceof Error ? error.message : "Unable to generate bullets");
                    } finally {
                      setIsGeneratingBullets(false);
                    }
                  }}
                >
                  {isGeneratingBullets ? "Generating..." : "Generate"}
                </button>
              </div>
            )}
          </div>
        )}
      </article>
    ))}
    {aiError && <div className="resume-ai-error">{aiError}</div>}
    <button type="button" className="resume-add-entry" onClick={() => onAddEntry(section)}>
      Add Job
    </button>
  </section>
  );
};

export const AcademicResumeTemplate: React.FC<AcademicResumeTemplateProps> = ({
  data,
  editingField,
  setEditingField,
  onUpdateHeader,
  onUpdateEducationField,
  onUpdateEducationBullet,
  onAddEducationBullet,
  onRemoveEducationBullet,
  onUpdateEntryField,
  onUpdateEntryBullet,
  onSetEntryBullets,
  onAddEntryBullet,
  onRemoveEntryBullet,
  onAddEntry,
  onRemoveEntry,
  onUpdateSkillsLine,
}) => (
  <div className="resume-academic">
    <header className="resume-academic-header">
      <InlineEditable
        fieldId="academic.header.name"
        value={data.name}
        editingField={editingField}
        setEditingField={setEditingField}
        onSave={(value) => onUpdateHeader("name", value)}
        className="name"
        fullWidthInput
      />
      <div className="contact-line">
        <InlineEditable
          fieldId="academic.header.email"
          value={data.email}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateHeader("email", value)}
        />
        <span>|</span>
        <InlineEditable
          fieldId="academic.header.phone"
          value={data.phone}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateHeader("phone", value)}
        />
      </div>
      <div className="contact-line">
        <InlineEditable
          fieldId="academic.header.schoolAddress"
          value={data.schoolAddress}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateHeader("schoolAddress", value)}
          fullWidthInput
        />
      </div>
      <div className="contact-line">
        <InlineEditable
          fieldId="academic.header.permanentAddress"
          value={data.permanentAddress}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateHeader("permanentAddress", value)}
          fullWidthInput
        />
      </div>
    </header>

    <section className="resume-academic-section">
      <h2>EDUCATION</h2>
      {data.education.map((edu) => (
        <article key={edu.id} className="resume-academic-entry">
          <div className="resume-entry-row">
            <InlineEditable
              fieldId={`academic.education.${edu.id}.school`}
              value={edu.school}
              editingField={editingField}
              setEditingField={setEditingField}
              onSave={(value) => onUpdateEducationField(edu.id, "school", value)}
              className="company"
            />
            <InlineEditable
              fieldId={`academic.education.${edu.id}.location`}
              value={edu.location}
              editingField={editingField}
              setEditingField={setEditingField}
              onSave={(value) => onUpdateEducationField(edu.id, "location", value)}
              className="right"
            />
          </div>
          <div className="resume-entry-row">
            <span />
            <InlineEditable
              fieldId={`academic.education.${edu.id}.date`}
              value={edu.date}
              editingField={editingField}
              setEditingField={setEditingField}
              onSave={(value) => onUpdateEducationField(edu.id, "date", value)}
              className="right"
            />
          </div>
          <ul className="resume-bullet-list">
            {edu.bullets.map((bullet, index) => (
              <li key={`${edu.id}-edu-b-${index}`} className="resume-bullet-row">
                <span className="resume-academic-bullet-char">•</span>
                <InlineEditable
                  fieldId={`academic.education.${edu.id}.bullet.${index}`}
                  value={bullet}
                  editingField={editingField}
                  setEditingField={setEditingField}
                  onSave={(value) => onUpdateEducationBullet(edu.id, index, value)}
                  multiline
                  fullWidthInput
                />
                <div className="resume-bullet-actions">
                  <button type="button" onClick={() => onAddEducationBullet(edu.id, index)}>
                    +
                  </button>
                  <button type="button" onClick={() => onRemoveEducationBullet(edu.id, index)}>
                    x
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>

    <AcademicSectionBlock
      title="PROFESSIONAL EXPERIENCE"
      section="professional"
      entries={data.professional}
      bulletChar="–"
      editingField={editingField}
      setEditingField={setEditingField}
      onUpdateEntryField={onUpdateEntryField}
      onUpdateEntryBullet={onUpdateEntryBullet}
      onSetEntryBullets={onSetEntryBullets}
      onAddEntryBullet={onAddEntryBullet}
      onRemoveEntryBullet={onRemoveEntryBullet}
      onAddEntry={onAddEntry}
      onRemoveEntry={onRemoveEntry}
    />
    <AcademicSectionBlock
      title="LEADERSHIP EXPERIENCE"
      section="leadership"
      entries={data.leadership}
      bulletChar="•"
      editingField={editingField}
      setEditingField={setEditingField}
      onUpdateEntryField={onUpdateEntryField}
      onUpdateEntryBullet={onUpdateEntryBullet}
      onSetEntryBullets={onSetEntryBullets}
      onAddEntryBullet={onAddEntryBullet}
      onRemoveEntryBullet={onRemoveEntryBullet}
      onAddEntry={onAddEntry}
      onRemoveEntry={onRemoveEntry}
    />
    <AcademicSectionBlock
      title="HONORS AND AWARDS"
      section="honors"
      entries={data.honors}
      bulletChar="–"
      editingField={editingField}
      setEditingField={setEditingField}
      onUpdateEntryField={onUpdateEntryField}
      onUpdateEntryBullet={onUpdateEntryBullet}
      onSetEntryBullets={onSetEntryBullets}
      onAddEntryBullet={onAddEntryBullet}
      onRemoveEntryBullet={onRemoveEntryBullet}
      onAddEntry={onAddEntry}
      onRemoveEntry={onRemoveEntry}
    />

    <section className="resume-academic-section">
      <h2>SKILLS AND INTERESTS</h2>
      {data.skillsLines.map((line, index) => (
        <div key={`academic-skill-${index}`} className="skills-line">
          <InlineEditable
            fieldId={`academic.skills.${index}`}
            value={line}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateSkillsLine(index, value)}
            fullWidthInput
          />
        </div>
      ))}
    </section>
  </div>
);

export interface TechEducation {
  school: string;
  expectedDate: string;
  degreeLine: string;
  location: string;
  bullets: string[];
}

export interface TechExperienceEntry {
  id: string;
  company: string;
  dateRange: string;
  title: string;
  location: string;
  bullets: string[];
}

export interface TechProjectEntry {
  id: string;
  name: string;
  stack: string;
  bullets: string[];
}

export interface TechSkills {
  languages: string;
  developerTools: string;
  frameworks: string;
}

export interface TechResumeData {
  name: string;
  email: string;
  linkedin: string;
  github: string;
  portfolio: string;
  education: TechEducation;
  work: TechExperienceEntry[];
  leadership: TechExperienceEntry[];
  projects: TechProjectEntry[];
  skills: TechSkills;
}

interface TechResumeTemplateProps {
  data: TechResumeData;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  onUpdateHeader: (
    field: "name" | "email" | "linkedin" | "github" | "portfolio",
    value: string,
  ) => void;
  onUpdateEducation: (
    field: "school" | "expectedDate" | "degreeLine" | "location",
    value: string,
  ) => void;
  onUpdateEducationBullet: (index: number, value: string) => void;
  onAddEducationBullet: (index: number) => void;
  onRemoveEducationBullet: (index: number) => void;
  onUpdateExperienceField: (
    section: "work" | "leadership",
    id: string,
    field: "company" | "dateRange" | "title" | "location",
    value: string,
  ) => void;
  onUpdateExperienceBullet: (
    section: "work" | "leadership",
    id: string,
    index: number,
    value: string,
  ) => void;
  onSetExperienceBullets: (
    section: "work" | "leadership",
    id: string,
    bullets: string[],
  ) => void;
  onAddExperienceBullet: (
    section: "work" | "leadership",
    id: string,
    index: number,
  ) => void;
  onRemoveExperienceBullet: (
    section: "work" | "leadership",
    id: string,
    index: number,
  ) => void;
  onAddExperience: (section: "work" | "leadership") => void;
  onRemoveExperience: (section: "work" | "leadership", id: string) => void;
  onUpdateProjectField: (
    id: string,
    field: "name" | "stack",
    value: string,
  ) => void;
  onUpdateProjectBullet: (id: string, index: number, value: string) => void;
  onAddProjectBullet: (id: string, index: number) => void;
  onRemoveProjectBullet: (id: string, index: number) => void;
  onAddProject: () => void;
  onRemoveProject: (id: string) => void;
  onUpdateSkills: (field: keyof TechSkills, value: string) => void;
}

const TechExperienceSection: React.FC<{
  title: string;
  section: "work" | "leadership";
  entries: TechExperienceEntry[];
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  onUpdateField: TechResumeTemplateProps["onUpdateExperienceField"];
  onUpdateBullet: TechResumeTemplateProps["onUpdateExperienceBullet"];
  onSetBullets: TechResumeTemplateProps["onSetExperienceBullets"];
  onAddBullet: TechResumeTemplateProps["onAddExperienceBullet"];
  onRemoveBullet: TechResumeTemplateProps["onRemoveExperienceBullet"];
  onAddEntry: TechResumeTemplateProps["onAddExperience"];
  onRemoveEntry: TechResumeTemplateProps["onRemoveExperience"];
}> = ({
  title,
  section,
  entries,
  editingField,
  setEditingField,
  onUpdateField,
  onUpdateBullet,
  onSetBullets,
  onAddBullet,
  onRemoveBullet,
  onAddEntry,
  onRemoveEntry,
}) => {
  const [improvingKey, setImprovingKey] = useState<string | null>(null);
  const [aiError, setAiError] = useState("");
  const [generatorKey, setGeneratorKey] = useState<string | null>(null);
  const [generatorTitle, setGeneratorTitle] = useState("");
  const [generatorCompany, setGeneratorCompany] = useState("");
  const [generatorDescription, setGeneratorDescription] = useState("");
  const [isGeneratingBullets, setIsGeneratingBullets] = useState(false);
  return (
  <section className="resume-tech-section">
    <h2>{title}</h2>
    {entries.map((entry) => (
      <article className="resume-job-entry" key={entry.id}>
        <button
          type="button"
          className="resume-entry-delete"
          onClick={() => onRemoveEntry(section, entry.id)}
        >
          Delete
        </button>
        <div className="resume-entry-row">
          <InlineEditable
            fieldId={`tech.${section}.${entry.id}.company`}
            value={entry.company}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateField(section, entry.id, "company", value)}
            className="company"
          />
          <InlineEditable
            fieldId={`tech.${section}.${entry.id}.date`}
            value={entry.dateRange}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateField(section, entry.id, "dateRange", value)}
            className="right"
          />
        </div>
        <div className="resume-entry-row">
          <InlineEditable
            fieldId={`tech.${section}.${entry.id}.title`}
            value={entry.title}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateField(section, entry.id, "title", value)}
          />
          <InlineEditable
            fieldId={`tech.${section}.${entry.id}.location`}
            value={entry.location}
            editingField={editingField}
            setEditingField={setEditingField}
            onSave={(value) => onUpdateField(section, entry.id, "location", value)}
            className="right"
          />
        </div>
        <ul className="resume-bullet-list">
          {entry.bullets.map((bullet, index) => (
            <li key={`${entry.id}-tech-b-${index}`} className="resume-bullet-row">
              <InlineEditable
                fieldId={`tech.${section}.${entry.id}.bullet.${index}`}
                value={bullet}
                editingField={editingField}
                setEditingField={setEditingField}
                onSave={(value) => onUpdateBullet(section, entry.id, index, value)}
                multiline
                fullWidthInput
              />
              <div className="resume-bullet-actions">
                <button type="button" onClick={() => onAddBullet(section, entry.id, index)}>
                  +
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveBullet(section, entry.id, index)}
                >
                  x
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const key = `${section}.${entry.id}.${index}`;
                    setImprovingKey(key);
                    setAiError("");
                    try {
                      const rewritten = await callClaude(
                        `Rewrite this resume bullet point to be more impactful. Use strong action verbs, quantify impact where possible, and make it concise. Keep it to one sentence.\n\nJob Title: ${entry.title}\nCompany: ${entry.company}\nCurrent bullet: ${bullet}\n\nReturn only the rewritten bullet point, nothing else.`,
                      );
                      onUpdateBullet(section, entry.id, index, rewritten.replace(/^-\s*/, ""));
                    } catch (error) {
                      setAiError(error instanceof Error ? error.message : "Unable to improve bullet");
                    } finally {
                      setImprovingKey(null);
                    }
                  }}
                >
                  {improvingKey === `${section}.${entry.id}.${index}` ? "..." : "✨"}
                </button>
              </div>
            </li>
          ))}
        </ul>
        {!entry.company.trim() && !entry.title.trim() && (
          <div className="resume-ai-generate-wrap">
            {generatorKey !== entry.id ? (
              <button type="button" className="resume-add-entry" onClick={() => {
                setGeneratorKey(entry.id);
                setGeneratorTitle(entry.title);
                setGeneratorCompany(entry.company);
                setGeneratorDescription("");
              }}>
                Generate bullets
              </button>
            ) : (
              <div className="resume-ai-form">
                <input
                  className="resume-inline-input resume-inline-input-full"
                  value={generatorTitle}
                  onChange={(event) => setGeneratorTitle(event.target.value)}
                  placeholder="Job Title"
                />
                <input
                  className="resume-inline-input resume-inline-input-full"
                  value={generatorCompany}
                  onChange={(event) => setGeneratorCompany(event.target.value)}
                  placeholder="Company"
                />
                <textarea
                  className="resume-inline-input resume-inline-textarea resume-inline-input-full"
                  value={generatorDescription}
                  onChange={(event) => setGeneratorDescription(event.target.value)}
                  placeholder="Brief responsibilities (optional)"
                />
                <button
                  type="button"
                  className="resume-add-entry"
                  onClick={async () => {
                    setIsGeneratingBullets(true);
                    setAiError("");
                    try {
                      const generated = await callClaude(
                        `Generate 3-4 strong resume bullet points for this job. Use action verbs, include realistic metrics, and keep each bullet to one sentence.\n\nJob Title: ${generatorTitle || entry.title}\nCompany: ${generatorCompany || entry.company}\nDescription: ${generatorDescription}\n\nReturn only the bullet points, one per line, starting with a dash (-). Nothing else.`,
                      );
                      const bullets = generated
                        .split("\n")
                        .map((line) => line.trim().replace(/^-+\s*/, ""))
                        .filter(Boolean);
                      onUpdateField(section, entry.id, "title", generatorTitle || entry.title);
                      onUpdateField(section, entry.id, "company", generatorCompany || entry.company);
                      onSetBullets(section, entry.id, bullets.slice(0, 4));
                      setGeneratorKey(null);
                    } catch (error) {
                      setAiError(error instanceof Error ? error.message : "Unable to generate bullets");
                    } finally {
                      setIsGeneratingBullets(false);
                    }
                  }}
                >
                  {isGeneratingBullets ? "Generating..." : "Generate"}
                </button>
              </div>
            )}
          </div>
        )}
      </article>
    ))}
    {aiError && <div className="resume-ai-error">{aiError}</div>}
    <button type="button" className="resume-add-entry" onClick={() => onAddEntry(section)}>
      Add Job
    </button>
  </section>
  );
};

export const TechResumeTemplate: React.FC<TechResumeTemplateProps> = ({
  data,
  editingField,
  setEditingField,
  onUpdateHeader,
  onUpdateEducation,
  onUpdateEducationBullet,
  onAddEducationBullet,
  onRemoveEducationBullet,
  onUpdateExperienceField,
  onUpdateExperienceBullet,
  onSetExperienceBullets,
  onAddExperienceBullet,
  onRemoveExperienceBullet,
  onAddExperience,
  onRemoveExperience,
  onUpdateProjectField,
  onUpdateProjectBullet,
  onAddProjectBullet,
  onRemoveProjectBullet,
  onAddProject,
  onRemoveProject,
  onUpdateSkills,
}) => {
  const [projectImprovingKey, setProjectImprovingKey] = useState<string | null>(null);
  const [projectAiError, setProjectAiError] = useState("");
  return (
  <div className="resume-tech">
    <header className="resume-tech-header">
      <InlineEditable
        fieldId="tech.header.name"
        value={data.name}
        editingField={editingField}
        setEditingField={setEditingField}
        onSave={(value) => onUpdateHeader("name", value)}
        className="name"
        fullWidthInput
      />
      <div className="contact-line">
        <InlineEditable
          fieldId="tech.header.email"
          value={data.email}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateHeader("email", value)}
        />
        <span>|</span>
        <InlineEditable
          fieldId="tech.header.linkedin"
          value={data.linkedin}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateHeader("linkedin", value)}
        />
        <span>|</span>
        <InlineEditable
          fieldId="tech.header.github"
          value={data.github}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateHeader("github", value)}
        />
        <span>|</span>
        <InlineEditable
          fieldId="tech.header.portfolio"
          value={data.portfolio}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateHeader("portfolio", value)}
        />
      </div>
    </header>

    <section className="resume-tech-section">
      <h2>Education</h2>
      <div className="resume-entry-row">
        <InlineEditable
          fieldId="tech.education.school"
          value={data.education.school}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateEducation("school", value)}
          className="company"
        />
        <InlineEditable
          fieldId="tech.education.expectedDate"
          value={data.education.expectedDate}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateEducation("expectedDate", value)}
          className="right"
        />
      </div>
      <div className="resume-entry-row">
        <InlineEditable
          fieldId="tech.education.degreeLine"
          value={data.education.degreeLine}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateEducation("degreeLine", value)}
        />
        <InlineEditable
          fieldId="tech.education.location"
          value={data.education.location}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateEducation("location", value)}
          className="right"
        />
      </div>
      <ul className="resume-bullet-list">
        {data.education.bullets.map((bullet, index) => (
          <li key={`tech-ed-b-${index}`} className="resume-bullet-row">
            <InlineEditable
              fieldId={`tech.education.bullet.${index}`}
              value={bullet}
              editingField={editingField}
              setEditingField={setEditingField}
              onSave={(value) => onUpdateEducationBullet(index, value)}
              multiline
              fullWidthInput
            />
            <div className="resume-bullet-actions">
              <button type="button" onClick={() => onAddEducationBullet(index)}>
                +
              </button>
              <button type="button" onClick={() => onRemoveEducationBullet(index)}>
                x
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>

    <TechExperienceSection
      title="Work Experience"
      section="work"
      entries={data.work}
      editingField={editingField}
      setEditingField={setEditingField}
      onUpdateField={onUpdateExperienceField}
      onUpdateBullet={onUpdateExperienceBullet}
      onSetBullets={onSetExperienceBullets}
      onAddBullet={onAddExperienceBullet}
      onRemoveBullet={onRemoveExperienceBullet}
      onAddEntry={onAddExperience}
      onRemoveEntry={onRemoveExperience}
    />

    <TechExperienceSection
      title="Leadership Experience"
      section="leadership"
      entries={data.leadership}
      editingField={editingField}
      setEditingField={setEditingField}
      onUpdateField={onUpdateExperienceField}
      onUpdateBullet={onUpdateExperienceBullet}
      onSetBullets={onSetExperienceBullets}
      onAddBullet={onAddExperienceBullet}
      onRemoveBullet={onRemoveExperienceBullet}
      onAddEntry={onAddExperience}
      onRemoveEntry={onRemoveExperience}
    />

    <section className="resume-tech-section">
      <h2>Projects</h2>
      {data.projects.map((project) => (
        <article className="resume-job-entry" key={project.id}>
          <button
            type="button"
            className="resume-entry-delete"
            onClick={() => onRemoveProject(project.id)}
          >
            Delete
          </button>
          <div className="resume-entry-row">
            <InlineEditable
              fieldId={`tech.project.${project.id}.name`}
              value={project.name}
              editingField={editingField}
              setEditingField={setEditingField}
              onSave={(value) => onUpdateProjectField(project.id, "name", value)}
              className="company"
            />
            <InlineEditable
              fieldId={`tech.project.${project.id}.stack`}
              value={project.stack}
              editingField={editingField}
              setEditingField={setEditingField}
              onSave={(value) => onUpdateProjectField(project.id, "stack", value)}
              className="right"
            />
          </div>
          <ul className="resume-bullet-list">
            {project.bullets.map((bullet, index) => (
              <li key={`${project.id}-pb-${index}`} className="resume-bullet-row">
                <InlineEditable
                  fieldId={`tech.project.${project.id}.bullet.${index}`}
                  value={bullet}
                  editingField={editingField}
                  setEditingField={setEditingField}
                  onSave={(value) => onUpdateProjectBullet(project.id, index, value)}
                  multiline
                  fullWidthInput
                />
                <div className="resume-bullet-actions">
                  <button type="button" onClick={() => onAddProjectBullet(project.id, index)}>
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveProjectBullet(project.id, index)}
                  >
                    x
                  </button>
                <button
                  type="button"
                  onClick={async () => {
                    const key = `${project.id}.${index}`;
                    setProjectImprovingKey(key);
                    setProjectAiError("");
                    try {
                      const rewritten = await callClaude(
                        `Rewrite this resume bullet point to be more impactful. Use strong action verbs, quantify impact where possible, and make it concise. Keep it to one sentence.\n\nJob Title: ${project.name}\nCompany: ${project.stack}\nCurrent bullet: ${bullet}\n\nReturn only the rewritten bullet point, nothing else.`,
                      );
                      onUpdateProjectBullet(project.id, index, rewritten.replace(/^-\s*/, ""));
                    } catch (error) {
                      setProjectAiError(error instanceof Error ? error.message : "Unable to improve bullet");
                    } finally {
                      setProjectImprovingKey(null);
                    }
                  }}
                >
                  {projectImprovingKey === `${project.id}.${index}` ? "..." : "✨"}
                </button>
                </div>
              </li>
            ))}
          </ul>
        </article>
      ))}
      <button type="button" className="resume-add-entry" onClick={onAddProject}>
        Add Project
      </button>
      {projectAiError && <div className="resume-ai-error">{projectAiError}</div>}
    </section>

    <section className="resume-tech-section">
      <h2>Technical Skills</h2>
      <div className="skills-line">
        <strong>Languages: </strong>
        <InlineEditable
          fieldId="tech.skills.languages"
          value={data.skills.languages}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateSkills("languages", value)}
          fullWidthInput
        />
      </div>
      <div className="skills-line">
        <strong>Developer Tools: </strong>
        <InlineEditable
          fieldId="tech.skills.developerTools"
          value={data.skills.developerTools}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateSkills("developerTools", value)}
          fullWidthInput
        />
      </div>
      <div className="skills-line">
        <strong>Libraries/Frameworks: </strong>
        <InlineEditable
          fieldId="tech.skills.frameworks"
          value={data.skills.frameworks}
          editingField={editingField}
          setEditingField={setEditingField}
          onSave={(value) => onUpdateSkills("frameworks", value)}
          fullWidthInput
        />
      </div>
    </section>
  </div>
  );
};
