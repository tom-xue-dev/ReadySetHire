"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = createRoutes;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const controllers_1 = require("../controllers");
const database_1 = require("../services/database");
function createRoutes() {
    const router = (0, express_1.Router)();
    // Initialize controllers
    const jobController = new controllers_1.JobController(database_1.jobService);
    const interviewController = new controllers_1.InterviewController(database_1.interviewService);
    const questionController = new controllers_1.QuestionController(database_1.questionService);
    const applicantController = new controllers_1.ApplicantController(database_1.applicantService);
    const applicantAnswerController = new controllers_1.ApplicantAnswerController(database_1.applicantAnswerService);
    // Authentication routes
    router.post('/auth/login', auth_1.login);
    router.post('/auth/register', auth_1.register);
    router.get('/auth/profile', auth_1.authenticateToken, auth_1.getProfile);
    router.patch('/auth/profile', auth_1.authenticateToken, auth_1.updateProfile);
    // Health check endpoint
    router.get('/health', (req, res) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    // Test endpoint without database
    router.get('/test', (req, res) => {
        res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
    });
    // Database connection test
    router.get('/db-test', async (req, res) => {
        try {
            const prisma = (await Promise.resolve().then(() => __importStar(require('../services/database')))).default;
            await prisma.$connect();
            res.json({
                message: 'Database connected successfully!',
                timestamp: new Date().toISOString(),
                database: 'Connected'
            });
        }
        catch (error) {
            console.error('Database connection error:', error);
            res.status(500).json({
                error: 'Database connection failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    });
    // Job routes
    router.get('/jobs', auth_1.optionalAuth, jobController.getAll.bind(jobController));
    router.get('/jobs/published', jobController.getPublished.bind(jobController));
    router.get('/jobs/user/:userId', auth_1.authenticateToken, jobController.getByUserId.bind(jobController));
    router.get('/jobs/:id', auth_1.optionalAuth, jobController.getById.bind(jobController));
    router.post('/jobs', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), jobController.create.bind(jobController));
    router.patch('/jobs/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), jobController.update.bind(jobController));
    router.patch('/jobs/:id/publish', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), jobController.publish.bind(jobController));
    router.delete('/jobs/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), jobController.delete.bind(jobController));
    // Interview routes
    router.get('/interviews', auth_1.optionalAuth, interviewController.getAll.bind(interviewController));
    router.get('/interviews/user/:userId', auth_1.authenticateToken, interviewController.getByUserId.bind(interviewController));
    router.get('/interviews/job/:jobId', auth_1.optionalAuth, interviewController.getByJobId.bind(interviewController));
    router.get('/interviews/:id', auth_1.optionalAuth, interviewController.getById.bind(interviewController));
    router.get('/interviews/:id/complete', auth_1.authenticateToken, interviewController.getComplete.bind(interviewController));
    router.post('/interviews', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), interviewController.create.bind(interviewController));
    router.patch('/interviews/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), interviewController.update.bind(interviewController));
    router.patch('/interviews/:id/publish', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), interviewController.publish.bind(interviewController));
    router.delete('/interviews/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), interviewController.delete.bind(interviewController));
    // Question routes
    router.get('/questions', auth_1.optionalAuth, questionController.getAll.bind(questionController));
    router.get('/questions/interview/:interviewId', auth_1.optionalAuth, questionController.getByInterviewId.bind(questionController));
    router.get('/questions/difficulty/:difficulty', auth_1.optionalAuth, questionController.getByDifficulty.bind(questionController));
    router.get('/questions/:id', auth_1.optionalAuth, questionController.getById.bind(questionController));
    router.post('/questions', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.create.bind(questionController));
    router.patch('/questions/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), questionController.update.bind(questionController));
    router.delete('/questions/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), questionController.delete.bind(questionController));
    // Applicant routes
    router.get('/applicants', auth_1.authenticateToken, applicantController.getAll.bind(applicantController));
    router.get('/applicants/interview/:interviewId', auth_1.authenticateToken, applicantController.getByInterviewId.bind(applicantController));
    router.get('/applicants/status/:status', auth_1.authenticateToken, applicantController.getByStatus.bind(applicantController));
    router.get('/applicants/:id', auth_1.authenticateToken, applicantController.getById.bind(applicantController));
    router.get('/applicants/:id/answers', auth_1.authenticateToken, applicantController.getWithAnswers.bind(applicantController));
    router.post('/applicants', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), applicantController.create.bind(applicantController));
    router.patch('/applicants/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER']), applicantController.update.bind(applicantController));
    router.patch('/applicants/:id/status', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'RECRUITER', 'INTERVIEWER']), applicantController.updateStatus.bind(applicantController));
    router.delete('/applicants/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), applicantController.delete.bind(applicantController));
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
    // Legacy API compatibility (for frontend)
    router.get('/interview', auth_1.optionalAuth, interviewController.getAll.bind(interviewController));
    router.get('/interview/:id', auth_1.optionalAuth, interviewController.getById.bind(interviewController));
    router.post('/interview', auth_1.authenticateToken, interviewController.create.bind(interviewController));
    router.patch('/interview/:id', auth_1.authenticateToken, interviewController.update.bind(interviewController));
    router.delete('/interview/:id', auth_1.authenticateToken, interviewController.delete.bind(interviewController));
    router.get('/question', auth_1.optionalAuth, questionController.getAll.bind(questionController));
    router.get('/question/:id', auth_1.optionalAuth, questionController.getById.bind(questionController));
    router.post('/question', auth_1.authenticateToken, questionController.create.bind(questionController));
    router.patch('/question/:id', auth_1.authenticateToken, questionController.update.bind(questionController));
    router.delete('/question/:id', auth_1.authenticateToken, questionController.delete.bind(questionController));
    router.get('/applicant', auth_1.authenticateToken, applicantController.getAll.bind(applicantController));
    router.get('/applicant/:id', auth_1.authenticateToken, applicantController.getById.bind(applicantController));
    router.post('/applicant', auth_1.authenticateToken, applicantController.create.bind(applicantController));
    router.patch('/applicant/:id', auth_1.authenticateToken, applicantController.update.bind(applicantController));
    router.delete('/applicant/:id', auth_1.authenticateToken, applicantController.delete.bind(applicantController));
    router.get('/applicant_answer', auth_1.authenticateToken, applicantAnswerController.getAll.bind(applicantAnswerController));
    router.get('/applicant_answer/:id', auth_1.authenticateToken, applicantAnswerController.getById.bind(applicantAnswerController));
    router.post('/applicant_answer', auth_1.authenticateToken, applicantAnswerController.create.bind(applicantAnswerController));
    router.patch('/applicant_answer/:id', auth_1.authenticateToken, applicantAnswerController.update.bind(applicantAnswerController));
    router.delete('/applicant_answer/:id', auth_1.authenticateToken, applicantAnswerController.delete.bind(applicantAnswerController));
    return router;
}
//# sourceMappingURL=v2.js.map