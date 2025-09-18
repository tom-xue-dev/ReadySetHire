import { PrismaClient } from '@prisma/client';

// Singleton Prisma client instance
let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    // Use test database URL if in test environment
    const databaseUrl =
      process.env.NODE_ENV === 'test'
        ? process.env.TEST_DATABASE_URL
        : process.env.DATABASE_URL;

    global.__prisma = new PrismaClient({
      datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

export default prisma;

// Base service class with common CRUD operations
export abstract class BaseService<T> {
  protected prisma: PrismaClient;
  protected model: string;

  constructor(prisma: PrismaClient, model: string) {
    this.prisma = prisma;
    this.model = model;
  }

  async create(data: any): Promise<T> {
    return (this.prisma as any)[this.model].create({ data });
  }

  async findMany(where?: any, include?: any): Promise<T[]> {
    return (this.prisma as any)[this.model].findMany({ where, include });
  }

  async findUnique(where: any, include?: any): Promise<T | null> {
    return (this.prisma as any)[this.model].findUnique({ where, include });
  }

  async findFirst(where: any, include?: any): Promise<T | null> {
    return (this.prisma as any)[this.model].findFirst({ where, include });
  }

  async update(where: any, data: any): Promise<T> {
    return (this.prisma as any)[this.model].update({ where, data });
  }

  async delete(where: any): Promise<T> {
    return (this.prisma as any)[this.model].delete({ where });
  }

  async count(where?: any): Promise<number> {
    return (this.prisma as any)[this.model].count({ where });
  }
}

// User service with additional methods
export class UserService extends BaseService<any> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  async findByUsername(username: string) {
    return this.findUnique({ username });
  }

  async findByEmail(email: string) {
    return this.findUnique({ email });
  }

  async findWithJobs(userId: number) {
    return this.findUnique({ id: userId }, { include: { jobs: true } });
  }
}

// Job service with additional methods
export class JobService extends BaseService<any> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'job');
  }

  async findByUserId(userId: number) {
    return this.findMany({ userId });
  }

  async findPublished() {
    return this.findMany({ status: 'PUBLISHED' });
  }

  async findWithInterviews(jobId: number) {
    return this.findUnique({ id: jobId }, { include: { interviews: true } });
  }
}

// Interview service with additional methods
export class InterviewService extends BaseService<any> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'interview');
  }

  async findByUserId(userId: number) {
    return this.findMany({ userId });
  }

  async findByJobId(jobId: number) {
    return this.findMany({ jobId });
  }

  async findWithQuestions(interviewId: number) {
    return this.findUnique({ id: interviewId }, { questions: true });
  }

  async findWithApplicants(interviewId: number) {
    return this.findUnique({ id: interviewId }, { applicants: true });
  }

  async findComplete(interviewId: number) {
    return this.findUnique(
      { id: interviewId },
      {
        questions: true,
        applicants: {
          include: {
            applicantAnswers: {
              include: {
                question: true,
              },
            },
          },
        },
      }
    );
  }
}

// Question service with additional methods
export class QuestionService extends BaseService<any> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'question');
  }

  async findByInterviewId(interviewId: number) {
    return this.findMany({ interviewId });
  }

  async findByDifficulty(difficulty: string) {
    return this.findMany({ difficulty });
  }
}

// Applicant service with additional methods
export class ApplicantService extends BaseService<any> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'applicant');
  }

  async findByInterviewId(interviewId: number) {
    return this.findMany({ interviewId });
  }

  async findByStatus(status: string) {
    return this.findMany({ interviewStatus: status });
  }

  async findWithAnswers(applicantId: number) {
    return this.findUnique(
      { id: applicantId },
      {
        include: {
          applicantAnswers: {
            include: {
              question: true,
            },
          },
        },
      }
    );
  }
}

// ApplicantAnswer service with additional methods
export class ApplicantAnswerService extends BaseService<any> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'applicantAnswer');
  }

  async findByApplicantId(applicantId: number) {
    return this.findMany({ applicantId });
  }

  async findByQuestionId(questionId: number) {
    return this.findMany({ questionId });
  }

  async findByInterviewId(interviewId: number) {
    return this.findMany({ interviewId });
  }

  async findWithDetails(answerId: number) {
    return this.findUnique(
      { id: answerId },
      {
        include: {
          question: true,
          applicant: true,
          interview: true,
        },
      }
    );
  }
}

// Initialize all services
export const userService = new UserService(prisma);
export const jobService = new JobService(prisma);
export const interviewService = new InterviewService(prisma);
export const questionService = new QuestionService(prisma);
export const applicantService = new ApplicantService(prisma);
export const applicantAnswerService = new ApplicantAnswerService(prisma);
