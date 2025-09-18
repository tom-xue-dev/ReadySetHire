import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.TEST_DATABASE_URL ||
        'postgresql://readysethire_user:readysethire_password@localhost:5432/readysethire_test?schema=public',
    },
  },
});

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');

  try {
    // Clean up test database
    await prisma.$disconnect();

    // Check if we're running in CI environment (GitHub Actions)
    const isCI =
      process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

    if (isCI) {
      console.log('🎭 Running in CI environment, skipping database cleanup');
      // In CI, the PostgreSQL service will be cleaned up automatically
    } else {
      console.log('🗄️ Dropping test database...');
      try {
        execSync(
          'docker-compose exec -T postgres psql -U readysethire_user -d readysethire -c "DROP DATABASE IF EXISTS readysethire_test;"',
          { stdio: 'pipe' }
        );
      } catch (error) {
        // Ignore errors if database doesn't exist
      }

      // Option to stop containers after tests (can be controlled by environment variable)
      if (process.env.STOP_DOCKER_AFTER_TESTS === 'true') {
        console.log('🐳 Stopping Docker containers...');
        execSync('docker-compose down', { stdio: 'inherit' });
      } else {
        console.log(
          '🐳 Keeping Docker containers running (set STOP_DOCKER_AFTER_TESTS=true to stop them)'
        );
      }
    }

    console.log('✅ Test environment cleanup complete');
  } catch (error) {
    console.error('❌ Test environment cleanup failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}
