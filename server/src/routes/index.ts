import { Router, Request, Response } from 'express';
import {
  userService,
  jobService,
  interviewService,
  questionService,
  applicantService,
  applicantAnswerService,
} from '../services/database';

export function createRoutes() {
  const router = Router();

  // Users routes
  router.get('/users', async (req: Request, res: Response) => {
    try {
      const users = await userService.findMany();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  router.get('/users/:id', async (req: Request, res: Response) => {
    try {
      const user = await userService.findUnique({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Jobs routes
  router.get('/jobs', async (req: Request, res: Response) => {
    try {
      const { user_id, status } = req.query;
      const where: any = {};
      if (user_id) where.userId = parseInt(user_id as string);
      if (status) where.status = status;

      const jobs = await jobService.findMany(where);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  router.get('/jobs/:id', async (req: Request, res: Response) => {
    try {
      const job = await jobService.findUnique({ id: parseInt(req.params.id) });
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.json(job);
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  });

  router.post('/jobs', async (req: Request, res: Response) => {
    try {
      const job = await jobService.create(req.body);
      res.status(201).json(job);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ error: 'Failed to create job' });
    }
  });

  router.patch('/jobs/:id', async (req: Request, res: Response) => {
    try {
      const job = await jobService.update(
        { id: parseInt(req.params.id) },
        req.body
      );
      res.json(job);
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({ error: 'Failed to update job' });
    }
  });

  router.delete('/jobs/:id', async (req: Request, res: Response) => {
    try {
      await jobService.delete({ id: parseInt(req.params.id) });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({ error: 'Failed to delete job' });
    }
  });

  // Interviews routes
  router.get('/interviews', async (req: Request, res: Response) => {
    try {
      const { user_id, job_id } = req.query;
      const where: any = {};
      if (user_id) where.userId = parseInt(user_id as string);
      if (job_id) where.jobId = parseInt(job_id as string);

      const interviews = await interviewService.findMany(where);
      res.json(interviews);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      res.status(500).json({ error: 'Failed to fetch interviews' });
    }
  });

  router.get('/interviews/:id', async (req: Request, res: Response) => {
    try {
      const interview = await interviewService.findUnique({
        id: parseInt(req.params.id),
      });
      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }
      res.json(interview);
    } catch (error) {
      console.error('Error fetching interview:', error);
      res.status(500).json({ error: 'Failed to fetch interview' });
    }
  });

  router.post('/interviews', async (req: Request, res: Response) => {
    try {
      const interview = await interviewService.create(req.body);
      res.status(201).json(interview);
    } catch (error) {
      console.error('Error creating interview:', error);
      res.status(500).json({ error: 'Failed to create interview' });
    }
  });

  router.patch('/interviews/:id', async (req: Request, res: Response) => {
    try {
      const interview = await interviewService.update(
        { id: parseInt(req.params.id) },
        req.body
      );
      res.json(interview);
    } catch (error) {
      console.error('Error updating interview:', error);
      res.status(500).json({ error: 'Failed to update interview' });
    }
  });

  router.delete('/interviews/:id', async (req: Request, res: Response) => {
    try {
      await interviewService.delete({ id: parseInt(req.params.id) });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting interview:', error);
      res.status(500).json({ error: 'Failed to delete interview' });
    }
  });

  // Questions routes
  router.get('/questions', async (req: Request, res: Response) => {
    try {
      const { interview_id } = req.query;
      const where: any = {};
      if (interview_id) where.interviewId = parseInt(interview_id as string);

      const questions = await questionService.findMany(where);
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  });

  router.get('/questions/:id', async (req: Request, res: Response) => {
    try {
      const question = await questionService.findUnique({
        id: parseInt(req.params.id),
      });
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.json(question);
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({ error: 'Failed to fetch question' });
    }
  });

  router.post('/questions', async (req: Request, res: Response) => {
    try {
      const question = await questionService.create(req.body);
      res.status(201).json(question);
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Failed to create question' });
    }
  });

  router.patch('/questions/:id', async (req: Request, res: Response) => {
    try {
      const question = await questionService.update(
        { id: parseInt(req.params.id) },
        req.body
      );
      res.json(question);
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  });

  router.delete('/questions/:id', async (req: Request, res: Response) => {
    try {
      await questionService.delete({ id: parseInt(req.params.id) });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  });

  // Applicants routes
  router.get('/applicants', async (req: Request, res: Response) => {
    try {
      const { interview_id } = req.query;
      const where: any = {};
      if (interview_id) where.interviewId = parseInt(interview_id as string);

      const applicants = await applicantService.findMany(where);
      res.json(applicants);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      res.status(500).json({ error: 'Failed to fetch applicants' });
    }
  });

  router.get('/applicants/:id', async (req: Request, res: Response) => {
    try {
      const applicant = await applicantService.findUnique({
        id: parseInt(req.params.id),
      });
      if (!applicant) {
        return res.status(404).json({ error: 'Applicant not found' });
      }
      res.json(applicant);
    } catch (error) {
      console.error('Error fetching applicant:', error);
      res.status(500).json({ error: 'Failed to fetch applicant' });
    }
  });

  router.post('/applicants', async (req: Request, res: Response) => {
    try {
      const applicant = await applicantService.create(req.body);
      res.status(201).json(applicant);
    } catch (error) {
      console.error('Error creating applicant:', error);
      res.status(500).json({ error: 'Failed to create applicant' });
    }
  });

  router.patch('/applicants/:id', async (req: Request, res: Response) => {
    try {
      const applicant = await applicantService.update(
        { id: parseInt(req.params.id) },
        req.body
      );
      res.json(applicant);
    } catch (error) {
      console.error('Error updating applicant:', error);
      res.status(500).json({ error: 'Failed to update applicant' });
    }
  });

  router.delete('/applicants/:id', async (req: Request, res: Response) => {
    try {
      await applicantService.delete({ id: parseInt(req.params.id) });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting applicant:', error);
      res.status(500).json({ error: 'Failed to delete applicant' });
    }
  });

  // Applicant answers routes
  router.get('/applicant_answers', async (req: Request, res: Response) => {
    try {
      const { applicant_id, question_id } = req.query;
      const where: any = {};
      if (applicant_id) where.applicantId = parseInt(applicant_id as string);
      if (question_id) where.questionId = parseInt(question_id as string);

      const answers = await applicantAnswerService.findMany(where);
      res.json(answers);
    } catch (error) {
      console.error('Error fetching answers:', error);
      res.status(500).json({ error: 'Failed to fetch answers' });
    }
  });

  router.get('/applicant_answers/:id', async (req: Request, res: Response) => {
    try {
      const answer = await applicantAnswerService.findUnique({
        id: parseInt(req.params.id),
      });
      if (!answer) {
        return res.status(404).json({ error: 'Answer not found' });
      }
      res.json(answer);
    } catch (error) {
      console.error('Error fetching answer:', error);
      res.status(500).json({ error: 'Failed to fetch answer' });
    }
  });

  router.post('/applicant_answers', async (req: Request, res: Response) => {
    try {
      const answer = await applicantAnswerService.create(req.body);
      res.status(201).json(answer);
    } catch (error) {
      console.error('Error creating answer:', error);
      res.status(500).json({ error: 'Failed to create answer' });
    }
  });

  router.patch(
    '/applicant_answers/:id',
    async (req: Request, res: Response) => {
      try {
        const answer = await applicantAnswerService.update(
          { id: parseInt(req.params.id) },
          req.body
        );
        res.json(answer);
      } catch (error) {
        console.error('Error updating answer:', error);
        res.status(500).json({ error: 'Failed to update answer' });
      }
    }
  );

  router.delete(
    '/applicant_answers/:id',
    async (req: Request, res: Response) => {
      try {
        await applicantAnswerService.delete({ id: parseInt(req.params.id) });
        res.status(204).send();
      } catch (error) {
        console.error('Error deleting answer:', error);
        res.status(500).json({ error: 'Failed to delete answer' });
      }
    }
  );

  return router;
}
