import { Router } from 'express';
import express from 'express';
import { authenticateToken, optionalAuth, requireRole, login, register, getProfile, updateProfile } from '../middleware/auth';
import { JobController, InterviewController, QuestionController, ApplicantController, ApplicantAnswerController, AudioController } from '../controllers';
import { jobService, interviewService, questionService, applicantService, applicantAnswerService } from '../services/database';
import { whisperService } from '../services/whisper';
import { llmService } from '../services/llm';
export function createRoutes() {
  const router = Router();

  // Initialize controllers
  const jobController = new JobController(jobService);
  const interviewController = new InterviewController(interviewService);
  const questionController = new QuestionController(questionService, llmService);
  const applicantController = new ApplicantController(applicantService);
  const applicantAnswerController = new ApplicantAnswerController(applicantAnswerService);
  const audioController = new AudioController(whisperService);

  // Authentication routes
  router.post('/auth/login', login);
  router.post('/auth/register', register);
  router.get('/auth/profile', authenticateToken, getProfile);
  router.patch('/auth/profile', authenticateToken, updateProfile);

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });




  // Question routes (RESTful)
  router.get('/question', optionalAuth, questionController.getAll.bind(questionController));
  router.get('/question/interview/:interviewId', optionalAuth, questionController.getByInterviewId.bind(questionController));
  router.post('/question/generate/:interviewId', authenticateToken, questionController.generateQuestions.bind(questionController));
  router.get('/question/difficulty/:difficulty', optionalAuth, questionController.getByDifficulty.bind(questionController));
  router.get('/question/:id', optionalAuth, questionController.getById.bind(questionController));
  router.post('/question', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.create.bind(questionController));
  router.patch('/question/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.update.bind(questionController));
  router.delete('/question/:id', authenticateToken, requireRole(['ADMIN','RECRUITER']), questionController.delete.bind(questionController));
  // Removed legacy PostgREST-style routes for questions
  
  // Removed legacy non-RESTful applicant routes (use RESTful routes below)


  // Removed legacy PostgREST-style applicant routes in favor of RESTful

  // Bind applicant to interview (preferred): POST /interviews/:interviewId/applicants { applicant_id, status? }
  router.post('/interviews/:interviewId/applicants', authenticateToken, requireRole(['ADMIN','RECRUITER']), async (req, res) => {
    const interviewId = parseInt(req.params.interviewId);
    const applicantIdRaw = (req.body && (req.body.applicant_id ?? req.body.applicantId));
    const status = (req.body && (req.body.status)) || 'NOT_STARTED';

    if (isNaN(interviewId)) {
      return res.status(400).json({ error: 'Invalid interview ID format' });
    }
    const applicantId = Number(applicantIdRaw);
    if (isNaN(applicantId)) {
      return res.status(400).json({ error: 'Invalid applicant ID format' });
    }

    // Reuse controller logic
    (req as any).params.applicantId = String(applicantId);
    (req as any).body = { interviewId, status };
    return applicantController.bindToInterview(req, res);
  });

  // Applicant Answer routes
  router.get('/applicant_answers', authenticateToken, applicantAnswerController.getAll.bind(applicantAnswerController));
  router.get('/applicant_answers/applicant/:applicantId', authenticateToken, applicantAnswerController.getByApplicantId.bind(applicantAnswerController));
  router.get('/applicant_answers/question/:questionId', authenticateToken, applicantAnswerController.getByQuestionId.bind(applicantAnswerController));
  router.get('/applicant_answers/interview/:interviewId', authenticateToken, applicantAnswerController.getByInterviewId.bind(applicantAnswerController));
  router.get('/applicant_answers/interview/:interviewId/applicant/:applicantId', authenticateToken, applicantAnswerController.getByInterviewAndApplicant.bind(applicantAnswerController));
  router.get('/applicant_answers/:id', authenticateToken, applicantAnswerController.getById.bind(applicantAnswerController));
  router.get('/applicant_answers/:id/details', authenticateToken, applicantAnswerController.getWithDetails.bind(applicantAnswerController));
  router.post('/applicant_answers', authenticateToken, applicantAnswerController.create.bind(applicantAnswerController));
  router.patch('/applicant_answers/:id', authenticateToken, applicantAnswerController.update.bind(applicantAnswerController));
  router.delete('/applicant_answers/:id', authenticateToken, requireRole(['ADMIN']), applicantAnswerController.delete.bind(applicantAnswerController));

  // RESTful interviews
  router.get('/interviews', optionalAuth, interviewController.getAll.bind(interviewController));
  // RESTful interview routes
  router.get('/interviews/:id', optionalAuth, interviewController.getById.bind(interviewController));
  router.post('/interviews', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), interviewController.create.bind(interviewController));
  router.patch('/interviews/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), interviewController.update.bind(interviewController));
  router.delete('/interviews/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), interviewController.delete.bind(interviewController));

  // Removed legacy PostgREST-style job routes in favor of RESTful

  // Standard RESTful Job routes (keep for compatibility)
  router.get('/jobs', optionalAuth, jobController.getAll.bind(jobController));
  router.get('/jobs/published', jobController.getPublished.bind(jobController));
  router.get('/jobs/user/:userId', authenticateToken, jobController.getByUserId.bind(jobController));
  router.get('/jobs/:id', optionalAuth, jobController.getById.bind(jobController));
  router.post('/jobs', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), jobController.create.bind(jobController));
  router.patch('/jobs/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), jobController.update.bind(jobController));
  router.patch('/jobs/:id/publish', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), jobController.publish.bind(jobController));
  router.delete('/jobs/:id', authenticateToken, requireRole(['ADMIN']), jobController.delete.bind(jobController));
  
  // RESTful Applicant routes
  router.get('/applicants', authenticateToken, applicantController.getAll.bind(applicantController));
  router.get('/applicants/:id', authenticateToken, applicantController.getById.bind(applicantController));
  router.post('/applicants', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), applicantController.create.bind(applicantController));
  router.patch('/applicants/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), applicantController.update.bind(applicantController));
  router.delete('/applicants/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), applicantController.delete.bind(applicantController));
  
  // RESTful Interview ↔ Applicant bindings
  router.get('/interviews/:interviewId/applicants', authenticateToken, applicantController.getByInterviewId.bind(applicantController));
  router.delete('/interviews/:interviewId/applicants/:applicantId', authenticateToken, requireRole(['ADMIN','RECRUITER']), async (req, res) => {
    // Forward to legacy handler with params mapped
    (req as any).query.interviewId = req.params.interviewId;
    return applicantController.unbindFromInterview(req as any, res);
  });
  router.patch('/interviews/:interviewId/applicants/:applicantId', authenticateToken, async (req, res) => {
    // Normalize body for status update
    const status = (req.body && (req.body.status || req.body.interviewStatus));
    (req as any).body = { interviewId: Number(req.params.interviewId), status };
    return applicantController.updateInterviewStatus(req as any, res);
  });
  


  // Audio/ASR routes
  router.head('/model/whisper', (req, res) => {
    // Health check endpoint for Whisper service (no auth required)
    res.status(200).end();
  });
  router.post('/model/whisper', express.raw({ type: 'application/octet-stream' }),authenticateToken, audioController.transcribe.bind(audioController));

  return router;
}
