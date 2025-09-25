import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create users
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@readysethire.com',
        passwordHash:
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });

    const recruiter1 = await prisma.user.upsert({
      where: { username: 'recruiter1' },
      update: {},
      create: {
        username: 'recruiter1',
        email: 'recruiter1@company.com',
        passwordHash:
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        firstName: 'John',
        lastName: 'Doe',
        role: 'RECRUITER',
      },
    });

    const recruiter2 = await prisma.user.upsert({
      where: { username: 'recruiter2' },
      update: {},
      create: {
        username: 'recruiter2',
        email: 'recruiter2@company.com',
        passwordHash:
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'RECRUITER',
      },
    });

    console.log('✅ Users created');

    // Create jobs
    const job1 = await prisma.job.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: 'Senior Frontend Developer',
        description:
          'We are looking for a skilled frontend developer with React experience to join our team. You will be responsible for building user interfaces and ensuring great user experience.',
        requirements: 'React, TypeScript, CSS, HTML, JavaScript, Git',
        location: 'Remote',
        salaryRange: '$80,000 - $120,000',
        status: 'PUBLISHED',
        userId: admin.id,
        publishedAt: new Date(),
      },
    });

    const job2 = await prisma.job.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: 'Backend Developer',
        description:
          'Join our backend team to build scalable APIs and microservices. Experience with Node.js and PostgreSQL required.',
        requirements: 'Node.js, PostgreSQL, Express, REST APIs, Docker',
        location: 'Sydney, Australia',
        salaryRange: '$70,000 - $100,000',
        status: 'PUBLISHED',
        userId: admin.id,
        publishedAt: new Date(),
      },
    });

    const job3 = await prisma.job.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: 'Full Stack Developer',
        description:
          'Looking for a versatile developer who can work on both frontend and backend. Perfect for someone who wants to grow their skills.',
        requirements: 'React, Node.js, PostgreSQL, TypeScript',
        location: 'Melbourne, Australia',
        salaryRange: '$75,000 - $110,000',
        status: 'PUBLISHED',
        userId: recruiter1.id,
        publishedAt: new Date(),
      },
    });

    console.log('✅ Jobs created');

    // Create interviews
    const interview1 = await prisma.interview.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: 'Frontend Developer Interview',
        jobRole: 'Senior Frontend Developer',
        description:
          'Technical interview focusing on React, TypeScript, and modern frontend development practices.',
        status: 'PUBLISHED',
        userId: admin.id,
        jobId: job1.id,
      },
    });

    const interview2 = await prisma.interview.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: 'Backend Developer Interview',
        jobRole: 'Backend Developer',
        description:
          'Technical interview covering Node.js, database design, and API development.',
        status: 'PUBLISHED',
        userId: admin.id,
        jobId: job2.id,
      },
    });

    const interview3 = await prisma.interview.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: 'Full Stack Interview',
        jobRole: 'Full Stack Developer',
        description:
          'Comprehensive interview covering both frontend and backend technologies.',
        status: 'PUBLISHED',
        userId: recruiter1.id,
        jobId: job3.id,
      },
    });

    console.log('✅ Interviews created');

    // Create questions
    const questions = [
      {
        interviewId: interview1.id,
        question:
          'Explain the difference between React functional components and class components. When would you use each?',
        difficulty: 'INTERMEDIATE' as const,
        userId: admin.id,
      },
      {
        interviewId: interview1.id,
        question:
          'How do you handle state management in a large React application? Discuss different approaches.',
        difficulty: 'ADVANCED' as const,
        userId: admin.id,
      },
      {
        interviewId: interview1.id,
        question:
          'What is TypeScript and what benefits does it provide over JavaScript?',
        difficulty: 'EASY' as const,
        userId: admin.id,
      },
      {
        interviewId: interview2.id,
        question:
          'Explain how you would design a RESTful API for a blog system.',
        difficulty: 'INTERMEDIATE' as const,
        userId: admin.id,
      },
      {
        interviewId: interview2.id,
        question: 'What are database indexes and when would you use them?',
        difficulty: 'INTERMEDIATE' as const,
        userId: admin.id,
      },
      {
        interviewId: interview3.id,
        question:
          'Describe your experience with both frontend and backend development.',
        difficulty: 'EASY' as const,
        userId: recruiter1.id,
      },
    ];

    for (const questionData of questions) {
      await prisma.question.create({
        data: questionData,
      });
    }

    console.log('✅ Questions created');

    // Create applicants
    const applicants = [
      {
        firstname: 'Alex',
        surname: 'Johnson',
        phoneNumber: '+61 412 345 678',
        emailAddress: 'alex.johnson@email.com',
        ownerId: admin.id,
      },
      {
        firstname: 'Sarah',
        surname: 'Wilson',
        phoneNumber: '+61 423 456 789',
        emailAddress: 'sarah.wilson@email.com',
        ownerId: admin.id,
      },
      {
        firstname: 'Michael',
        surname: 'Brown',
        phoneNumber: '+61 434 567 890',
        emailAddress: 'michael.brown@email.com',
        ownerId: admin.id,
      },
    ];

    const createdApplicants = [];
    for (const applicantData of applicants) {
      const applicant = await prisma.applicant.create({
        data: applicantData,
      });
      createdApplicants.push(applicant);
    }

    // Create applicant-interview relationships
    const applicantInterviews = [
      {
        applicantId: createdApplicants[0].id,
        interviewId: interview1.id,
        interviewStatus: 'NOT_STARTED' as const,
      },
      {
        applicantId: createdApplicants[1].id,
        interviewId: interview1.id,
        interviewStatus: 'COMPLETED' as const,
      },
      {
        applicantId: createdApplicants[2].id,
        interviewId: interview2.id,
        interviewStatus: 'NOT_STARTED' as const,
      },
    ];

    for (const applicantInterviewData of applicantInterviews) {
      await prisma.applicantInterview.create({
        data: applicantInterviewData,
      });
    }

    console.log('✅ Applicants created');

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed().catch(e => {
    console.error(e);
    process.exit(1);
  });
}

export default seed;
