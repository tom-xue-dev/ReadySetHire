import { PoolClient } from 'pg';
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}
export declare class Database {
    private pool;
    constructor(config: DatabaseConfig);
    query(text: string, params?: any[]): Promise<any>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    close(): Promise<void>;
}
export declare abstract class BaseModel<T> {
    protected db: Database;
    protected tableName: string;
    protected primaryKey: string;
    constructor(db: Database, tableName: string, primaryKey?: string);
    create(data: Partial<T>): Promise<T>;
    findAll(filters?: Partial<T>): Promise<T[]>;
    findById(id: number | string): Promise<T | null>;
    update(id: number | string, data: Partial<T>): Promise<T | null>;
    delete(id: number | string): Promise<boolean>;
    count(filters?: Partial<T>): Promise<number>;
}
//# sourceMappingURL=database.d.ts.map