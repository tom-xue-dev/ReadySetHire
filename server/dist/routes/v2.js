"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = createRoutes;
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const controllers_1 = require("../controllers");
const database_1 = require("../services/database");
const whisper_1 = require("../services/whisper");
function createRoutes() {
    const router = (0, express_1.Router)();
    // Initialize controllers
    const jobController = new controllers_1.JobController(database_1.jobService);
    const interviewController = new controllers_1.InterviewController(database_1.interviewService);
    const questionController = new controllers_1.QuestionController(database_1.questionService);
    const applicantController = new controllers_1.ApplicantController(database_1.applicantService);
    const applicantAnswerController = new controllers_1.ApplicantAnswerController(database_1.applicantAnswerService);
    const audioController = new controllers_1.AudioController(whisper_1.whisperService);
    // Authentication routes
    router.post('/auth/login', auth_1.login);
    router.post('/auth/register', auth_1.register);
    router.get('/auth/profile', auth_1.authenticateToken, auth_1.getProfile);
    router.patch('/auth/profile', auth_1.authenticateToken, auth_1.updateProfile);
    // Health check endpoint
    router.get('/health', (req, res) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    // Question routes
    router.get('/question', auth_1.optionalAuth, questionController.getAll.bind(questionController));
    router.get('/question/interview/:interviewId', auth_1.optionalAuth, questionController.getByInterviewId.bind(questionController));
    router.get('/question/difficulty/:difficulty', auth_1.optionalAuth, questionController.getByDifficulty.bind(questionController));
    router.get('/question/:id', auth_1.optionalAuth, questionController.getById.bind(questionController));
    router.post('/question', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.create.bind(questionController));
    router.patch('/question/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.update.bind(questionController));
    router.delete('/question/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), questionController.delete.bind(questionController));
    // Applicant routes (specific endpoints)
    router.get('/applicant/interview/:interviewId', auth_1.authenticateToken, applicantController.getByInterviewId.bind(applicantController));
    router.get('/applicant/status/:status', auth_1.authenticateToken, applicantController.getByStatus.bind(applicantController));
    router.get('/applicant/:id/answers', auth_1.authenticateToken, applicantController.getWithAnswers.bind(applicantController));
    router.post('/applicant/:applicantId/bind', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), applicantController.bindToInterview.bind(applicantController));
    router.delete('/applicant/:applicantId/unbind', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), applicantController.unbindFromInterview.bind(applicantController));
    // Applicant Answer routes
    router.get('/applicant_answers', auth_1.authenticateToken, applicantAnswerController.getAll.bind(applicantAnswerController));
    router.get('/applicant_answers/applicant/:applicantId', auth_1.authenticateToken, applicantAnswerController.getByApplicantId.bind(applicantAnswerController));
    router.get('/applicant_answers/question/:questionId', auth_1.authenticateToken, applicantAnswerController.getByQuestionId.bind(applicantAnswerController));
    router.get('/applicant_answers/interview/:interviewId', auth_1.authenticateToken, applicantAnswerController.getByInterviewId.bind(applicantAnswerController));
    router.get('/applicant_answers/:id', auth_1.authenticateToken, applicantAnswerController.getById.bind(applicantAnswerController));
    router.get('/applicant_answers/:id/details', auth_1.authenticateToken, applicantAnswerController.getWithDetails.bind(applicantAnswerController));
    router.post('/applicant_answers', auth_1.authenticateToken, applicantAnswerController.create.bind(applicantAnswerController));
    router.patch('/applicant_answers/:id', auth_1.authenticateToken, applicantAnswerController.update.bind(applicantAnswerController));
    router.delete('/applicant_answers/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), applicantAnswerController.delete.bind(applicantAnswerController));
    // =================================================================
    // LEGACY API COMPATIBILITY ROUTES (for frontend compatibility)
    // These routes match the PostgREST-style API calls used by frontend
    // =================================================================
    // Applicant legacy routes - matching frontend API calls (PostgREST style)
    router.get('/applicant', auth_1.authenticateToken, async (req, res) => {
        // Handle query parameter format: /applicant?id=eq.123
        const idParam = req.query.id;
        if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
            req.params.id = idParam.substring(3); // Remove 'eq.' prefix
            return applicantController.getById(req, res);
        }
        else {
            // If no id parameter, return all applicants
            return applicantController.getAll(req, res);
        }
    });
    router.post('/applicant', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), applicantController.create.bind(applicantController));
    router.patch('/applicant', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), async (req, res) => {
        // Handle query parameter format: /applicant?id=eq.123
        const idParam = req.query.id;
        if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
            req.params.id = idParam.substring(3); // Remove 'eq.' prefix
            return applicantController.update(req, res);
        }
        else {
            return res.status(400).json({ error: 'Missing id parameter' });
        }
    });
    router.delete('/applicant', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), async (req, res) => {
        // Handle query parameter format: /applicant?id=eq.123
        const idParam = req.query.id;
        if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
            req.params.id = idParam.substring(3); // Remove 'eq.' prefix
            return applicantController.delete(req, res);
        }
        else {
            return res.status(400).json({ error: 'Missing id parameter' });
        }
    });
    // Interview legacy routes - matching frontend API calls
    router.get('/interview', auth_1.optionalAuth, async (req, res) => {
        // Handle query parameter format: /interview?id=eq.123
        const idParam = req.query.id;
        if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
            req.params.id = idParam.substring(3); // Remove 'eq.' prefix
            return interviewController.getById(req, res);
        }
        else {
            // If no id parameter, return all interviews (same as /interviews)
            return interviewController.getAll(req, res);
        }
    });
    router.post('/interview', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), interviewController.create.bind(interviewController));
    router.patch('/interview', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), async (req, res) => {
        // Handle query parameter format: /interview?id=eq.123
        const idParam = req.query.id;
        if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
            req.params.id = idParam.substring(3); // Remove 'eq.' prefix
            return interviewController.update(req, res);
        }
        else {
            return res.status(400).json({ error: 'Invalid query parameter format. Expected: id=eq.{id}' });
        }
    });
    router.delete('/interview', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), async (req, res) => {
        // Handle query parameter format: /interview?id=eq.123
        const idParam = req.query.id;
        if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
            req.params.id = idParam.substring(3); // Remove 'eq.' prefix
            return interviewController.delete(req, res);
        }
        else {
            return res.status(400).json({ error: 'Invalid query parameter format. Expected: id=eq.{id}' });
        }
    });
    // Add missing /interviews route (needed by frontend getInterviews())
    router.get('/interviews', auth_1.optionalAuth, interviewController.getAll.bind(interviewController));
    // Job legacy routes - matching frontend API calls (PostgREST style)
    router.get('/job', auth_1.optionalAuth, async (req, res) => {
        // Handle query parameter format: /job?id=eq.123
        const idParam = req.query.id;
        if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
            req.params.id = idParam.substring(3); // Remove 'eq.' prefix
            return jobController.getById(req, res);
        }
        else {
            // If no id parameter, return all jobs (same as /jobs)
            return jobController.getAll(req, res);
        }
    });
    router.post('/job', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), jobController.create.bind(jobController));
    router.patch('/job', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), async (req, res) => {
        // Handle query parameter format: /job?id=eq.123
        const idParam = req.query.id;
        if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
            req.params.id = idParam.substring(3); // Remove 'eq.' prefix
            return jobController.update(req, res);
        }
        else {
            return res.status(400).json({ error: 'Invalid query parameter format. Expected: id=eq.{id}' });
        }
    });
    router.delete('/job', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), async (req, res) => {
        // Handle query parameter format: /job?id=eq.123
        const idParam = req.query.id;
        if (typeof idParam === 'string' && idParam.startsWith('eq.')) {
            req.params.id = idParam.substring(3); // Remove 'eq.' prefix
            return jobController.delete(req, res);
        }
        else {
            return res.status(400).json({ error: 'Invalid query parameter format. Expected: id=eq.{id}' });
        }
    });
    // Standard RESTful Job routes (keep for compatibility)
    router.get('/jobs', auth_1.optionalAuth, jobController.getAll.bind(jobController));
    router.get('/jobs/published', jobController.getPublished.bind(jobController));
    router.get('/jobs/user/:userId', auth_1.authenticateToken, jobController.getByUserId.bind(jobController));
    router.get('/jobs/:id', auth_1.optionalAuth, jobController.getById.bind(jobController));
    router.post('/jobs', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), jobController.create.bind(jobController));
    router.patch('/jobs/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), jobController.update.bind(jobController));
    router.patch('/jobs/:id/publish', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), jobController.publish.bind(jobController));
    router.delete('/jobs/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), jobController.delete.bind(jobController));
    // Audio/ASR routes
    router.head('/model/whisper', (req, res) => {
        // Health check endpoint for Whisper service (no auth required)
        res.status(200).end();
    });
    router.post('/model/whisper', express_2.default.raw({ type: 'application/octet-stream' }), auth_1.authenticateToken, audioController.transcribe.bind(audioController));
    return router;
}
//# sourceMappingURL=v2.js.map