export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  school: string;
  degree: string;
  field?: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedIn?: string;
  website?: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
}

/** Template keys — labels shown in UI are in `ResumeGenerator.tsx` */
export type ResumeTemplateId = "business" | "academic" | "tech";

export const defaultResumeData: ResumeData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedIn: '',
  website: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

export const createEmptyExperience = (): ResumeExperience => ({
  id: crypto.randomUUID(),
  company: '',
  role: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  bullets: [''],
});

export const createEmptyEducation = (): ResumeEducation => ({
  id: crypto.randomUUID(),
  school: '',
  degree: '',
  field: '',
  location: '',
  startDate: '',
  endDate: '',
  gpa: '',
});
