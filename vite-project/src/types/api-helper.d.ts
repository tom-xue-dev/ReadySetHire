declare module "../api/helper.js" {
  export function apiRequest(endpoint: string, method?: string, body?: any): Promise<any>;
  export function createInterview(interview: any): Promise<any>;
  export function getInterviews(): Promise<any[]>;
  export function getInterview(id: string | number): Promise<any>;
  export function updateInterview(id: string | number, data: any): Promise<any>;
  export function deleteInterview(id: string | number): Promise<any>;
  // Question APIs
  export function getQuestions(interviewId: string | number): Promise<any[]>;
  export function createQuestion(question: any): Promise<any>;
  export function updateQuestion(id: string | number, data: any): Promise<any>;
  export function deleteQuestion(id: string | number): Promise<any>;
}
