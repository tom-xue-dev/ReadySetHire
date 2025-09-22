import { Request, Response } from 'express';
import { CRUDController, ValidationUtils, ErrorHandler } from './base';
import { JobService, InterviewService, QuestionService, ApplicantService, ApplicantAnswerService } from '../services/database';

// Job Controller
export class JobController extends CRUDController<any> {
  constructor(private jobService: JobService) {
    super(jobService);
  }

  protected validateAndTransformData(data: any, req?: any): any {
    ValidationUtils.validateRequired(data, ['title', 'description']);
    
    return {
      title: ValidationUtils.sanitizeString(data.title),
      description: ValidationUtils.sanitizeString(data.description),
      requirements: data.requirements ? ValidationUtils.sanitizeString(data.requirements) : null,
      location: data.location ? ValidationUtils.sanitizeString(data.location) : null,
      salaryRange: data.salaryRange ? ValidationUtils.sanitizeString(data.salaryRange) : null,
      status: data.status || 'DRAFT',
      userId: req?.user?.id || data.userId || data.user_id
    };
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = this.validateAndTransformData(req.body, req);
      const item = await this.service.create(data);
      res.status(201).json(item);
    } catch (error) {
      console.error(`Error creating ${this.modelName}:`, error);
      res.status(500).json({ error: `Failed to create ${this.modelName}` });
    }
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID format' });
        return;
      }

      const jobs = await this.jobService.findByUserId(userId);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs by user:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  }

  async getPublished(req: Request, res: Response): Promise<void> {
    try {
      const jobs = await this.jobService.findPublished();
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching published jobs:', error);
      res.status(500).json({ error: 'Failed to fetch published jobs' });
    }
  }

  async publish(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }

      const job = await this.jobService.update(
        id,
        { status: 'PUBLISHED', publishedAt: new Date() }
      );
      res.json(job);
    } catch (error) {
      console.error('Error publishing job:', error);
      res.status(500).json({ error: 'Failed to publish job' });
    }
  }
}

// Interview Controller
export class InterviewController extends CRUDController<any> {
  constructor(private interviewService: InterviewService) {
    super(interviewService);
  }

  protected validateAndTransformData(data: any, req?: any): any {
    ValidationUtils.validateRequired(data, ['title', 'jobRole']);
    
    return {
      title: ValidationUtils.sanitizeString(data.title),
      jobRole: ValidationUtils.sanitizeString(data.jobRole),
      description: data.description ? ValidationUtils.sanitizeString(data.description) : null,
      status: data.status || 'DRAFT',
      userId: req?.user?.id || data.userId || data.user_id,
      jobId: data.jobId || data.job_id
    };
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = this.validateAndTransformData(req.body, req);
      const item = await this.service.create(data);
      res.status(201).json(item);
    } catch (error) {
      console.error(`Error creating ${this.modelName}:`, error);
      res.status(500).json({ error: `Failed to create ${this.modelName}` });
    }
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID format' });
        return;
      }

      const interviews = await this.interviewService.findByUserId(userId);
      res.json({
        data: interviews
      });
    } catch (error) {
      console.error('Error fetching interviews by user:', error);
      res.status(500).json({ error: 'Failed to fetch interviews' });
    }
  }

  async getByJobId(req: Request, res: Response): Promise<void> {
    try {
      const jobId = parseInt(req.params.jobId);
      if (isNaN(jobId)) {
        res.status(400).json({ error: 'Invalid job ID format' });
        return;
      }

      const interviews = await this.interviewService.findByJobId(jobId);
      res.json({
        data: interviews
      });
    } catch (error) {
      console.error('Error fetching interviews by job:', error);
      res.status(500).json({ error: 'Failed to fetch interviews' });
    }
  }

  async getComplete(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Error fetching complete interview:', error);
      res.status(500).json({ error: 'Failed to fetch interview' });
    }
  }

  async publish(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }

      const interview = await this.interviewService.update(
        id,
        { status: 'PUBLISHED' }
      );
      res.json(interview);
    } catch (error) {
      console.error('Error publishing interview:', error);
      res.status(500).json({ error: 'Failed to publish interview' });
    }
  }
}

// Question Controller
export class QuestionController extends CRUDController<any> {
  constructor(private questionService: QuestionService) {
    super(questionService);
  }

  protected validateAndTransformData(data: any, req?: any): any {
    // Handle both camelCase and snake_case field names from frontend
    const interviewId = data.interviewId || data.interview_id;
    const userId = req?.user?.id || data.userId || data.user_id;
    
    ValidationUtils.validateRequired(data, ['question']);
    
    // Check required fields with proper field names
    if (!interviewId) {
      throw new Error('Missing required field: interviewId');
    }
    
    if (!userId) {
      throw new Error('Missing required field: userId - user must be authenticated');
    }
    
    // Convert difficulty to uppercase enum value
    let difficulty = 'EASY';
    if (data.difficulty) {
      const diff = String(data.difficulty).toUpperCase();
      if (['EASY', 'INTERMEDIATE', 'ADVANCED'].includes(diff)) {
        difficulty = diff;
      }
    }
    
    return {
      question: ValidationUtils.sanitizeString(data.question),
      difficulty: difficulty,
      interviewId: interviewId,
      userId: userId
    };
  }

  async getByInterviewId(req: Request, res: Response): Promise<void> {
    try {
      const interviewId = parseInt(req.params.interviewId);
      if (isNaN(interviewId)) {
        res.status(400).json({ error: 'Invalid interview ID format' });
        return;
      }

      const questions = await this.questionService.findByInterviewId(interviewId);
      res.json({
        data: questions
      });
    } catch (error) {
      console.error('Error fetching questions by interview:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  }

  async getByDifficulty(req: Request, res: Response): Promise<void> {
    try {
      const difficulty = req.params.difficulty;
      if (!ValidationUtils.validateEnum(difficulty, ['EASY', 'INTERMEDIATE', 'ADVANCED'])) {
        res.status(400).json({ error: 'Invalid difficulty level' });
        return;
      }

      const questions = await this.questionService.findByDifficulty(difficulty);
      res.json({
        data: questions
      });
    } catch (error) {
      console.error('Error fetching questions by difficulty:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  }
}

// Applicant Controller
export class ApplicantController extends CRUDController<any> {
  constructor(private applicantService: ApplicantService) {
    super(applicantService);
  }

  protected validateAndTransformData(data: any, req?: any): any {
    // Handle both camelCase and snake_case field names from frontend
    const emailAddress = data.emailAddress || data.email_address;
    const phoneNumber = data.phoneNumber || data.phone_number;
    const ownerId = req?.user?.id || data.ownerId || data.owner_id;
    
    ValidationUtils.validateRequired(data, ['firstname', 'surname']);
    
    // Check required fields with proper field names
    if (!emailAddress) {
      throw new Error('Missing required field: emailAddress');
    }
    
    if (!ownerId) {
      throw new Error('Missing required field: ownerId - user must be authenticated');
    }
    
    if (!ValidationUtils.validateEmail(emailAddress)) {
      throw new Error('Invalid email address');
    }

    if (phoneNumber && !ValidationUtils.validatePhone(phoneNumber)) {
      throw new Error('Invalid phone number');
    }

    return {
      firstname: ValidationUtils.sanitizeString(data.firstname),
      surname: ValidationUtils.sanitizeString(data.surname),
      phoneNumber: phoneNumber ? ValidationUtils.sanitizeString(phoneNumber) : null,
      emailAddress: ValidationUtils.sanitizeString(emailAddress),
      ownerId: ownerId
    };
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const applicants = await this.applicantService.getAllWithInterviews();
      res.json({
        data: applicants
      });
    } catch (error) {
      console.error('Error fetching applicants:', error);
      res.status(500).json({ error: 'Failed to fetch applicants' });
    }
  }

  async getByInterviewId(req: Request, res: Response): Promise<void> {
    try {
      const interviewId = parseInt(req.params.interviewId);
      if (isNaN(interviewId)) {
        res.status(400).json({ error: 'Invalid interview ID format' });
        return;
      }

      const applicants = await this.applicantService.findByInterviewId(interviewId);
      res.json({
        data: applicants
      });
    } catch (error) {
      console.error('Error fetching applicants by interview:', error);
      res.status(500).json({ error: 'Failed to fetch applicants' });
    }
  }

  async getByStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = req.params.status;
      if (!ValidationUtils.validateEnum(status, ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const applicants = await this.applicantService.findByStatus(status);
      res.json({
        data: applicants
      });
    } catch (error) {
      console.error('Error fetching applicants by status:', error);
      res.status(500).json({ error: 'Failed to fetch applicants' });
    }
  }

  async getWithAnswers(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Error fetching applicant with answers:', error);
      res.status(500).json({ error: 'Failed to fetch applicant' });
    }
  }

  async bindToInterview(req: Request, res: Response): Promise<void> {
    try {
      const applicantId = parseInt(req.params.applicantId);
      const { interviewId, status = 'NOT_STARTED' } = req.body;

      if (isNaN(applicantId)) {
        res.status(400).json({ error: 'Invalid applicant ID format' });
        return;
      }

      if (!interviewId) {
        res.status(400).json({ error: 'Interview ID is required' });
        return;
      }

      const result = await this.applicantService.bindToInterview(applicantId, interviewId, status);
      res.json(result);
    } catch (error) {
      console.error('Error binding applicant to interview:', error);
      res.status(500).json({ error: 'Failed to bind applicant to interview' });
    }
  }

  async unbindFromInterview(req: Request, res: Response): Promise<void> {
    try {
      const applicantId = parseInt(req.params.applicantId);
      const { interviewId } = req.body;

      if (isNaN(applicantId)) {
        res.status(400).json({ error: 'Invalid applicant ID format' });
        return;
      }

      if (!interviewId) {
        res.status(400).json({ error: 'Interview ID is required' });
        return;
      }

      await this.applicantService.unbindFromInterview(applicantId, interviewId);
      res.status(204).send();
    } catch (error) {
      console.error('Error unbinding applicant from interview:', error);
      res.status(500).json({ error: 'Failed to unbind applicant from interview' });
    }
  }
}

// Applicant Answer Controller
export class ApplicantAnswerController extends CRUDController<any> {
  constructor(private applicantAnswerService: ApplicantAnswerService) {
    super(applicantAnswerService);
  }

  protected validateAndTransformData(data: any): any {
    ValidationUtils.validateRequired(data, ['interviewId', 'questionId', 'applicantId']);
    
    return {
      answer: data.answer ? ValidationUtils.sanitizeString(data.answer) : null,
      interviewId: data.interviewId || data.interview_id,
      questionId: data.questionId || data.question_id,
      applicantId: data.applicantId || data.applicant_id,
      userId: data.userId || data.user_id
    };
  }

  async getByApplicantId(req: Request, res: Response): Promise<void> {
    try {
      const applicantId = parseInt(req.params.applicantId);
      if (isNaN(applicantId)) {
        res.status(400).json({ error: 'Invalid applicant ID format' });
        return;
      }

      const answers = await this.applicantAnswerService.findByApplicantId(applicantId);
      res.json({
        data: answers
      });
    } catch (error) {
      console.error('Error fetching answers by applicant:', error);
      res.status(500).json({ error: 'Failed to fetch answers' });
    }
  }

  async getByQuestionId(req: Request, res: Response): Promise<void> {
    try {
      const questionId = parseInt(req.params.questionId);
      if (isNaN(questionId)) {
        res.status(400).json({ error: 'Invalid question ID format' });
        return;
      }

      const answers = await this.applicantAnswerService.findByQuestionId(questionId);
      res.json({
        data: answers
      });
    } catch (error) {
      console.error('Error fetching answers by question:', error);
      res.status(500).json({ error: 'Failed to fetch answers' });
    }
  }

  async getByInterviewId(req: Request, res: Response): Promise<void> {
    try {
      const interviewId = parseInt(req.params.interviewId);
      if (isNaN(interviewId)) {
        res.status(400).json({ error: 'Invalid interview ID format' });
        return;
      }

      const answers = await this.applicantAnswerService.findByInterviewId(interviewId);
      res.json({
        data: answers
      });
    } catch (error) {
      console.error('Error fetching answers by interview:', error);
      res.status(500).json({ error: 'Failed to fetch answers' });
    }
  }

  async getWithDetails(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Error fetching answer with details:', error);
      res.status(500).json({ error: 'Failed to fetch answer' });
    }
  }
}
