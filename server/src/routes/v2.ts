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




  // Question routes
  // Support PostgREST-style GET: /question?id=eq.{id}
  router.get('/question', optionalAuth, async (req, res) => {
    const idParam = req.query.id;
    if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
      req.params.id = idParam.substring(3);
      return questionController.getById(req, res);
    } else {
      return questionController.getAll(req, res);
    }
  });
  router.get('/question/interview/:interviewId', optionalAuth, questionController.getByInterviewId.bind(questionController));
  router.post('/question/generate/:interviewId', authenticateToken, questionController.generateQuestions.bind(questionController));
  router.get('/question/difficulty/:difficulty', optionalAuth, questionController.getByDifficulty.bind(questionController));
  router.get('/question/:id', optionalAuth, questionController.getById.bind(questionController));
  router.post('/question', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.create.bind(questionController));
  router.patch('/question/:id', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.update.bind(questionController));
  router.delete('/question/:id', authenticateToken, requireRole(['ADMIN','RECRUITER']), questionController.delete.bind(questionController));

  // Legacy PostgREST-style PATCH/DELETE: /question?id=eq.{id}
  router.patch('/question', authenticateToken, requireRole(['ADMIN', 'RECRUITER', 'INTERVIEWER']), async (req, res) => {
    const idParam = req.query.id;
    if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
      req.params.id = idParam.substring(3);
      return questionController.update(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid query parameter format. Expected: id=eq.{id}' });
    }
  });

  router.delete('/question', authenticateToken, requireRole(['ADMIN','RECRUITER']), async (req, res) => {
    const idParam = req.query.id;
    if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
      req.params.id = idParam.substring(3);
      return questionController.delete(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid query parameter format. Expected: id=eq.{id}' });
    }
  });
  
  // Applicant routes (specific endpoints)
  router.get('/applicant/interview/:interviewId', authenticateToken, applicantController.getByInterviewId.bind(applicantController));
  router.get('/applicant/status/:status', authenticateToken, applicantController.getByStatus.bind(applicantController));
  router.get('/applicant/:id/answers', authenticateToken, applicantController.getWithAnswers.bind(applicantController));
  router.post('/applicant/:applicantId/bind', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), applicantController.bindToInterview.bind(applicantController));
  router.delete('/applicant/:applicantId/unbind', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), applicantController.unbindFromInterview.bind(applicantController));
  router.patch('/applicant/:applicantId/interview_status', authenticateToken, applicantController.updateInterviewStatus.bind(applicantController));


    // Applicant legacy routes - matching frontend API calls (PostgREST style)
    router.get('/applicant', authenticateToken, async (req, res) => {
      // Handle query parameter format: /applicant?id=eq.123
      const idParam = req.query.id;
      if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
        req.params.id = idParam.substring(3); // Remove 'eq.' prefix
        return applicantController.getById(req, res);
      } else {
        // If no id parameter, return all applicants
        return applicantController.getAll(req, res);
      }
    });
  
    router.post('/applicant', authenticateToken, requireRole(['ADMIN', 'RECRUITER']), applicantController.create.bind(applicantController));
  
    router.delete('/applicant', authenticateToken, requireRole(['ADMIN','RECRUITER']), async (req, res) => {
      // Handle query parameter format: /applicant?id=eq.123
      const idParam = req.query.id;
      if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
        req.params.id = idParam.substring(3); // Remove 'eq.' prefix
        return applicantController.delete(req, res);
      } else {
        return res.status(400).json({ error: 'Missing id parameter' });
      }
    });

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
  


  // Audio/ASR routes
  router.head('/model/whisper', (req, res) => {
    // Health check endpoint for Whisper service (no auth required)
    res.status(200).end();
  });
  router.post('/model/whisper', express.raw({ type: 'application/octet-stream' }),authenticateToken, audioController.transcribe.bind(audioController));

  return router;
}
