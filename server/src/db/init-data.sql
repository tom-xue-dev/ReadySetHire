-- Initialize database with sample data
-- This file is automatically executed when PostgreSQL container starts

-- Insert sample users
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@readysethire.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin'),
('recruiter1', 'recruiter1@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'recruiter'),
('recruiter2', 'recruiter2@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', 'recruiter')
ON CONFLICT (username) DO NOTHING;

-- Insert sample jobs
INSERT INTO jobs (title, description, requirements, location, salary_range, status, user_id, published_at) VALUES
('Senior Frontend Developer', 'We are looking for a skilled frontend developer with React experience to join our team. You will be responsible for building user interfaces and ensuring great user experience.', 'React, TypeScript, CSS, HTML, JavaScript, Git', 'Remote', '$80,000 - $120,000', 'published', 1, CURRENT_TIMESTAMP),
('Backend Developer', 'Join our backend team to build scalable APIs and microservices. Experience with Node.js and PostgreSQL required.', 'Node.js, PostgreSQL, Express, REST APIs, Docker', 'Sydney, Australia', '$70,000 - $100,000', 'published', 1, CURRENT_TIMESTAMP),
('Full Stack Developer', 'Looking for a versatile developer who can work on both frontend and backend. Perfect for someone who wants to grow their skills.', 'React, Node.js, PostgreSQL, TypeScript', 'Melbourne, Australia', '$75,000 - $110,000', 'published', 2, CURRENT_TIMESTAMP),
('DevOps Engineer', 'We need someone to help us scale our infrastructure and improve our deployment processes.', 'Docker, Kubernetes, AWS, CI/CD, Linux', 'Remote', '$90,000 - $130,000', 'draft', 2, NULL)
ON CONFLICT DO NOTHING;

-- Insert sample interviews
INSERT INTO interviews (title, job_role, description, status, user_id, job_id) VALUES
('Frontend Developer Interview', 'Senior Frontend Developer', 'Technical interview focusing on React, TypeScript, and modern frontend development practices.', 'published', 1, 1),
('Backend Developer Interview', 'Backend Developer', 'Technical interview covering Node.js, database design, and API development.', 'published', 1, 2),
('Full Stack Interview', 'Full Stack Developer', 'Comprehensive interview covering both frontend and backend technologies.', 'published', 2, 3),
('DevOps Technical Assessment', 'DevOps Engineer', 'Technical assessment focusing on infrastructure, deployment, and automation.', 'draft', 2, 4)
ON CONFLICT DO NOTHING;

-- Insert sample questions
INSERT INTO questions (interview_id, question, difficulty, user_id) VALUES
(1, 'Explain the difference between React functional components and class components. When would you use each?', 'intermediate', 1),
(1, 'How do you handle state management in a large React application? Discuss different approaches.', 'advanced', 1),
(1, 'What is TypeScript and what benefits does it provide over JavaScript?', 'easy', 1),
(1, 'Describe the React component lifecycle and the useEffect hook.', 'intermediate', 1),
(2, 'Explain how you would design a RESTful API for a blog system.', 'intermediate', 1),
(2, 'What are database indexes and when would you use them?', 'intermediate', 1),
(2, 'How do you handle database migrations in a production environment?', 'advanced', 1),
(3, 'Describe your experience with both frontend and backend development.', 'easy', 2),
(3, 'How would you architect a full-stack application from scratch?', 'advanced', 2),
(4, 'Explain the benefits of containerization and when you would use Docker.', 'intermediate', 2),
(4, 'How do you ensure zero-downtime deployments?', 'advanced', 2)
ON CONFLICT DO NOTHING;

-- Insert sample applicants
INSERT INTO applicants (interview_id, title, firstname, surname, phone_number, email_address, interview_status, user_id) VALUES
(1, 'Mr', 'Alex', 'Johnson', '+61 412 345 678', 'alex.johnson@email.com', 'not_started', 1),
(1, 'Ms', 'Sarah', 'Wilson', '+61 423 456 789', 'sarah.wilson@email.com', 'completed', 1),
(2, 'Dr', 'Michael', 'Brown', '+61 434 567 890', 'michael.brown@email.com', 'not_started', 1),
(2, 'Mr', 'David', 'Lee', '+61 445 678 901', 'david.lee@email.com', 'completed', 1),
(3, 'Ms', 'Emma', 'Davis', '+61 456 789 012', 'emma.davis@email.com', 'not_started', 2)
ON CONFLICT DO NOTHING;

-- Insert sample answers
INSERT INTO applicant_answers (interview_id, question_id, applicant_id, answer, user_id) VALUES
(1, 1, 2, 'Functional components are simpler and more modern. They use hooks for state and lifecycle management. Class components are older but still useful for complex state logic. I would use functional components for most cases and class components only when necessary for legacy code or complex state management.', 1),
(1, 2, 2, 'For large applications, I would use Redux Toolkit for global state, React Query for server state, and local useState/useReducer for component state. Context API is good for simple cases but can cause performance issues in large apps.', 1),
(1, 3, 2, 'TypeScript adds static typing to JavaScript, providing better IDE support, catch errors at compile time, and improve code maintainability. It helps with refactoring and makes code more self-documenting.', 1),
(1, 4, 2, 'The useEffect hook replaces componentDidMount, componentDidUpdate, and componentWillUnmount. It runs after every render and can be used to perform side effects like data fetching, subscriptions, or manual DOM changes.', 1),
(2, 5, 4, 'I would design endpoints like GET /posts, POST /posts, GET /posts/:id, PUT /posts/:id, DELETE /posts/:id. Include proper HTTP status codes, pagination, filtering, and authentication. Use RESTful conventions for resource naming.', 1),
(2, 6, 4, 'Database indexes speed up query performance by creating a sorted data structure. Use them on frequently queried columns, foreign keys, and columns used in WHERE clauses. Be careful not to over-index as it slows down writes.', 1),
(2, 7, 4, 'Use migration tools like Knex.js or Sequelize migrations. Always backup before running migrations, test in staging first, and have rollback plans. Use transactions for complex migrations and consider blue-green deployments for zero downtime.', 1)
ON CONFLICT DO NOTHING;
