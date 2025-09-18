import { Router } from 'express';
import { authenticateToken, optionalAuth, requireRole, login, register, getProfile, updateProfile } from '../middleware/auth';
import { JobController, InterviewController, QuestionController, ApplicantController, ApplicantAnswerController } from '../controllers';
import { jobService, interviewService, questionService, applicantService, applicantAnswerService } from '../services/database';

export function createRoutes() {
  const router = Router();

  // Initialize controllers
  const jobController = new JobController(jobService);
  const interviewController = new InterviewController(interviewService);
  const questionController = new QuestionController(questionService);
  const applicantController = new ApplicantController(applicantService);
  const applicantAnswerController = new ApplicantAnswerController(applicantAnswerService);

  // Authentication routes
  router.post('/auth/login', login);
  router.post('/auth/register', register);
  router.get('/auth/profile', authenticateToken, getProfile);
  router.patch('/auth/profile', authenticateToken, updateProfile);

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });


  // Job routes
  router.get('/jobs', optionalAuth, jobController.getAll.bind(jobController));
  router.get('/jobs/published', jobController.getPublished.bind(jobController));
  router.get('/jobs/user/:userId', authenticateToken, jobController.getByUserId.bind(jobController));
  router.get('/jobs/:id', optionalAuth, jobController.getById.bind(jobController));
  router.post('/jobs', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), jobController.create.bind(jobController));
  router.patch('/jobs/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), jobController.update.bind(jobController));
  router.patch('/jobs/:id/publish', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), jobController.publish.bind(jobController));
  router.delete('/jobs/:id', authenticateToken, requireRole(['ADMIN']), jobController.delete.bind(jobController));

  // Interview routes
  router.get('/interviews', optionalAuth, interviewController.getAll.bind(interviewController));
  router.get('/interviews/user/:userId', authenticateToken, interviewController.getByUserId.bind(interviewController));
  router.get('/interviews/job/:jobId', optionalAuth, interviewController.getByJobId.bind(interviewController));
  router.get('/interviews/:id', optionalAuth, interviewController.getById.bind(interviewController));
  router.get('/interviews/:id/complete', authenticateToken, interviewController.getComplete.bind(interviewController));
  router.post('/interviews', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), interviewController.create.bind(interviewController));
  router.patch('/interviews/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), interviewController.update.bind(interviewController));
  router.patch('/interviews/:id/publish', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), interviewController.publish.bind(interviewController));
  router.delete('/interviews/:id', authenticateToken, requireRole(['ADMIN']), interviewController.delete.bind(interviewController));

  // Question routes
  router.get('/questions', optionalAuth, questionController.getAll.bind(questionController));
  router.get('/questions/interview/:interviewId', optionalAuth, questionController.getByInterviewId.bind(questionController));
  router.get('/questions/difficulty/:difficulty', optionalAuth, questionController.getByDifficulty.bind(questionController));
  router.get('/questions/:id', optionalAuth, questionController.getById.bind(questionController));
  router.post('/questions', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.create.bind(questionController));
  router.patch('/questions/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.update.bind(questionController));
  router.delete('/questions/:id', authenticateToken, requireRole(['ADMIN']), questionController.delete.bind(questionController));

  // Applicant routes
  router.get('/applicants', authenticateToken, applicantController.getAll.bind(applicantController));
  router.get('/applicants/interview/:interviewId', authenticateToken, applicantController.getByInterviewId.bind(applicantController));
  router.get('/applicants/status/:status', authenticateToken, applicantController.getByStatus.bind(applicantController));
  router.get('/applicants/:id', authenticateToken, applicantController.getById.bind(applicantController));
  router.get('/applicants/:id/answers', authenticateToken, applicantController.getWithAnswers.bind(applicantController));
  router.post('/applicants', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), applicantController.create.bind(applicantController));
  router.patch('/applicants/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), applicantController.update.bind(applicantController));
  router.patch('/applicants/:id/status', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), applicantController.updateStatus.bind(applicantController));
  router.delete('/applicants/:id', authenticateToken, requireRole(['ADMIN']), applicantController.delete.bind(applicantController));

  // Applicant Answer routes
  router.get('/applicant_answers', authenticateToken, applicantAnswerController.getAll.bind(applicantAnswerController));
  router.get('/applicant_answers/applicant/:applicantId', authenticateToken, applicantAnswerController.getByApplicantId.bind(applicantAnswerController));
  router.get('/applicant_answers/question/:questionId', authenticateToken, applicantAnswerController.getByQuestionId.bind(applicantAnswerController));
  router.get('/applicant_answers/interview/:interviewId', authenticateToken, applicantAnswerController.getByInterviewId.bind(applicantAnswerController));
  router.get('/applicant_answers/:id', authenticateToken, applicantAnswerController.getById.bind(applicantAnswerController));
  router.get('/applicant_answers/:id/details', authenticateToken, applicantAnswerController.getWithDetails.bind(applicantAnswerController));
  router.post('/applicant_answers', authenticateToken, applicantAnswerController.create.bind(applicantAnswerController));
  router.patch('/applicant_answers/:id', authenticateToken, applicantAnswerController.update.bind(applicantAnswerController));
  router.delete('/applicant_answers/:id', authenticateToken, requireRole(['ADMIN']), applicantAnswerController.delete.bind(applicantAnswerController));

  // Legacy API compatibility (for frontend)
  router.get('/interview', optionalAuth, interviewController.getAll.bind(interviewController));
  router.get('/interview/:id', optionalAuth, interviewController.getById.bind(interviewController));
  router.post('/interview', authenticateToken, interviewController.create.bind(interviewController));
  router.patch('/interview/:id', authenticateToken, interviewController.update.bind(interviewController));
  router.delete('/interview/:id', authenticateToken, interviewController.delete.bind(interviewController));

  router.get('/question', optionalAuth, questionController.getAll.bind(questionController));
  router.get('/question/:id', optionalAuth, questionController.getById.bind(questionController));
  router.post('/question', authenticateToken, questionController.create.bind(questionController));
  router.patch('/question/:id', authenticateToken, questionController.update.bind(questionController));
  router.delete('/question/:id', authenticateToken, questionController.delete.bind(questionController));

  router.get('/applicant', authenticateToken, applicantController.getAll.bind(applicantController));
  router.get('/applicant/:id', authenticateToken, applicantController.getById.bind(applicantController));
  router.post('/applicant', authenticateToken, applicantController.create.bind(applicantController));
  router.patch('/applicant/:id', authenticateToken, applicantController.update.bind(applicantController));
  router.delete('/applicant/:id', authenticateToken, applicantController.delete.bind(applicantController));

  router.get('/applicant_answer', authenticateToken, applicantAnswerController.getAll.bind(applicantAnswerController));
  router.get('/applicant_answer/:id', authenticateToken, applicantAnswerController.getById.bind(applicantAnswerController));
  router.post('/applicant_answer', authenticateToken, applicantAnswerController.create.bind(applicantAnswerController));
  router.patch('/applicant_answer/:id', authenticateToken, applicantAnswerController.update.bind(applicantAnswerController));
  router.delete('/applicant_answer/:id', authenticateToken, applicantAnswerController.delete.bind(applicantAnswerController));

  return router;
}
