import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './services/database';
import { createRoutes } from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Connected',
  });
});

// API routes
app.use('/api', createRoutes());

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Something went wrong',
    });
  }
);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: PostgreSQL with Prisma ORM`);
});

export default app;
