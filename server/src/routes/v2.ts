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

  // =================================================================
  // LEGACY API COMPATIBILITY ROUTES (for frontend compatibility)
  // These routes match the PostgREST-style API calls used by frontend
  // =================================================================

  // Interview legacy routes - matching frontend API calls
  router.get('/interview', optionalAuth, async (req, res) => {
    // Handle query parameter format: /interview?id=eq.123
    const idParam = req.query.id;
    if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
      req.params.id = idParam.substring(3); // Remove 'eq.' prefix
      return interviewController.getById(req, res);
    } else {
      // If no id parameter, return all interviews (same as /interviews)
      return interviewController.getAll(req, res);
    }
  });

  router.post('/interview', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), interviewController.create.bind(interviewController));

  router.patch('/interview', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), async (req, res) => {
    // Handle query parameter format: /interview?id=eq.123
    const idParam = req.query.id;
    if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
      req.params.id = idParam.substring(3); // Remove 'eq.' prefix
      return interviewController.update(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid query parameter format. Expected: id=eq.{id}' });
    }
  });

  router.delete('/interview', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), async (req, res) => {
    // Handle query parameter format: /interview?id=eq.123
    const idParam = req.query.id;
    if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
      req.params.id = idParam.substring(3); // Remove 'eq.' prefix
      return interviewController.delete(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid query parameter format. Expected: id=eq.{id}' });
    }
  });

  // Add missing /interviews route (needed by frontend getInterviews())
  router.get('/interviews', optionalAuth, interviewController.getAll.bind(interviewController));

  // Job legacy routes - matching frontend API calls (PostgREST style)
  router.get('/job', optionalAuth, async (req, res) => {
    // Handle query parameter format: /job?id=eq.123
    const idParam = req.query.id;
    if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
      req.params.id = idParam.substring(3); // Remove 'eq.' prefix
      return jobController.getById(req, res);
    } else {
      // If no id parameter, return all jobs (same as /jobs)
      return jobController.getAll(req, res);
    }
  });

  router.post('/job', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), jobController.create.bind(jobController));

  router.patch('/job', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), async (req, res) => {
    // Handle query parameter format: /job?id=eq.123
    const idParam = req.query.id;
    if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
      req.params.id = idParam.substring(3); // Remove 'eq.' prefix
      return jobController.update(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid query parameter format. Expected: id=eq.{id}' });
    }
  });

  router.delete('/job', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), async (req, res) => {
    // Handle query parameter format: /job?id=eq.123
    const idParam = req.query.id;
    if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
      req.params.id = idParam.substring(3); // Remove 'eq.' prefix
      return jobController.delete(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid query parameter format. Expected: id=eq.{id}' });
    }
  });

  // Standard RESTful Job routes (keep for compatibility)
  router.get('/jobs', optionalAuth, jobController.getAll.bind(jobController));
  router.get('/jobs/published', jobController.getPublished.bind(jobController));
  router.get('/jobs/user/:userId', authenticateToken, jobController.getByUserId.bind(jobController));
  router.get('/jobs/:id', optionalAuth, jobController.getById.bind(jobController));
  router.post('/jobs', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), jobController.create.bind(jobController));
  router.patch('/jobs/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), jobController.update.bind(jobController));
  router.patch('/jobs/:id/publish', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), jobController.publish.bind(jobController));
  router.delete('/jobs/:id', authenticateToken, requireRole(['ADMIN']), jobController.delete.bind(jobController));
  
  return router;
}
