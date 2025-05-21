import env from './env';
import { Pool, PoolConfig, QueryResult } from 'pg';
import { usersTable, productsTable } from './schema'; 

class Database {
    private pool: Pool;

    constructor() {
        const poolConfig: PoolConfig = {
            host: env.database.host,
            port: env.database.port,
            user: env.database.user,
            password: env.database.password,
            database: env.database.database,
            max: 20,
            idleTimeoutMillis: 50000,
            connectionTimeoutMillis: 5000
        };

        this.pool = new Pool(poolConfig);

        this.pool.on('connect', () => {
            console.log('Connected to Database: PostgreSQL');
        });

        this.pool.on('error', (error) => {
            console.error('Unexpected error on idle client', error);
            process.exit(-1);
        });
    }

    async executeQuery(text: string, params: any[] = []): Promise<QueryResult> {
        const client = await this.pool.connect();

        try {
            const start = Date.now();
            const result = await client.query(text, params);
            const duration = Date.now() - start;

            console.log(`Executed query: ${text} - Duration: ${duration} ms`);

            return result;
        } catch (error) {
            console.error(`Database query error: ${error}`);
            throw error;
        } finally {
            client.release();
        }
    }

    async initializeTables(): Promise<void> {
        try {
            await this.executeQuery(usersTable);
            console.log('Users Table initialized or already exists');

            await this.executeQuery(productsTable);
            console.log('Products Table initialized or already exists');

            console.log('Database schema initialized successfully');
        } catch (error) {
            console.log(`Error initializing Database: ${error}`);
            throw error;
        }
    }

    getPool(): Pool {
        return this.pool;
    }
}

const db = new Database();

export const executeQuery = (text: string, params: any[] = []) => db.executeQuery(text, params);
export const initializeTable = () => db.initializeTables();
export default db;
