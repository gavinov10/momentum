import React, { useState, useCallback, useRef } from 'react';
import {
  defaultResumeData,
  createEmptyExperience,
  createEmptyEducation,
  type ResumeData,
  type ResumeTemplateId,
  type ResumeExperience,
  type ResumeEducation,
} from '../types/resume';
import { ResumePreview } from '../components/ResumeTemplates';

const TEMPLATES: { id: ResumeTemplateId; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'minimal', label: 'Minimal' },
];

export const ResumeGenerator: React.FC = () => {
  const [data, setData] = useState<ResumeData>(defaultResumeData);
  const [template, setTemplate] = useState<ResumeTemplateId>('professional');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const previewRef = useRef<HTMLDivElement>(null);

  const update = useCallback(<K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateExperience = useCallback((id: string, patch: Partial<ResumeExperience>) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const addExperience = useCallback(() => {
    setData((prev) => ({ ...prev, experience: [...prev.experience, createEmptyExperience()] }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  }, []);

  const updateExperienceBullet = useCallback((expId: string, index: number, value: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => {
        if (e.id !== expId) return e;
        const bullets = [...e.bullets];
        bullets[index] = value;
        return { ...e, bullets };
      }),
    }));
  }, []);

  const addBullet = useCallback((expId: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e
      ),
    }));
  }, []);

  const removeBullet = useCallback((expId: string, index: number) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => {
        if (e.id !== expId) return e;
        const bullets = e.bullets.filter((_, i) => i !== index);
        return { ...e, bullets: bullets.length ? bullets : [''] };
      }),
    }));
  }, []);

  const updateEducation = useCallback((id: string, patch: Partial<ResumeEducation>) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setData((prev) => ({ ...prev, education: [...prev.education, createEmptyEducation()] }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  }, []);

  const setSkillsFromString = useCallback((s: string) => {
    const skills = s.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
    update('skills', skills);
  }, [update]);

  const skillsString = data.skills.join(', ');

  const handleCopy = useCallback(async () => {
    if (!previewRef.current) return;
    const el = previewRef.current;
    const html = el.innerHTML;
    const copyStyles = `
      .resume-template{font-size:11px;line-height:1.4;color:#333}
      .resume-name{font-size:22px;font-weight:700;color:#094067}
      .resume-contact{font-size:10px;color:#555}
      .resume-section-title{font-size:12px;font-weight:700;color:#094067;text-transform:uppercase}
      .resume-job-role,.resume-edu-degree{font-weight:600;color:#232946}
      .resume-bullets{margin:4px 0;padding-left:16px}
      a{color:#094067;text-decoration:none}
    `;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${copyStyles}</style></head><body>${html}</body></html>`], { type: 'text/html' }),
          'text/plain': new Blob([el.innerText], { type: 'text/plain' }),
        }),
      ]);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="resume-generator">
      <div className="resume-generator-header">
        <h1>Resume Generator</h1>
        <p className="resume-generator-subtitle">Build a professional resume with a template, then copy or download as PDF.</p>
      </div>

      <div className="resume-generator-toolbar">
        <div className="resume-template-selector">
          <label>Template</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as ResumeTemplateId)}
            className="resume-template-select"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="resume-actions">
          <button type="button" className="resume-btn resume-btn-copy" onClick={handleCopy}>
            {copyStatus === 'success' ? 'Copied!' : copyStatus === 'error' ? 'Copy failed' : 'Copy to clipboard'}
          </button>
          <button type="button" className="resume-btn resume-btn-print" onClick={handlePrint}>
            Download / Print PDF
          </button>
        </div>
      </div>

      <div className="resume-generator-layout">
        <aside className="resume-form-panel">
          <section className="resume-form-section">
            <h2>Contact</h2>
            <div className="form-group">
              <label>Full name</label>
              <input value={data.name} onChange={(e) => update('name', e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 234 567 8900" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={data.location || ''} onChange={(e) => update('location', e.target.value)} placeholder="City, Country" />
            </div>
            <div className="form-group">
              <label>LinkedIn</label>
              <input value={data.linkedIn || ''} onChange={(e) => update('linkedIn', e.target.value)} placeholder="linkedin.com/in/username" />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input value={data.website || ''} onChange={(e) => update('website', e.target.value)} placeholder="https://..." />
            </div>
          </section>

          <section className="resume-form-section">
            <h2>Summary</h2>
            <div className="form-group">
              <textarea
                value={data.summary}
                onChange={(e) => update('summary', e.target.value)}
                placeholder="2–3 sentences about your experience and goals."
                rows={4}
              />
            </div>
          </section>

          <section className="resume-form-section">
            <div className="resume-form-section-head">
              <h2>Experience</h2>
              <button type="button" className="resume-btn resume-btn-add" onClick={addExperience}>+ Add</button>
            </div>
            {data.experience.map((exp) => (
              <div key={exp.id} className="resume-form-block">
                <div className="form-group">
                  <label>Role</label>
                  <input value={exp.role} onChange={(e) => updateExperience(exp.id, { role: e.target.value })} placeholder="Job title" />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} placeholder="Company name" />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input value={exp.location || ''} onChange={(e) => updateExperience(exp.id, { location: e.target.value })} placeholder="City" />
                </div>
                <div className="resume-form-row">
                  <div className="form-group">
                    <label>Start</label>
                    <input value={exp.startDate} onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} placeholder="YYYY-MM" />
                  </div>
                  <div className="form-group">
                    <label>End</label>
                    <input value={exp.endDate} onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })} placeholder="YYYY-MM or Present" disabled={exp.current} />
                  </div>
                  <div className="form-group resume-checkbox-group">
                    <label>
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate })} />
                      Current
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Bullet points</label>
                  {exp.bullets.map((b, i) => (
                    <div key={i} className="resume-bullet-row">
                      <input value={b} onChange={(e) => updateExperienceBullet(exp.id, i, e.target.value)} placeholder="Achievement or responsibility" />
                      <button type="button" className="resume-btn resume-btn-sm" onClick={() => removeBullet(exp.id, i)} aria-label="Remove bullet">−</button>
                    </div>
                  ))}
                  <button type="button" className="resume-btn resume-btn-sm resume-btn-add-bullet" onClick={() => addBullet(exp.id)}>+ Bullet</button>
                </div>
                <button type="button" className="resume-btn resume-btn-remove" onClick={() => removeExperience(exp.id)}>Remove job</button>
              </div>
            ))}
          </section>

          <section className="resume-form-section">
            <div className="resume-form-section-head">
              <h2>Education</h2>
              <button type="button" className="resume-btn resume-btn-add" onClick={addEducation}>+ Add</button>
            </div>
            {data.education.map((edu) => (
              <div key={edu.id} className="resume-form-block">
                <div className="form-group">
                  <label>School</label>
                  <input value={edu.school} onChange={(e) => updateEducation(edu.id, { school: e.target.value })} placeholder="University name" />
                </div>
                <div className="form-group">
                  <label>Degree</label>
                  <input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} placeholder="e.g. B.S. Computer Science" />
                </div>
                <div className="form-group">
                  <label>Field</label>
                  <input value={edu.field || ''} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} placeholder="Major / concentration" />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input value={edu.location || ''} onChange={(e) => updateEducation(edu.id, { location: e.target.value })} placeholder="City" />
                </div>
                <div className="resume-form-row">
                  <div className="form-group">
                    <label>Start</label>
                    <input value={edu.startDate} onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })} placeholder="YYYY" />
                  </div>
                  <div className="form-group">
                    <label>End</label>
                    <input value={edu.endDate} onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })} placeholder="YYYY" />
                  </div>
                </div>
                <div className="form-group">
                  <label>GPA (optional)</label>
                  <input value={edu.gpa || ''} onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })} placeholder="e.g. 3.8" />
                </div>
                <button type="button" className="resume-btn resume-btn-remove" onClick={() => removeEducation(edu.id)}>Remove education</button>
              </div>
            ))}
          </section>

          <section className="resume-form-section">
            <h2>Skills</h2>
            <div className="form-group">
              <input
                value={skillsString}
                onChange={(e) => setSkillsFromString(e.target.value)}
                placeholder="Comma or semicolon separated, e.g. JavaScript, Python, SQL"
              />
            </div>
          </section>
        </aside>

        <div className="resume-preview-panel">
          <div className="resume-preview-paper" ref={previewRef}>
            <ResumePreview data={data} template={template} forPrint={false} />
          </div>
        </div>
      </div>

      {/* Print-only copy of the resume for PDF */}
      <div className="resume-print-only" aria-hidden="true">
        <div className="resume-preview-paper resume-preview-paper-print">
          <ResumePreview data={data} template={template} forPrint />
        </div>
      </div>
    </div>
  );
};
