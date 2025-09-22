import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
  public prisma: PrismaClient;
  public model: string;

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

  async findUnique(where: any, options?: { select?: any; include?: any }): Promise<T | null> {
    return (this.prisma as any)[this.model].findUnique({ where, ...options });
  }

  async findFirst(where: any, include?: any): Promise<T | null> {
    return (this.prisma as any)[this.model].findFirst({ where, include });
  }

  async update(id: number, data: any): Promise<T> {
    return (this.prisma as any)[this.model].update({ where: { id }, data });
  }

  async delete(where: any): Promise<T> {
    return (this.prisma as any)[this.model].delete({ where });
  }

  async count(where?: any): Promise<number> {
    return (this.prisma as any)[this.model].count({ where });
  }
}

// User service with authentication methods
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

  // Authentication methods
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'ADMIN' | 'RECRUITER' | 'INTERVIEWER';
  }) {
    const { password, ...data } = userData;
    const passwordHash = await bcrypt.hash(password, 12);
    
    return this.create({
      ...data,
      passwordHash,
    });
  }

  async validatePassword(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async authenticateUser(usernameOrEmail: string, password: string) {
    // Try to find user by username or email
    const user = await this.findByUsername(usernameOrEmail) || 
                 await this.findByEmail(usernameOrEmail);
    
    if (!user) {
      return null;
    }

    const isValidPassword = await this.validatePassword(user, password);
    if (!isValidPassword) {
      return null;
    }

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updatePassword(userId: number, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    return this.update(userId, { passwordHash });
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
    return this.findUnique({ id: interviewId }, { include: { questions: true } });
  }

  async findWithApplicants(interviewId: number) {
    return this.findUnique({ id: interviewId }, { include: { applicants: true } });
  }

  async findComplete(interviewId: number) {
    return this.findUnique(
      { id: interviewId },
      {
        include: {
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
    return (this.prisma as any)[this.model].findMany({
      include: {
        applicantInterviews: {
          where: { interviewId },
          include: {
            interview: {
              include: {
                job: true
              }
            }
          }
        }
      }
    });
  }

  async findByStatus(status: string) {
    return (this.prisma as any)[this.model].findMany({
      include: {
        applicantInterviews: {
          where: { interviewStatus: status },
          include: {
            interview: {
              include: {
                job: true
              }
            }
          }
        }
      }
    });
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
          applicantInterviews: {
            include: {
              interview: {
                include: {
                  job: true
                }
              }
            }
          }
        },
      }
    );
  }

  async getAllWithInterviews() {
    return (this.prisma as any)[this.model].findMany({
      include: {
        applicantInterviews: {
          include: {
            interview: {
              include: {
                job: true
              }
            }
          }
        }
      }
    });
  }

  async bindToInterview(applicantId: number, interviewId: number, status: string = 'NOT_STARTED') {
    return (this.prisma as any).applicantInterview.create({
      data: {
        applicantId,
        interviewId,
        interviewStatus: status
      }
    });
  }

  async unbindFromInterview(applicantId: number, interviewId: number) {
    return (this.prisma as any).applicantInterview.deleteMany({
      where: {
        applicantId,
        interviewId
      }
    });
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
