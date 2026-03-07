import React from 'react';
import type { ResumeData, ResumeTemplateId } from '../types/resume';

interface ResumePreviewProps {
  data: ResumeData;
  template: ResumeTemplateId;
  className?: string;
  /** When true, used for print/PDF (e.g. hide decorative elements) */
  forPrint?: boolean;
}

const formatDateRange = (start: string, end: string, current: boolean) => {
  if (!start && !end) return '';
  const s = start || '—';
  const e = current ? 'Present' : (end || '—');
  return `${s} – ${e}`;
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template, className = '', forPrint }) => {
  if (template === 'minimal') {
    return <MinimalTemplate data={data} className={className} forPrint={forPrint} />;
  }
  return <ProfessionalTemplate data={data} className={className} forPrint={forPrint} />;
};

const ProfessionalTemplate: React.FC<{ data: ResumeData; className?: string; forPrint?: boolean }> = ({
  data,
  className,
  forPrint,
}) => {
  const contact = [data.email, data.phone, data.location].filter(Boolean).join(' • ');
  return (
    <div className={`resume-template resume-template-professional ${className}`} data-for-print={forPrint}>
      <header className="resume-header">
        <h1 className="resume-name">{data.name || 'Your Name'}</h1>
        {(contact || data.linkedIn || data.website) && (
          <div className="resume-contact">
            {contact}
            {data.linkedIn && <> • <a href={data.linkedIn.startsWith('http') ? data.linkedIn : `https://${data.linkedIn}`} rel="noopener noreferrer" target="_blank">LinkedIn</a></>}
            {data.website && <> • <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} rel="noopener noreferrer" target="_blank">Website</a></>}
          </div>
        )}
      </header>
      {data.summary && (
        <section className="resume-section">
          <h2 className="resume-section-title">Summary</h2>
          <p className="resume-summary">{data.summary}</p>
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
              <div className="resume-job-company">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
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
      {data.education.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="resume-edu">
              <div className="resume-edu-header">
                <span className="resume-edu-degree">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                <span className="resume-edu-date">{formatDateRange(edu.startDate, edu.endDate, false)}</span>
              </div>
              <div className="resume-edu-school">{edu.school}{edu.location ? `, ${edu.location}` : ''}</div>
              {edu.gpa && <div className="resume-edu-gpa">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </section>
      )}
      {data.skills.filter(Boolean).length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Skills</h2>
          <p className="resume-skills">{data.skills.filter(Boolean).join(' • ')}</p>
        </section>
      )}
    </div>
  );
};

const MinimalTemplate: React.FC<{ data: ResumeData; className?: string; forPrint?: boolean }> = ({
  data,
  className,
  forPrint,
}) => {
  const contact = [data.email, data.phone, data.location].filter(Boolean).join(' · ');
  return (
    <div className={`resume-template resume-template-minimal ${className}`} data-for-print={forPrint}>
      <header className="resume-header minimal-header">
        <h1 className="resume-name minimal-name">{data.name || 'Your Name'}</h1>
        {(contact || data.linkedIn || data.website) && (
          <div className="resume-contact minimal-contact">
            {contact}
            {data.linkedIn && <> · <a href={data.linkedIn.startsWith('http') ? data.linkedIn : `https://${data.linkedIn}`} rel="noopener noreferrer" target="_blank">LinkedIn</a></>}
            {data.website && <> · <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} rel="noopener noreferrer" target="_blank">Website</a></>}
          </div>
        )}
      </header>
      {data.summary && (
        <section className="resume-section minimal-section">
          <h2 className="resume-section-title minimal-title">Summary</h2>
          <p className="resume-summary minimal-summary">{data.summary}</p>
        </section>
      )}
      {data.experience.length > 0 && (
        <section className="resume-section minimal-section">
          <h2 className="resume-section-title minimal-title">Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="resume-job minimal-job">
              <div className="resume-job-header minimal-job-header">
                <span className="resume-job-role">{exp.role || 'Role'}</span>
                <span className="resume-job-date minimal-date">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</span>
              </div>
              <div className="resume-job-company minimal-company">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="resume-bullets minimal-bullets">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
      {data.education.length > 0 && (
        <section className="resume-section minimal-section">
          <h2 className="resume-section-title minimal-title">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="resume-edu minimal-edu">
              <div className="resume-edu-header minimal-edu-header">
                <span className="resume-edu-degree">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                <span className="resume-edu-date minimal-date">{formatDateRange(edu.startDate, edu.endDate, false)}</span>
              </div>
              <div className="resume-edu-school minimal-school">{edu.school}{edu.location ? `, ${edu.location}` : ''}</div>
              {edu.gpa && <div className="resume-edu-gpa">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </section>
      )}
      {data.skills.filter(Boolean).length > 0 && (
        <section className="resume-section minimal-section">
          <h2 className="resume-section-title minimal-title">Skills</h2>
          <p className="resume-skills minimal-skills">{data.skills.filter(Boolean).join(' · ')}</p>
        </section>
      )}
    </div>
  );
};
