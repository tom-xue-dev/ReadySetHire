import { Database } from './database';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'readysethire',
    user: process.env.DB_USER || 'username',
    password: process.env.DB_PASSWORD || 'password',
  };

  const db = new Database(dbConfig);

  try {
    console.log('🔄 Running database migrations...');

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await db.query(statement);
      }
    }

    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate();
}
