export type Job = {
  id?: number;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salary?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;
  company?: string;
  department?: string;
};

export type Interview = {
  id?: number;
  title: string;
  jobRole: string;
  description?: string;
  status: "Published" | "Draft" | "Archived" | string;
  username: string;
  jobId?: number;
};


