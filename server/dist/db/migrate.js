"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function migrate() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'readysethire',
        user: process.env.DB_USER || 'username',
        password: process.env.DB_PASSWORD || 'password',
    };
    const db = new database_1.Database(dbConfig);
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
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
    finally {
        await db.close();
    }
}
// Run migration if this file is executed directly
if (require.main === module) {
    migrate();
}
//# sourceMappingURL=migrate.js.map