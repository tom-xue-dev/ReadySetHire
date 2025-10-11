declare module "../api/helper.js" {
  // Core
  export function apiRequest(endpoint: string, method?: string, body?: any, timeout?: number): Promise<any>;
  export function healthCheck(): Promise<any>;

  // Interviews
  export function createInterview(interview: any): Promise<any>;
  export function getInterviews(): Promise<any[]>;
  export function getInterview(id: string | number): Promise<any>;
  export function updateInterview(id: string | number, data: any): Promise<any>;
  export function deleteInterview(id: string | number): Promise<any>;

  // Questions
  export function getQuestions(interviewId: string | number): Promise<any[]>;
  export function createQuestion(question: any): Promise<any>;
  export function updateQuestion(id: string | number, data: any): Promise<any>;
  export function deleteQuestion(id: string | number): Promise<any>;
  export function generateQuestions(interviewId: string | number, count?: number): Promise<any>;

  // Applicants
  export function getAllApplicants(): Promise<any[]>;
  export function getApplicantsByInterview(interviewId: string | number): Promise<any[]>;
  export function createApplicant(applicant: any): Promise<any>;
  export function updateApplicant(id: string | number, data: any): Promise<any>;
  export function deleteApplicant(id: string | number): Promise<any>;
  export function bindApplicantToInterview(applicantId: string | number, interviewId: string | number, status?: string): Promise<any>;
  export function unbindApplicantFromInterview(applicantId: string | number, interviewId: string | number): Promise<any>;
  export function updateApplicantInterviewStatus(applicantId: string | number, interviewId: string | number, status?: string): Promise<any>;

  // Applications
  export function getAllApplications(params?: { page?: number; limit?: number; status?: string; jobId?: number }): Promise<{ data?: any[]; pagination?: any } & Record<string, any>>;
  export function getApplicationById(id: string | number): Promise<any>;
  export function updateApplicationStatus(id: string | number, status: string, notes?: string): Promise<any>;

  // Resumes
  export function downloadResume(resumeId: string | number): Promise<{ filename: string }>;

  // Billing
  export function createCheckoutSession(): Promise<{ id?: string; url?: string }>;
}
