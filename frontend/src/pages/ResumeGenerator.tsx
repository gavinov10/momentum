import React, { useEffect, useState } from "react";
import BusinessResumeTemplate, {
  AcademicResumeTemplate,
  type AcademicEntry,
  type AcademicResumeData,
  type BusinessJob,
  type BusinessResumeData,
  TechResumeTemplate,
  type TechExperienceEntry,
  type TechProjectEntry,
  type TechResumeData,
} from "../components/ResumeTemplates";

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

const callClaude = async (prompt: string): Promise<string> => {
  if (!ANTHROPIC_API_KEY) throw new Error("Missing VITE_ANTHROPIC_API_KEY");
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
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) throw new Error("AI request failed");
  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error("No AI response");
  return text;
};

const createJob = (overrides?: Partial<BusinessJob>): BusinessJob => ({
  id: crypto.randomUUID(),
  company: "Company Name",
  location: "City, ST",
  title: "Job Title",
  dateRange: "Month 20XX – Month 20XX",
  bullets: ["Describe impact and outcome.", "Add a concrete accomplishment."],
  ...overrides,
});

const createAcademicEntry = (overrides?: Partial<AcademicEntry>): AcademicEntry => ({
  id: crypto.randomUUID(),
  organization: "Organization Name",
  title: "Role Title",
  location: "City, ST",
  dateRange: "Month 20xx - Month 20xx",
  bullets: ["Add impact statement.", "Add another achievement."],
  ...overrides,
});

const createTechExperience = (
  overrides?: Partial<TechExperienceEntry>,
): TechExperienceEntry => ({
  id: crypto.randomUUID(),
  company: "Company Name",
  dateRange: "Month 20XX – Month 20XX",
  title: "Role Title",
  location: "City, ST",
  bullets: ["Metric-driven impact bullet."],
  ...overrides,
});

const createTechProject = (overrides?: Partial<TechProjectEntry>): TechProjectEntry => ({
  id: crypto.randomUUID(),
  name: "Project Name",
  stack: "React | Node.js | PostgreSQL",
  bullets: ["Built a product used by 1,000+ users."],
  ...overrides,
});

const INITIAL_RESUME: BusinessResumeData = {
  name: "Will D. Cat",
  phone: "(610) 555-5555",
  email: "willdcat@villanova.edu",
  linkedin: "linkedin.com/in/your_linkedin",
  education: {
    school: "Villanova University",
    location: "Villanova, PA",
    degree: "Bachelor of Business Administration in Finance",
    date: "May 20XX",
    bullets: [
      "GPA: 3.80 | Honors: Cum Laude, Dean's List (8 Semesters)",
      "Relevant Coursework: Solving Complex Business Problems, Strategic Thinking",
    ],
  },
  professional: [
    createJob({
      company: "Presidential Financial",
      location: "New York, NY",
      title: "Quasi-Markets Financial Intern",
      dateRange: "June 20XX – August 20XX",
      bullets: [
        "Provided support through modeling and data analysis projects",
        "Developed weekly analysis producing actionable insights presented to team",
        "Led a team of six to devise a $100MM strategic acquisition presentation",
      ],
    }),
    createJob({
      company: "GEN FKP Consulting",
      location: "Washington, DC",
      title: "Case Competition Participant",
      dateRange: "August 20XX",
      bullets: [
        "Led a team of five to craft a robust presentation solving a case question",
      ],
    }),
  ],
  relevant: [
    createJob({
      company: "Villanova Consulting Group",
      location: "Villanova, PA",
      title: "Co-President",
      dateRange: "January 20XX – May 20XX",
      bullets: [
        "Organized professional development events for 200 students",
        "Led Villanova Consulting Bootcamp with 35 members",
      ],
    }),
    createJob({
      company: "Council of Presidents",
      location: "Villanova, PA",
      title: "Senior President",
      dateRange: "June 20XX – May 20XX",
      bullets: [
        "Fostered collaboration with Center for Professional Development",
        "Spearheaded fundraisers raising over $3,000",
      ],
    }),
  ],
  skillsLines: [
    "Language: English (Native), Spanish (Fluent)",
    "Technical Skills: Microsoft Office Suite, Tableau",
    "Certifications & Training: Bloomberg Terminal, Google Analytics",
    "Activities: Member of Kappa Kappa Sorority, NOVAdance Volunteer",
  ],
};

const INITIAL_ACADEMIC_RESUME: AcademicResumeData = {
  name: "Matt Smith",
  email: "student@wharton.upenn.edu",
  phone: "(919) 555-1212",
  schoolAddress:
    "School Address: Harnwell College House, 3820 Locust Walk, Philadelphia, PA 19104",
  permanentAddress: "Permanent Address: 11 Palm Lane, Dubai, U.A.E.",
  education: [
    {
      id: crypto.randomUUID(),
      school: "University of Pennsylvania, Jerome Fisher Program",
      location: "Philadelphia, PA",
      date: "May 20xx",
      bullets: [
        "School of Engineering: BSE in Computer Science, Minor in Mathematics",
        "The Wharton School: BS in Economics, Concentrations in Finance and Management",
        "Cumulative GPA: 3.72/4.00 | Honors: Wharton Dean's List & Engineering Dean's List",
      ],
    },
    {
      id: crypto.randomUUID(),
      school: "Dubai College (High School)",
      location: "Dubai, U.A.E.",
      date: "June 20xx",
      bullets: [
        "SAT Scores: Math 780 | Writing 760 | Reading 730",
        "A Levels: Mathematics A*, Physics A*, Chemistry A*, Economics A*",
      ],
    },
  ],
  professional: [
    createAcademicEntry({
      organization: "Wharton Small Business Development Center, Consultant",
      dateRange: "October 20xx - Present",
      location: "Philadelphia, PA",
      bullets: [
        "Consulted for real estate appraisal management software company ($7MM annual sales)",
        "Analyzed market space and estimated $30MM revenue potential for new product",
        "Developed Excel interactive sales tool to communicate economic value to customers",
      ],
    }),
    createAcademicEntry({
      organization: "Management & Technology Summer Institute, Teaching Assistant",
      dateRange: "July 20xx - August 20xx",
      location: "Philadelphia, PA",
      bullets: [
        "Supervised 50 high-achieving high-school students through Engineering Entrepreneurship course",
        "Advised students on business plans and getting to market strategies",
      ],
    }),
  ],
  leadership: [
    createAcademicEntry({
      organization: "Penn Cricket Club, Vice-President",
      dateRange: "August 20xx - Present",
      location: "Philadelphia, PA",
      bullets: [
        "Elected by board members to promote growth and success of club at Penn",
        "Coordinated weekly training sessions and assisted with team selection",
      ],
    }),
    createAcademicEntry({
      organization: "Dubai College, Deputy Head Boy",
      dateRange: "May 20xx - May 20xx",
      location: "Dubai, U.A.E.",
      bullets: [
        "Elected by 100 staff and 120 students as leader of Senior Student Body",
        "Managed multiple administrative duties and academic changes",
      ],
    }),
  ],
  honors: [
    createAcademicEntry({
      organization: "PennApps, Best Use of Plaid API Prize Winner",
      dateRange: "September 20xx",
      location: "",
      bullets: [
        "Developed back-end of Pava, an interactive website displaying bank statements",
        "Employed Stochastic Gradient Descent to predict interest level of transactions",
      ],
    }),
    createAcademicEntry({
      organization: "Penn Cricket Club",
      dateRange: "August 20xx - Present",
      location: "",
      bullets: [
        "Selected as MVP American College Cricket Ivy League Championship",
      ],
    }),
  ],
  skillsLines: [
    "Language: Conversational French",
    "Computer Skills: Fluent in Java; proficient in C, OCaml and Arduino; familiar with Python",
    "Interests: Basketball | Squash | Soccer | Badminton | Gaming",
  ],
};

const INITIAL_TECH_RESUME: TechResumeData = {
  name: "Erik Cupsa",
  email: "erikcupsa@gmail.com",
  linkedin: "linkedin.com/in/erik-cupsa",
  github: "github.com/erik-cupsa",
  portfolio: "erikc-portfolio.vercel.app",
  education: {
    school: "McGill University",
    expectedDate: "Expected: May 2026",
    degreeLine: "Bachelor of Computer Engineering | Minor AI",
    location: "Montreal, QC",
    bullets: ["Golden Key Honours Scholar | GPA: 3.78/4.0"],
  },
  work: [
    createTechExperience({
      company: "Autodesk",
      dateRange: "Jan 2025 – Apr 2025",
      title: "Backend Engineer Intern",
      location: "Montreal, QC",
      bullets: [
        "Leveraged Spring Boot and AWS to develop and optimize scalable software solutions",
      ],
    }),
    createTechExperience({
      company: "TRC Companies, Inc.",
      dateRange: "May 2024 – Sep 2024",
      title: "Machine Learning Engineer Intern",
      location: "Montreal, QC",
      bullets: [
        "Engineered LLMs including BERT to analyze requirements, improving efficiency by 37%",
        "Analyzed 1,200+ requirements monthly, saving $20,000 annually",
        "Reduced processing time from 5 to 3 minutes via Flask API with Redis caching",
      ],
    }),
    createTechExperience({
      company: "TRC Companies, Inc.",
      dateRange: "May 2023 – Sep 2023",
      title: "Backend Engineer Intern",
      location: "Montreal, QC",
      bullets: [
        "Designed 30+ AWS Lambda Functions, increasing processing speed by 35%",
        "Implemented 15+ serverless workflows using AWS Step Functions",
        "Built a Spring Boot app containerized with Docker, deployed on AWS EC2",
      ],
    }),
    createTechExperience({
      company: "Government of Canada",
      dateRange: "Jun 2022 – Sep 2022",
      title: "Software Engineer Intern",
      location: "Gatineau, QC",
      bullets: [
        "Deployed Python-based data migration pipeline on Azure, 50% reduction in transfer time",
        "Centralized SQL database on Azure, improving query performance by 30% for 50+ users",
      ],
    }),
  ],
  leadership: [
    createTechExperience({
      company: "Chief Technology Officer (CTO), Empor",
      dateRange: "Jun 2024 - Present",
      title: "",
      location: "",
      bullets: [
        "Drove 100% of technical strategy using Spring Boot, Next.js, and Prisma",
        "Integrated Stripe payments, WebSocket messaging, contributing to 30% monthly growth",
      ],
    }),
    createTechExperience({
      company: "SWErikCodes | Instagram | YouTube | TikTok",
      dateRange: "Jun 2023 – Present",
      title: "",
      location: "",
      bullets: [
        "Created educational coding content for 100,000+ developers",
        "Produced tutorials on data structures, algorithms, and software design",
      ],
    }),
  ],
  projects: [
    createTechProject({
      name: "McGill Scheduler",
      stack: "ReactJS | Spring Boot | PostgreSQL",
      bullets: [
        "Full-stack web app enhancing academic experience of 1,000+ McGill students",
      ],
    }),
    createTechProject({
      name: "On-Orbit Collision Predictor",
      stack: "Django | Scikit-Learn | NextJS",
      bullets: [
        "ML model to predict satellite collisions for the Canadian Space Agency",
      ],
    }),
  ],
  skills: {
    languages: "Java, Python, JavaScript, TypeScript, SQL, HTML5, CSS, C",
    developerTools: "AWS, Postman, Git, Docker, Prisma, Azure, Jira",
    frameworks: "Spring Boot, ReactJS, NextJS, NodeJS, Flask",
  },
};

export const ResumeGenerator: React.FC = () => {
  const [template, setTemplate] = useState<"business" | "academic" | "tech">(
    "business",
  );
  const [data, setData] = useState<BusinessResumeData>(INITIAL_RESUME);
  const [academicData, setAcademicData] =
    useState<AcademicResumeData>(INITIAL_ACADEMIC_RESUME);
  const [techData, setTechData] = useState<TechResumeData>(INITIAL_TECH_RESUME);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [isCoverLetterExpanded, setIsCoverLetterExpanded] = useState(false);
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState("");

  useEffect(() => {
    if (!showCoverLetterModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCoverLetterModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCoverLetterModal]);

  const updateRoot = (
    field: "name" | "phone" | "email" | "linkedin",
    value: string,
  ) => {
    setData((previous) => ({ ...previous, [field]: value }));
  };

  const updateEducation = (
    field: "school" | "location" | "degree" | "date",
    value: string,
  ) => {
    setData((previous) => ({
      ...previous,
      education: { ...previous.education, [field]: value },
    }));
  };

  const updateEducationBullet = (index: number, value: string) => {
    setData((previous) => {
      const bullets = [...previous.education.bullets];
      bullets[index] = value;
      return { ...previous, education: { ...previous.education, bullets } };
    });
  };

  const addEducationBullet = (index: number) => {
    setData((previous) => {
      const bullets = [...previous.education.bullets];
      bullets.splice(index + 1, 0, "New bullet");
      return { ...previous, education: { ...previous.education, bullets } };
    });
  };

  const removeEducationBullet = (index: number) => {
    setData((previous) => {
      const bullets = previous.education.bullets.filter((_, i) => i !== index);
      return {
        ...previous,
        education: {
          ...previous.education,
          bullets: bullets.length ? bullets : ["New bullet"],
        },
      };
    });
  };

  const updateJob = (
    section: "professional" | "relevant",
    jobId: string,
    field: "company" | "location" | "title" | "dateRange",
    value: string,
  ) => {
    setData((previous) => ({
      ...previous,
      [section]: previous[section].map((job) =>
        job.id === jobId ? { ...job, [field]: value } : job,
      ),
    }));
  };

  const updateJobBullet = (
    section: "professional" | "relevant",
    jobId: string,
    bulletIndex: number,
    value: string,
  ) => {
    setData((previous) => ({
      ...previous,
      [section]: previous[section].map((job) => {
        if (job.id !== jobId) return job;
        const bullets = [...job.bullets];
        bullets[bulletIndex] = value;
        return { ...job, bullets };
      }),
    }));
  };

  const setJobBullets = (
    section: "professional" | "relevant",
    jobId: string,
    bullets: string[],
  ) => {
    setData((previous) => ({
      ...previous,
      [section]: previous[section].map((job) =>
        job.id === jobId ? { ...job, bullets: bullets.length ? bullets : ["New bullet"] } : job,
      ),
    }));
  };

  const addJobBullet = (
    section: "professional" | "relevant",
    jobId: string,
    bulletIndex: number,
  ) => {
    setData((previous) => ({
      ...previous,
      [section]: previous[section].map((job) => {
        if (job.id !== jobId) return job;
        const bullets = [...job.bullets];
        bullets.splice(bulletIndex + 1, 0, "New bullet");
        return { ...job, bullets };
      }),
    }));
  };

  const removeJobBullet = (
    section: "professional" | "relevant",
    jobId: string,
    bulletIndex: number,
  ) => {
    setData((previous) => ({
      ...previous,
      [section]: previous[section].map((job) => {
        if (job.id !== jobId) return job;
        const bullets = job.bullets.filter((_, index) => index !== bulletIndex);
        return { ...job, bullets: bullets.length ? bullets : ["New bullet"] };
      }),
    }));
  };

  const addJob = (section: "professional" | "relevant") => {
    setData((previous) => ({
      ...previous,
      [section]: [...previous[section], createJob()],
    }));
  };

  const removeJob = (section: "professional" | "relevant", jobId: string) => {
    setData((previous) => {
      const filtered = previous[section].filter((job) => job.id !== jobId);
      return {
        ...previous,
        [section]: filtered.length ? filtered : previous[section],
      };
    });
  };

  const updateSkillsLine = (lineIndex: number, value: string) => {
    setData((previous) => {
      const next = [...previous.skillsLines];
      next[lineIndex] = value;
      return { ...previous, skillsLines: next };
    });
  };

  const updateAcademicHeader = (
    field: "name" | "email" | "phone" | "schoolAddress" | "permanentAddress",
    value: string,
  ) => {
    setAcademicData((previous) => ({ ...previous, [field]: value }));
  };

  const updateAcademicEducationField = (
    id: string,
    field: "school" | "location" | "date",
    value: string,
  ) => {
    setAcademicData((previous) => ({
      ...previous,
      education: previous.education.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const updateAcademicEducationBullet = (id: string, index: number, value: string) => {
    setAcademicData((previous) => ({
      ...previous,
      education: previous.education.map((entry) => {
        if (entry.id !== id) return entry;
        const bullets = [...entry.bullets];
        bullets[index] = value;
        return { ...entry, bullets };
      }),
    }));
  };

  const addAcademicEducationBullet = (id: string, index: number) => {
    setAcademicData((previous) => ({
      ...previous,
      education: previous.education.map((entry) => {
        if (entry.id !== id) return entry;
        const bullets = [...entry.bullets];
        bullets.splice(index + 1, 0, "New bullet");
        return { ...entry, bullets };
      }),
    }));
  };

  const removeAcademicEducationBullet = (id: string, index: number) => {
    setAcademicData((previous) => ({
      ...previous,
      education: previous.education.map((entry) => {
        if (entry.id !== id) return entry;
        const bullets = entry.bullets.filter((_, bulletIndex) => bulletIndex !== index);
        return { ...entry, bullets: bullets.length ? bullets : ["New bullet"] };
      }),
    }));
  };

  const updateAcademicEntryField = (
    section: "professional" | "leadership" | "honors",
    id: string,
    field: "organization" | "title" | "location" | "dateRange",
    value: string,
  ) => {
    setAcademicData((previous) => ({
      ...previous,
      [section]: previous[section].map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const updateAcademicEntryBullet = (
    section: "professional" | "leadership" | "honors",
    id: string,
    index: number,
    value: string,
  ) => {
    setAcademicData((previous) => ({
      ...previous,
      [section]: previous[section].map((entry) => {
        if (entry.id !== id) return entry;
        const bullets = [...entry.bullets];
        bullets[index] = value;
        return { ...entry, bullets };
      }),
    }));
  };

  const setAcademicEntryBullets = (
    section: "professional" | "leadership" | "honors",
    id: string,
    bullets: string[],
  ) => {
    setAcademicData((previous) => ({
      ...previous,
      [section]: previous[section].map((entry) =>
        entry.id === id ? { ...entry, bullets: bullets.length ? bullets : ["New bullet"] } : entry,
      ),
    }));
  };

  const addAcademicEntryBullet = (
    section: "professional" | "leadership" | "honors",
    id: string,
    index: number,
  ) => {
    setAcademicData((previous) => ({
      ...previous,
      [section]: previous[section].map((entry) => {
        if (entry.id !== id) return entry;
        const bullets = [...entry.bullets];
        bullets.splice(index + 1, 0, "New bullet");
        return { ...entry, bullets };
      }),
    }));
  };

  const removeAcademicEntryBullet = (
    section: "professional" | "leadership" | "honors",
    id: string,
    index: number,
  ) => {
    setAcademicData((previous) => ({
      ...previous,
      [section]: previous[section].map((entry) => {
        if (entry.id !== id) return entry;
        const bullets = entry.bullets.filter((_, bulletIndex) => bulletIndex !== index);
        return { ...entry, bullets: bullets.length ? bullets : ["New bullet"] };
      }),
    }));
  };

  const addAcademicEntry = (section: "professional" | "leadership" | "honors") => {
    setAcademicData((previous) => ({
      ...previous,
      [section]: [...previous[section], createAcademicEntry()],
    }));
  };

  const removeAcademicEntry = (
    section: "professional" | "leadership" | "honors",
    id: string,
  ) => {
    setAcademicData((previous) => {
      const filtered = previous[section].filter((entry) => entry.id !== id);
      return { ...previous, [section]: filtered.length ? filtered : previous[section] };
    });
  };

  const updateAcademicSkillsLine = (index: number, value: string) => {
    setAcademicData((previous) => {
      const skillsLines = [...previous.skillsLines];
      skillsLines[index] = value;
      return { ...previous, skillsLines };
    });
  };

  const updateTechHeader = (
    field: "name" | "email" | "linkedin" | "github" | "portfolio",
    value: string,
  ) => {
    setTechData((previous) => ({ ...previous, [field]: value }));
  };

  const updateTechEducation = (
    field: "school" | "expectedDate" | "degreeLine" | "location",
    value: string,
  ) => {
    setTechData((previous) => ({
      ...previous,
      education: { ...previous.education, [field]: value },
    }));
  };

  const updateTechEducationBullet = (index: number, value: string) => {
    setTechData((previous) => {
      const bullets = [...previous.education.bullets];
      bullets[index] = value;
      return { ...previous, education: { ...previous.education, bullets } };
    });
  };

  const addTechEducationBullet = (index: number) => {
    setTechData((previous) => {
      const bullets = [...previous.education.bullets];
      bullets.splice(index + 1, 0, "New bullet");
      return { ...previous, education: { ...previous.education, bullets } };
    });
  };

  const removeTechEducationBullet = (index: number) => {
    setTechData((previous) => {
      const bullets = previous.education.bullets.filter((_, i) => i !== index);
      return {
        ...previous,
        education: { ...previous.education, bullets: bullets.length ? bullets : ["New bullet"] },
      };
    });
  };

  const updateTechExperienceField = (
    section: "work" | "leadership",
    id: string,
    field: "company" | "dateRange" | "title" | "location",
    value: string,
  ) => {
    setTechData((previous) => ({
      ...previous,
      [section]: previous[section].map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const updateTechExperienceBullet = (
    section: "work" | "leadership",
    id: string,
    index: number,
    value: string,
  ) => {
    setTechData((previous) => ({
      ...previous,
      [section]: previous[section].map((entry) => {
        if (entry.id !== id) return entry;
        const bullets = [...entry.bullets];
        bullets[index] = value;
        return { ...entry, bullets };
      }),
    }));
  };

  const setTechExperienceBullets = (
    section: "work" | "leadership",
    id: string,
    bullets: string[],
  ) => {
    setTechData((previous) => ({
      ...previous,
      [section]: previous[section].map((entry) =>
        entry.id === id ? { ...entry, bullets: bullets.length ? bullets : ["New bullet"] } : entry,
      ),
    }));
  };

  const addTechExperienceBullet = (
    section: "work" | "leadership",
    id: string,
    index: number,
  ) => {
    setTechData((previous) => ({
      ...previous,
      [section]: previous[section].map((entry) => {
        if (entry.id !== id) return entry;
        const bullets = [...entry.bullets];
        bullets.splice(index + 1, 0, "New bullet");
        return { ...entry, bullets };
      }),
    }));
  };

  const removeTechExperienceBullet = (
    section: "work" | "leadership",
    id: string,
    index: number,
  ) => {
    setTechData((previous) => ({
      ...previous,
      [section]: previous[section].map((entry) => {
        if (entry.id !== id) return entry;
        const bullets = entry.bullets.filter((_, bulletIndex) => bulletIndex !== index);
        return { ...entry, bullets: bullets.length ? bullets : ["New bullet"] };
      }),
    }));
  };

  const addTechExperience = (section: "work" | "leadership") => {
    setTechData((previous) => ({
      ...previous,
      [section]: [...previous[section], createTechExperience()],
    }));
  };

  const removeTechExperience = (section: "work" | "leadership", id: string) => {
    setTechData((previous) => {
      const filtered = previous[section].filter((entry) => entry.id !== id);
      return { ...previous, [section]: filtered.length ? filtered : previous[section] };
    });
  };

  const updateTechProjectField = (
    id: string,
    field: "name" | "stack",
    value: string,
  ) => {
    setTechData((previous) => ({
      ...previous,
      projects: previous.projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project,
      ),
    }));
  };

  const updateTechProjectBullet = (id: string, index: number, value: string) => {
    setTechData((previous) => ({
      ...previous,
      projects: previous.projects.map((project) => {
        if (project.id !== id) return project;
        const bullets = [...project.bullets];
        bullets[index] = value;
        return { ...project, bullets };
      }),
    }));
  };

  const addTechProjectBullet = (id: string, index: number) => {
    setTechData((previous) => ({
      ...previous,
      projects: previous.projects.map((project) => {
        if (project.id !== id) return project;
        const bullets = [...project.bullets];
        bullets.splice(index + 1, 0, "New bullet");
        return { ...project, bullets };
      }),
    }));
  };

  const removeTechProjectBullet = (id: string, index: number) => {
    setTechData((previous) => ({
      ...previous,
      projects: previous.projects.map((project) => {
        if (project.id !== id) return project;
        const bullets = project.bullets.filter((_, bulletIndex) => bulletIndex !== index);
        return { ...project, bullets: bullets.length ? bullets : ["New bullet"] };
      }),
    }));
  };

  const addTechProject = () => {
    setTechData((previous) => ({
      ...previous,
      projects: [...previous.projects, createTechProject()],
    }));
  };

  const removeTechProject = (id: string) => {
    setTechData((previous) => {
      const projects = previous.projects.filter((project) => project.id !== id);
      return { ...previous, projects: projects.length ? projects : previous.projects };
    });
  };

  const updateTechSkills = (
    field: "languages" | "developerTools" | "frameworks",
    value: string,
  ) => {
    setTechData((previous) => ({
      ...previous,
      skills: { ...previous.skills, [field]: value },
    }));
  };

  const buildResumeTextSummary = () => {
    if (template === "business") {
      return [
        `Name: ${data.name}`,
        `Education: ${data.education.school}, ${data.education.degree}`,
        `Professional Experience: ${data.professional.map((entry) => `${entry.title} at ${entry.company}`).join("; ")}`,
        `Relevant Experience: ${data.relevant.map((entry) => `${entry.title} at ${entry.company}`).join("; ")}`,
        `Skills: ${data.skillsLines.join(" | ")}`,
      ].join("\n");
    }
    if (template === "academic") {
      return [
        `Name: ${academicData.name}`,
        `Education: ${academicData.education.map((entry) => entry.school).join("; ")}`,
        `Professional Experience: ${academicData.professional.map((entry) => `${entry.organization} (${entry.dateRange})`).join("; ")}`,
        `Leadership: ${academicData.leadership.map((entry) => entry.organization).join("; ")}`,
        `Honors: ${academicData.honors.map((entry) => entry.organization).join("; ")}`,
        `Skills: ${academicData.skillsLines.join(" | ")}`,
      ].join("\n");
    }
    return [
      `Name: ${techData.name}`,
      `Education: ${techData.education.school}, ${techData.education.degreeLine}`,
      `Work Experience: ${techData.work.map((entry) => `${entry.title} at ${entry.company}`).join("; ")}`,
      `Leadership: ${techData.leadership.map((entry) => entry.company).join("; ")}`,
      `Projects: ${techData.projects.map((entry) => `${entry.name} | ${entry.stack}`).join("; ")}`,
      `Technical Skills: Languages ${techData.skills.languages}; Developer Tools ${techData.skills.developerTools}; Frameworks ${techData.skills.frameworks}`,
    ].join("\n");
  };

  const currentCandidateName =
    template === "business" ? data.name : template === "academic" ? academicData.name : techData.name;

  const generateCoverLetter = async () => {
    setCoverLetterError("");
    setIsGeneratingCoverLetter(true);
    try {
      const generated = await callClaude(
        `Write a professional cover letter based on this resume and job description.\nKeep it to 3-4 paragraphs. Be specific about the candidate's experience.\nDo not use generic filler phrases. Sound human and confident.\n\nCandidate Name: ${currentCandidateName}\nJob Description: ${jobDescriptionInput}\n\nResume Summary:\n${buildResumeTextSummary()}\n\nReturn only the cover letter text, no subject line or date.`,
      );
      setCoverLetterText(generated);
    } catch (error) {
      setCoverLetterError(error instanceof Error ? error.message : "Failed to generate");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  return (
    <div className="resume-inline-page">
      <style>
        {`
          .resume-inline-page {
            min-height: 100vh;
            background: #f1f3f7;
            padding: 24px 16px 40px;
          }
          .resume-topbar {
            display: flex;
            justify-content: center;
            margin-bottom: 16px;
            padding: 6px 8px;
            gap: 8px;
          }
          .resume-print-button {
            background: #094067;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 14px;
            cursor: pointer;
          }
          .resume-template-select {
            background: #094067;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 14px;
            cursor: pointer;
          }
          .resume-paper {
            width: min(850px, 100%);
            margin: 0 auto;
            background: #fff;
            box-shadow: 0 10px 26px rgba(0, 0, 0, 0.12);
            border-radius: 6px;
            padding: 34px 42px 36px;
          }
          .resume-business {
            color: #111;
            font-family: "Times New Roman", Georgia, serif;
            font-size: 11px;
            line-height: 1.36;
          }
          .resume-academic {
            color: #111;
            font-family: "Times New Roman", Cambria, Georgia, serif;
            font-size: 11px;
            line-height: 1.38;
          }
          .resume-tech {
            color: #111;
            font-family: "Inter", "Segoe UI", Arial, sans-serif;
            font-size: 10.8px;
            line-height: 1.33;
          }
          .resume-business-header {
            text-align: center;
            margin-bottom: 10px;
          }
          .resume-academic-header {
            text-align: center;
            margin-bottom: 10px;
          }
          .resume-tech-header {
            text-align: center;
            margin-bottom: 10px;
          }
          .resume-business-header .name {
            font-size: 22px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 4px;
          }
          .resume-academic-header .name {
            font-size: 22px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 4px;
          }
          .resume-tech-header .name {
            font-size: 22px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 4px;
          }
          .resume-business-header .contact-line {
            font-size: 11px;
            color: #555;
            display: flex;
            gap: 6px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .resume-tech-header .contact-line {
            font-size: 11px;
            color: #555;
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .resume-business-section {
            margin-top: 12px;
          }
          .resume-academic-section {
            margin-top: 12px;
            padding-left: 8px;
          }
          .resume-tech-section {
            margin-top: 10px;
          }
          .resume-business-section h2 {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.03em;
            margin: 0;
          }
          .resume-academic-section h2 {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.03em;
            margin: 0 0 8px;
            padding-bottom: 2px;
            border-bottom: 1px solid #111;
          }
          .resume-tech-section h2 {
            font-size: 13px;
            font-weight: 700;
            margin: 0 0 8px;
            border-left: 3px solid #094067;
            border-bottom: 1px solid #094067;
            padding-left: 8px;
            padding-bottom: 4px;
          }
          .resume-business-section hr {
            border: none;
            border-top: 1px solid #111;
            margin: 2px 0 8px;
          }
          .resume-entry-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 2px;
          }
          .resume-entry-row .company {
            font-weight: 700;
          }
          .resume-entry-row .title {
            font-style: italic;
          }
          .resume-entry-row .right {
            text-align: right;
          }
          .resume-bullet-list {
            margin: 0 0 5px 0;
            padding-left: 14px;
          }
          .resume-bullet-row {
            position: relative;
            margin: 1px 0;
          }
          .resume-bullet-row::marker {
            font-size: 10px;
          }
          .resume-inline-shell {
            display: inline-block;
            max-width: 100%;
            font: inherit;
            color: inherit;
            text-align: inherit;
            line-height: inherit;
            vertical-align: baseline;
          }
          .resume-inline-shell.name {
            display: block;
            width: 100%;
            text-align: center;
          }
          .resume-editable {
            border-bottom: 1px dashed transparent;
            cursor: text;
            font: inherit;
            color: inherit;
            text-align: inherit;
            line-height: inherit;
          }
          .resume-editable:hover,
          .resume-editable:focus {
            border-bottom: 1px dashed #ccc;
            cursor: text;
            outline: none;
          }
          .resume-inline-input {
            border: none;
            border-bottom: 1px solid #094067;
            outline: none;
            background: transparent;
            font: inherit;
            color: inherit;
            text-align: inherit;
            padding: 0;
            margin: 0;
            resize: none;
            line-height: inherit;
          }
          .resume-inline-input-auto {
            width: auto;
            min-width: 8ch;
          }
          .resume-inline-input-full {
            width: 100%;
          }
          .resume-inline-textarea {
            min-height: 1.2em;
            overflow: hidden;
          }
          .resume-bullet-actions {
            position: absolute;
            right: -30px;
            top: -2px;
            display: flex;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.12s ease;
          }
          .resume-bullet-row:hover .resume-bullet-actions {
            opacity: 1;
          }
          .resume-bullet-actions button,
          .resume-entry-delete {
            border: 1px solid #b8c6d3;
            background: #fff;
            color: #4f6274;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            line-height: 1;
            padding: 2px 5px;
          }
          .resume-job-entry {
            position: relative;
            margin-bottom: 8px;
          }
          .resume-academic-entry {
            margin-left: 6px;
          }
          .resume-tech .resume-entry-row .company {
            font-weight: 700;
          }
          .resume-tech .skills-line {
            margin-bottom: 3px;
          }
          .resume-academic-bullet-char {
            display: inline-block;
            width: 10px;
            margin-right: 4px;
            color: #222;
          }
          .resume-entry-delete {
            position: absolute;
            right: -58px;
            top: -1px;
            opacity: 0;
          }
          .resume-job-entry:hover .resume-entry-delete {
            opacity: 1;
          }
          .resume-add-entry {
            margin-top: 4px;
            border: 1px dashed #9bb6cc;
            background: transparent;
            color: #094067;
            border-radius: 5px;
            padding: 3px 8px;
            font-size: 11px;
            cursor: pointer;
          }
          .skills-line {
            margin-bottom: 2px;
          }
          .resume-ai-form {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin: 6px 0;
          }
          .resume-ai-error {
            color: #b3261e;
            font-size: 11px;
            margin-top: 4px;
          }
          .cover-letter-modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px;
            box-sizing: border-box;
            z-index: 2000;
          }
          .cover-letter-modal {
            overflow: hidden;
            background: #fff;
            border-radius: 10px;
            padding: 16px;
            box-shadow: 0 18px 42px rgba(0, 0, 0, 0.25);
            transition: width 0.2s ease, height 0.2s ease, max-width 0.2s ease;
            display: flex;
            flex-direction: column;
          }
          .cover-letter-modal.normal {
            width: 600px;
            max-width: 600px;
            height: 70vh;
            max-height: calc(100vh - 24px);
          }
          .cover-letter-modal.expanded {
            width: 70vw;
            max-width: 70vw;
            height: 92vh;
            max-height: calc(100vh - 24px);
          }
          .cover-letter-modal-head {
            position: relative;
            text-align: center;
            margin-bottom: 10px;
          }
          .cover-letter-modal-title {
            display: block;
            text-align: center;
          }
          .cover-letter-modal-close {
            position: absolute;
            right: 0;
            top: 0;
          }
          .cover-letter-modal-body {
            padding: 0 24px;
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            gap: 10px;
            overflow-y: auto;
          }
          .cover-letter-input,
          .cover-letter-output {
            width: 100%;
            box-sizing: border-box;
            flex: 1;
            min-height: 0;
            border: 1px solid #c4d0dc;
            border-radius: 8px;
            padding: 10px;
            font-size: 14px;
            resize: none;
          }
          .cover-letter-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin: 0;
          }
          @media print {
            body * { visibility: hidden !important; }
            .resume-paper, .resume-paper * { visibility: visible !important; }
            .resume-paper {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              box-shadow: none;
              border-radius: 0;
            }
            .resume-topbar { display: none !important; }
          }
        `}
      </style>

      <div className="resume-topbar">
        <select
          className="resume-template-select"
          value={template}
          onChange={(event) => {
            setTemplate(event.target.value as "business" | "academic" | "tech");
            setEditingField(null);
          }}
        >
          <option value="business">Business</option>
          <option value="academic">Academic</option>
          <option value="tech">Tech</option>
        </select>
        <button type="button" className="resume-print-button" onClick={() => window.print()}>
          Download
        </button>
        <button
          type="button"
          className="resume-print-button"
          onClick={() => setShowCoverLetterModal(true)}
        >
          Generate Cover Letter
        </button>
      </div>

      <div className="resume-paper">
        {template === "business" ? (
          <BusinessResumeTemplate
            data={data}
            editingField={editingField}
            setEditingField={setEditingField}
            onUpdateRoot={updateRoot}
            onUpdateEducation={updateEducation}
            onUpdateEducationBullet={updateEducationBullet}
            onAddEducationBullet={addEducationBullet}
            onRemoveEducationBullet={removeEducationBullet}
            onUpdateJob={updateJob}
            onUpdateJobBullet={updateJobBullet}
            onSetJobBullets={setJobBullets}
            onAddJobBullet={addJobBullet}
            onRemoveJobBullet={removeJobBullet}
            onAddJob={addJob}
            onRemoveJob={removeJob}
            onUpdateSkillsLine={updateSkillsLine}
          />
        ) : template === "academic" ? (
          <AcademicResumeTemplate
            data={academicData}
            editingField={editingField}
            setEditingField={setEditingField}
            onUpdateHeader={updateAcademicHeader}
            onUpdateEducationField={updateAcademicEducationField}
            onUpdateEducationBullet={updateAcademicEducationBullet}
            onAddEducationBullet={addAcademicEducationBullet}
            onRemoveEducationBullet={removeAcademicEducationBullet}
            onUpdateEntryField={updateAcademicEntryField}
            onUpdateEntryBullet={updateAcademicEntryBullet}
            onSetEntryBullets={setAcademicEntryBullets}
            onAddEntryBullet={addAcademicEntryBullet}
            onRemoveEntryBullet={removeAcademicEntryBullet}
            onAddEntry={addAcademicEntry}
            onRemoveEntry={removeAcademicEntry}
            onUpdateSkillsLine={updateAcademicSkillsLine}
          />
        ) : (
          <TechResumeTemplate
            data={techData}
            editingField={editingField}
            setEditingField={setEditingField}
            onUpdateHeader={updateTechHeader}
            onUpdateEducation={updateTechEducation}
            onUpdateEducationBullet={updateTechEducationBullet}
            onAddEducationBullet={addTechEducationBullet}
            onRemoveEducationBullet={removeTechEducationBullet}
            onUpdateExperienceField={updateTechExperienceField}
            onUpdateExperienceBullet={updateTechExperienceBullet}
            onSetExperienceBullets={setTechExperienceBullets}
            onAddExperienceBullet={addTechExperienceBullet}
            onRemoveExperienceBullet={removeTechExperienceBullet}
            onAddExperience={addTechExperience}
            onRemoveExperience={removeTechExperience}
            onUpdateProjectField={updateTechProjectField}
            onUpdateProjectBullet={updateTechProjectBullet}
            onAddProjectBullet={addTechProjectBullet}
            onRemoveProjectBullet={removeTechProjectBullet}
            onAddProject={addTechProject}
            onRemoveProject={removeTechProject}
            onUpdateSkills={updateTechSkills}
          />
        )}
      </div>
      {showCoverLetterModal && (
        <div className="cover-letter-modal-backdrop" onClick={() => setShowCoverLetterModal(false)}>
          <div
            className={`cover-letter-modal ${isCoverLetterExpanded ? "expanded" : "normal"}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cover-letter-modal-head">
              <strong className="cover-letter-modal-title">Cover Letter Generator</strong>
              <button
                type="button"
                className="resume-add-entry"
                style={{ position: "absolute", right: "36px", top: "0" }}
                onClick={() => setIsCoverLetterExpanded((previous) => !previous)}
                aria-label={isCoverLetterExpanded ? "Collapse modal" : "Expand modal"}
              >
                {isCoverLetterExpanded ? "↕" : "⛶"}
              </button>
              <button type="button" className="resume-add-entry cover-letter-modal-close" onClick={() => setShowCoverLetterModal(false)}>
                X
              </button>
            </div>
            <div className="cover-letter-modal-body">
              <textarea
                className="cover-letter-input"
                value={jobDescriptionInput}
                onChange={(event) => setJobDescriptionInput(event.target.value)}
                placeholder="Paste job description..."
              />
              <div className="cover-letter-actions">
                <button
                  type="button"
                  className="resume-print-button"
                  onClick={generateCoverLetter}
                  disabled={isGeneratingCoverLetter}
                >
                  {isGeneratingCoverLetter ? "Generating..." : "Generate"}
                </button>
                <button
                  type="button"
                  className="resume-add-entry"
                  onClick={() => navigator.clipboard.writeText(coverLetterText)}
                  disabled={!coverLetterText}
                >
                  Copy
                </button>
                <button
                  type="button"
                  className="resume-add-entry"
                  onClick={() => window.print()}
                  disabled={!coverLetterText}
                >
                  Download
                </button>
              </div>
              {coverLetterError && <div className="resume-ai-error">{coverLetterError}</div>}
              <textarea
                className="cover-letter-output"
                value={coverLetterText}
                onChange={(event) => setCoverLetterText(event.target.value)}
                placeholder="Generated cover letter will appear here..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
