"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = exports.Database = void 0;
const pg_1 = require("pg");
class Database {
    pool;
    constructor(config) {
        this.pool = new pg_1.Pool(config);
    }
    async query(text, params) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        }
        finally {
            client.release();
        }
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async close() {
        await this.pool.end();
    }
}
exports.Database = Database;
// Base CRUD class for all entities
class BaseModel {
    db;
    tableName;
    primaryKey;
    constructor(db, tableName, primaryKey = 'id') {
        this.db = db;
        this.tableName = tableName;
        this.primaryKey = primaryKey;
    }
    // Create a new record
    async create(data) {
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
    async findAll(filters = {}) {
        let query = `SELECT * FROM ${this.tableName}`;
        const values = [];
        if (Object.keys(filters).length > 0) {
            const conditions = Object.keys(filters).map((key, i) => {
                values.push(filters[key]);
                return `${key} = $${i + 1}`;
            });
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        const result = await this.db.query(query, values);
        return result.rows;
    }
    // Get a single record by ID
    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
        const result = await this.db.query(query, [id]);
        return result.rows[0] || null;
    }
    // Update a record by ID
    async update(id, data) {
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
    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
        const result = await this.db.query(query, [id]);
        return result.rowCount > 0;
    }
    // Count records with optional filtering
    async count(filters = {}) {
        let query = `SELECT COUNT(*) FROM ${this.tableName}`;
        const values = [];
        if (Object.keys(filters).length > 0) {
            const conditions = Object.keys(filters).map((key, i) => {
                values.push(filters[key]);
                return `${key} = $${i + 1}`;
            });
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        const result = await this.db.query(query, values);
        return parseInt(result.rows[0].count);
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=database.js.map