import { Pool, PoolClient } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export class Database {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool(config);
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Base CRUD class for all entities
export abstract class BaseModel<T> {
  protected db: Database;
  protected tableName: string;
  protected primaryKey: string;

  constructor(db: Database, tableName: string, primaryKey: string = 'id') {
    this.db = db;
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  // Create a new record
  async create(data: Partial<T>): Promise<T> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Get all records with optional filtering
  async findAll(filters: Partial<T> = {}): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const values: any[] = [];

    if (Object.keys(filters).length > 0) {
      const conditions = Object.keys(filters).map((key, i) => {
        values.push(filters[key as keyof T]);
        return `${key} = $${i + 1}`;
      });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this.db.query(query, values);
    return result.rows;
  }

  // Get a single record by ID
  async findById(id: number | string): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Update a record by ID
  async update(id: number | string, data: Partial<T>): Promise<T | null> {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields
      .map((field, i) => `${field} = $${i + 1}`)
      .join(', ');
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE ${this.primaryKey} = $${fields.length + 1}
      RETURNING *
    `;

    const result = await this.db.query(query, [...values, id]);
    return result.rows[0] || null;
  }

  // Delete a record by ID
  async delete(id: number | string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
    const result = await this.db.query(query, [id]);
    return result.rowCount > 0;
  }

  // Count records with optional filtering
  async count(filters: Partial<T> = {}): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${this.tableName}`;
    const values: any[] = [];

    if (Object.keys(filters).length > 0) {
      const conditions = Object.keys(filters).map((key, i) => {
        values.push(filters[key as keyof T]);
        return `${key} = $${i + 1}`;
      });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this.db.query(query, values);
    return parseInt(result.rows[0].count);
  }
}
