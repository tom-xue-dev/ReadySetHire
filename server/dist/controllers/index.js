"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantAnswerController = exports.ApplicantController = exports.QuestionController = exports.InterviewController = exports.JobController = void 0;
const base_1 = require("./base");
// Job Controller
class JobController extends base_1.CRUDController {
    jobService;
    constructor(jobService) {
        super(jobService);
        this.jobService = jobService;
    }
    validateAndTransformData(data, req) {
        base_1.ValidationUtils.validateRequired(data, ['title', 'description']);
        return {
            title: base_1.ValidationUtils.sanitizeString(data.title),
            description: base_1.ValidationUtils.sanitizeString(data.description),
            requirements: data.requirements ? base_1.ValidationUtils.sanitizeString(data.requirements) : null,
            location: data.location ? base_1.ValidationUtils.sanitizeString(data.location) : null,
            salaryRange: data.salaryRange ? base_1.ValidationUtils.sanitizeString(data.salaryRange) : null,
            status: data.status || 'DRAFT',
            userId: req?.user?.id || data.userId || data.user_id
        };
    }
    async create(req, res) {
        try {
            const data = this.validateAndTransformData(req.body, req);
            const item = await this.service.create(data);
            res.status(201).json(item);
        }
        catch (error) {
            console.error(`Error creating ${this.modelName}:`, error);
            res.status(500).json({ error: `Failed to create ${this.modelName}` });
        }
    }
    async getByUserId(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID format' });
                return;
            }
            const jobs = await this.jobService.findByUserId(userId);
            res.json(jobs);
        }
        catch (error) {
            console.error('Error fetching jobs by user:', error);
            res.status(500).json({ error: 'Failed to fetch jobs' });
        }
    }
    async getPublished(req, res) {
        try {
            const jobs = await this.jobService.findPublished();
            res.json(jobs);
        }
        catch (error) {
            console.error('Error fetching published jobs:', error);
            res.status(500).json({ error: 'Failed to fetch published jobs' });
        }
    }
    async publish(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            const job = await this.jobService.update(id, { status: 'PUBLISHED', publishedAt: new Date() });
            res.json(job);
        }
        catch (error) {
            console.error('Error publishing job:', error);
            res.status(500).json({ error: 'Failed to publish job' });
        }
    }
}
exports.JobController = JobController;
// Interview Controller
class InterviewController extends base_1.CRUDController {
    interviewService;
    constructor(interviewService) {
        super(interviewService);
        this.interviewService = interviewService;
    }
    validateAndTransformData(data, req) {
        base_1.ValidationUtils.validateRequired(data, ['title', 'jobRole']);
        return {
            title: base_1.ValidationUtils.sanitizeString(data.title),
            jobRole: base_1.ValidationUtils.sanitizeString(data.jobRole),
            description: data.description ? base_1.ValidationUtils.sanitizeString(data.description) : null,
            status: data.status || 'DRAFT',
            userId: req?.user?.id || data.userId || data.user_id,
            jobId: data.jobId || data.job_id
        };
    }
    async create(req, res) {
        try {
            const data = this.validateAndTransformData(req.body, req);
            const item = await this.service.create(data);
            res.status(201).json(item);
        }
        catch (error) {
            console.error(`Error creating ${this.modelName}:`, error);
            res.status(500).json({ error: `Failed to create ${this.modelName}` });
        }
    }
    async getByUserId(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID format' });
                return;
            }
            const interviews = await this.interviewService.findByUserId(userId);
            res.json(interviews);
        }
        catch (error) {
            console.error('Error fetching interviews by user:', error);
            res.status(500).json({ error: 'Failed to fetch interviews' });
        }
    }
    async getByJobId(req, res) {
        try {
            const jobId = parseInt(req.params.jobId);
            if (isNaN(jobId)) {
                res.status(400).json({ error: 'Invalid job ID format' });
                return;
            }
            const interviews = await this.interviewService.findByJobId(jobId);
            res.json(interviews);
        }
        catch (error) {
            console.error('Error fetching interviews by job:', error);
            res.status(500).json({ error: 'Failed to fetch interviews' });
        }
    }
    async getComplete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            const interview = await this.interviewService.findComplete(id);
            if (!interview) {
                res.status(404).json({ error: 'Interview not found' });
                return;
            }
            res.json(interview);
        }
        catch (error) {
            console.error('Error fetching complete interview:', error);
            res.status(500).json({ error: 'Failed to fetch interview' });
        }
    }
    async publish(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            const interview = await this.interviewService.update(id, { status: 'PUBLISHED' });
            res.json(interview);
        }
        catch (error) {
            console.error('Error publishing interview:', error);
            res.status(500).json({ error: 'Failed to publish interview' });
        }
    }
}
exports.InterviewController = InterviewController;
// Question Controller
class QuestionController extends base_1.CRUDController {
    questionService;
    constructor(questionService) {
        super(questionService);
        this.questionService = questionService;
    }
    validateAndTransformData(data) {
        base_1.ValidationUtils.validateRequired(data, ['question', 'interviewId']);
        return {
            question: base_1.ValidationUtils.sanitizeString(data.question),
            difficulty: data.difficulty || 'EASY',
            interviewId: data.interviewId || data.interview_id,
            userId: data.userId || data.user_id
        };
    }
    async getByInterviewId(req, res) {
        try {
            const interviewId = parseInt(req.params.interviewId);
            if (isNaN(interviewId)) {
                res.status(400).json({ error: 'Invalid interview ID format' });
                return;
            }
            const questions = await this.questionService.findByInterviewId(interviewId);
            res.json(questions);
        }
        catch (error) {
            console.error('Error fetching questions by interview:', error);
            res.status(500).json({ error: 'Failed to fetch questions' });
        }
    }
    async getByDifficulty(req, res) {
        try {
            const difficulty = req.params.difficulty;
            if (!base_1.ValidationUtils.validateEnum(difficulty, ['EASY', 'INTERMEDIATE', 'ADVANCED'])) {
                res.status(400).json({ error: 'Invalid difficulty level' });
                return;
            }
            const questions = await this.questionService.findByDifficulty(difficulty);
            res.json(questions);
        }
        catch (error) {
            console.error('Error fetching questions by difficulty:', error);
            res.status(500).json({ error: 'Failed to fetch questions' });
        }
    }
}
exports.QuestionController = QuestionController;
// Applicant Controller
class ApplicantController extends base_1.CRUDController {
    applicantService;
    constructor(applicantService) {
        super(applicantService);
        this.applicantService = applicantService;
    }
    validateAndTransformData(data) {
        base_1.ValidationUtils.validateRequired(data, ['firstname', 'surname', 'emailAddress', 'interviewId']);
        if (!base_1.ValidationUtils.validateEmail(data.emailAddress)) {
            throw new Error('Invalid email address');
        }
        if (data.phoneNumber && !base_1.ValidationUtils.validatePhone(data.phoneNumber)) {
            throw new Error('Invalid phone number');
        }
        return {
            firstname: base_1.ValidationUtils.sanitizeString(data.firstname),
            surname: base_1.ValidationUtils.sanitizeString(data.surname),
            title: data.title || 'MR',
            phoneNumber: data.phoneNumber ? base_1.ValidationUtils.sanitizeString(data.phoneNumber) : null,
            emailAddress: base_1.ValidationUtils.sanitizeString(data.emailAddress),
            interviewStatus: data.interviewStatus || 'NOT_STARTED',
            interviewId: data.interviewId || data.interview_id,
            userId: data.userId || data.user_id
        };
    }
    async getByInterviewId(req, res) {
        try {
            const interviewId = parseInt(req.params.interviewId);
            if (isNaN(interviewId)) {
                res.status(400).json({ error: 'Invalid interview ID format' });
                return;
            }
            const applicants = await this.applicantService.findByInterviewId(interviewId);
            res.json(applicants);
        }
        catch (error) {
            console.error('Error fetching applicants by interview:', error);
            res.status(500).json({ error: 'Failed to fetch applicants' });
        }
    }
    async getByStatus(req, res) {
        try {
            const status = req.params.status;
            if (!base_1.ValidationUtils.validateEnum(status, ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])) {
                res.status(400).json({ error: 'Invalid status' });
                return;
            }
            const applicants = await this.applicantService.findByStatus(status);
            res.json(applicants);
        }
        catch (error) {
            console.error('Error fetching applicants by status:', error);
            res.status(500).json({ error: 'Failed to fetch applicants' });
        }
    }
    async getWithAnswers(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            const applicant = await this.applicantService.findWithAnswers(id);
            if (!applicant) {
                res.status(404).json({ error: 'Applicant not found' });
                return;
            }
            res.json(applicant);
        }
        catch (error) {
            console.error('Error fetching applicant with answers:', error);
            res.status(500).json({ error: 'Failed to fetch applicant' });
        }
    }
    async updateStatus(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            if (!base_1.ValidationUtils.validateEnum(status, ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])) {
                res.status(400).json({ error: 'Invalid status' });
                return;
            }
            const applicant = await this.applicantService.update(id, { interviewStatus: status });
            res.json(applicant);
        }
        catch (error) {
            console.error('Error updating applicant status:', error);
            res.status(500).json({ error: 'Failed to update applicant status' });
        }
    }
}
exports.ApplicantController = ApplicantController;
// Applicant Answer Controller
class ApplicantAnswerController extends base_1.CRUDController {
    applicantAnswerService;
    constructor(applicantAnswerService) {
        super(applicantAnswerService);
        this.applicantAnswerService = applicantAnswerService;
    }
    validateAndTransformData(data) {
        base_1.ValidationUtils.validateRequired(data, ['interviewId', 'questionId', 'applicantId']);
        return {
            answer: data.answer ? base_1.ValidationUtils.sanitizeString(data.answer) : null,
            interviewId: data.interviewId || data.interview_id,
            questionId: data.questionId || data.question_id,
            applicantId: data.applicantId || data.applicant_id,
            userId: data.userId || data.user_id
        };
    }
    async getByApplicantId(req, res) {
        try {
            const applicantId = parseInt(req.params.applicantId);
            if (isNaN(applicantId)) {
                res.status(400).json({ error: 'Invalid applicant ID format' });
                return;
            }
            const answers = await this.applicantAnswerService.findByApplicantId(applicantId);
            res.json(answers);
        }
        catch (error) {
            console.error('Error fetching answers by applicant:', error);
            res.status(500).json({ error: 'Failed to fetch answers' });
        }
    }
    async getByQuestionId(req, res) {
        try {
            const questionId = parseInt(req.params.questionId);
            if (isNaN(questionId)) {
                res.status(400).json({ error: 'Invalid question ID format' });
                return;
            }
            const answers = await this.applicantAnswerService.findByQuestionId(questionId);
            res.json(answers);
        }
        catch (error) {
            console.error('Error fetching answers by question:', error);
            res.status(500).json({ error: 'Failed to fetch answers' });
        }
    }
    async getByInterviewId(req, res) {
        try {
            const interviewId = parseInt(req.params.interviewId);
            if (isNaN(interviewId)) {
                res.status(400).json({ error: 'Invalid interview ID format' });
                return;
            }
            const answers = await this.applicantAnswerService.findByInterviewId(interviewId);
            res.json(answers);
        }
        catch (error) {
            console.error('Error fetching answers by interview:', error);
            res.status(500).json({ error: 'Failed to fetch answers' });
        }
    }
    async getWithDetails(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            const answer = await this.applicantAnswerService.findWithDetails(id);
            if (!answer) {
                res.status(404).json({ error: 'Answer not found' });
                return;
            }
            res.json(answer);
        }
        catch (error) {
            console.error('Error fetching answer with details:', error);
            res.status(500).json({ error: 'Failed to fetch answer' });
        }
    }
}
exports.ApplicantAnswerController = ApplicantAnswerController;
//# sourceMappingURL=index.js.map