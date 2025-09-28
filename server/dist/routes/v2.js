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
const llm_1 = require("../services/llm");
function createRoutes() {
    const router = (0, express_1.Router)();
    // Initialize controllers
    const jobController = new controllers_1.JobController(database_1.jobService);
    const interviewController = new controllers_1.InterviewController(database_1.interviewService);
    const questionController = new controllers_1.QuestionController(database_1.questionService, llm_1.llmService);
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
    // Question routes (RESTful)
    router.get('/question', auth_1.optionalAuth, questionController.getAll.bind(questionController));
    router.get('/question/interview/:interviewId', auth_1.optionalAuth, questionController.getByInterviewId.bind(questionController));
    router.post('/question/generate/:interviewId', auth_1.authenticateToken, questionController.generateQuestions.bind(questionController));
    router.get('/question/difficulty/:difficulty', auth_1.optionalAuth, questionController.getByDifficulty.bind(questionController));
    router.get('/question/:id', auth_1.optionalAuth, questionController.getById.bind(questionController));
    router.post('/question', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.create.bind(questionController));
    router.patch('/question/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.update.bind(questionController));
    router.delete('/question/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), questionController.delete.bind(questionController));
    // Removed legacy PostgREST-style routes for questions
    // Removed legacy non-RESTful applicant routes (use RESTful routes below)
    // Removed legacy PostgREST-style applicant routes in favor of RESTful
    // Bind applicant to interview (preferred): POST /interviews/:interviewId/applicants { applicant_id, status? }
    router.post('/interviews/:interviewId/applicants', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), async (req, res) => {
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
        req.params.applicantId = String(applicantId);
        req.body = { interviewId, status };
        return applicantController.bindToInterview(req, res);
    });
    // Applicant Answer routes
    router.get('/applicant_answers', auth_1.authenticateToken, applicantAnswerController.getAll.bind(applicantAnswerController));
    router.get('/applicant_answers/applicant/:applicantId', auth_1.authenticateToken, applicantAnswerController.getByApplicantId.bind(applicantAnswerController));
    router.get('/applicant_answers/question/:questionId', auth_1.authenticateToken, applicantAnswerController.getByQuestionId.bind(applicantAnswerController));
    router.get('/applicant_answers/interview/:interviewId', auth_1.authenticateToken, applicantAnswerController.getByInterviewId.bind(applicantAnswerController));
    router.get('/applicant_answers/interview/:interviewId/applicant/:applicantId', auth_1.authenticateToken, applicantAnswerController.getByInterviewAndApplicant.bind(applicantAnswerController));
    router.get('/applicant_answers/:id', auth_1.authenticateToken, applicantAnswerController.getById.bind(applicantAnswerController));
    router.get('/applicant_answers/:id/details', auth_1.authenticateToken, applicantAnswerController.getWithDetails.bind(applicantAnswerController));
    router.post('/applicant_answers', auth_1.authenticateToken, applicantAnswerController.create.bind(applicantAnswerController));
    router.patch('/applicant_answers/:id', auth_1.authenticateToken, applicantAnswerController.update.bind(applicantAnswerController));
    router.delete('/applicant_answers/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), applicantAnswerController.delete.bind(applicantAnswerController));
    // RESTful interviews
    router.get('/interviews', auth_1.optionalAuth, interviewController.getAll.bind(interviewController));
    // RESTful interview routes
    router.get('/interviews/:id', auth_1.optionalAuth, interviewController.getById.bind(interviewController));
    router.post('/interviews', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), interviewController.create.bind(interviewController));
    router.patch('/interviews/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), interviewController.update.bind(interviewController));
    router.delete('/interviews/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), interviewController.delete.bind(interviewController));
    // Removed legacy PostgREST-style job routes in favor of RESTful
    // Standard RESTful Job routes (keep for compatibility)
    router.get('/jobs', auth_1.optionalAuth, jobController.getAll.bind(jobController));
    router.get('/jobs/published', jobController.getPublished.bind(jobController));
    router.get('/jobs/user/:userId', auth_1.authenticateToken, jobController.getByUserId.bind(jobController));
    router.get('/jobs/:id', auth_1.optionalAuth, jobController.getById.bind(jobController));
    router.post('/jobs', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), jobController.create.bind(jobController));
    router.patch('/jobs/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), jobController.update.bind(jobController));
    router.patch('/jobs/:id/publish', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), jobController.publish.bind(jobController));
    router.delete('/jobs/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), jobController.delete.bind(jobController));
    // RESTful Applicant routes
    router.get('/applicants', auth_1.authenticateToken, applicantController.getAll.bind(applicantController));
    router.get('/applicants/:id', auth_1.authenticateToken, applicantController.getById.bind(applicantController));
    router.post('/applicants', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), applicantController.create.bind(applicantController));
    router.patch('/applicants/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), applicantController.update.bind(applicantController));
    router.delete('/applicants/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), applicantController.delete.bind(applicantController));
    // RESTful Interview ↔ Applicant bindings
    router.get('/interviews/:interviewId/applicants', auth_1.authenticateToken, applicantController.getByInterviewId.bind(applicantController));
    router.delete('/interviews/:interviewId/applicants/:applicantId', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), async (req, res) => {
        // Forward to legacy handler with params mapped
        req.query.interviewId = req.params.interviewId;
        return applicantController.unbindFromInterview(req, res);
    });
    router.patch('/interviews/:interviewId/applicants/:applicantId', auth_1.authenticateToken, async (req, res) => {
        // Normalize body for status update
        const status = (req.body && (req.body.status || req.body.interviewStatus));
        req.body = { interviewId: Number(req.params.interviewId), status };
        return applicantController.updateInterviewStatus(req, res);
    });
    // Audio/ASR routes
    router.head('/model/whisper', (req, res) => {
        // Health check endpoint for Whisper service (no auth required)
        res.status(200).end();
    });
    router.post('/model/whisper', express_2.default.raw({ type: 'application/octet-stream' }), auth_1.authenticateToken, audioController.transcribe.bind(audioController));
    return router;
}
//# sourceMappingURL=v2.js.map