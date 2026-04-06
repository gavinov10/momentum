/**
 * Resume layouts live here (structure + which fields show).
 * Visual “exact format” (fonts, spacing, colors, borders): `App.css` under
 * `.resume-template-compsci1`, `.resume-template-compsci2`, `.resume-template-business`.
 */
import React from 'react';
import type { ResumeData, ResumeTemplateId } from '../types/resume';

interface ResumePreviewProps {
  data: ResumeData;
  template: ResumeTemplateId;
  className?: string;
  forPrint?: boolean;
}

const formatDateRange = (start: string, end: string, current: boolean) => {
  if (!start && !end) return '';
  const s = start || '—';
  const e = current ? 'Present' : (end || '—');
  return `${s} – ${e}`;
};

const linkHref = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

const ResumeHeader: React.FC<{
  data: ResumeData;
  sep: string;
}> = ({ data, sep }) => {
  const contact = [data.email, data.phone, data.location].filter(Boolean).join(sep);
  return (
    <header className="resume-header">
      <h1 className="resume-name">{data.name || 'Your Name'}</h1>
      {(contact || data.linkedIn || data.website) && (
        <div className="resume-contact">
          {contact}
          {data.linkedIn && (
            <>
              {sep}
              <a href={linkHref(data.linkedIn)} rel="noopener noreferrer" target="_blank">LinkedIn</a>
            </>
          )}
          {data.website && (
            <>
              {sep}
              <a href={linkHref(data.website)} rel="noopener noreferrer" target="_blank">Website</a>
            </>
          )}
        </div>
      )}
    </header>
  );
};

const ResumeSections: React.FC<{ data: ResumeData; summaryTitle: string; skillsSep: string }> = ({
  data,
  summaryTitle,
  skillsSep,
}) => (
  <>
    {data.summary && (
      <section className="resume-section">
        <h2 className="resume-section-title">{summaryTitle}</h2>
        <p className="resume-summary">{data.summary}</p>
      </section>
    )}
    {data.education.length > 0 && (
      <section className="resume-section">
        <h2 className="resume-section-title">Education</h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="resume-edu">
            <div className="resume-edu-header">
              <span className="resume-edu-degree">
                {edu.degree}
                {edu.field ? ` in ${edu.field}` : ''}
              </span>
              <span className="resume-edu-date">{formatDateRange(edu.startDate, edu.endDate, false)}</span>
            </div>
            <div className="resume-edu-school">
              {edu.school}
              {edu.location ? `, ${edu.location}` : ''}
            </div>
            {edu.gpa && <div className="resume-edu-gpa">GPA: {edu.gpa}</div>}
          </div>
        ))}
      </section>
    )}
    {data.experience.length > 0 && (
      <section className="resume-section">
        <h2 className="resume-section-title">Experience</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="resume-job">
            <div className="resume-job-header">
              <span className="resume-job-role">{exp.role || 'Role'}</span>
              <span className="resume-job-date">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</span>
            </div>
            <div className="resume-job-company">
              {exp.company}
              {exp.location ? `, ${exp.location}` : ''}
            </div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="resume-bullets">
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    )}
    {data.skills.filter(Boolean).length > 0 && (
      <section className="resume-section">
        <h2 className="resume-section-title">Skills</h2>
        <p className="resume-skills">{data.skills.filter(Boolean).join(skillsSep)}</p>
      </section>
    )}
  </>
);

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template, className = '', forPrint }) => {
  if (template === 'compsci2') {
    return (
      <div className={`resume-template resume-template-compsci2 ${className}`.trim()} data-for-print={forPrint}>
        <ResumeHeader data={data} sep=" | " />
        <ResumeSections data={data} summaryTitle="Profile" skillsSep=" • " />
      </div>
    );
  }
  if (template === 'business') {
    return (
      <div className={`resume-template resume-template-business ${className}`.trim()} data-for-print={forPrint}>
        <ResumeHeader data={data} sep=" · " />
        <ResumeSections data={data} summaryTitle="Professional summary" skillsSep=" · " />
      </div>
    );
  }
  return (
    <div className={`resume-template resume-template-compsci1 ${className}`.trim()} data-for-print={forPrint}>
      <ResumeHeader data={data} sep=" • " />
      <ResumeSections data={data} summaryTitle="Summary" skillsSep=" • " />
    </div>
  );
};
