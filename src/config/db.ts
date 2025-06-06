
import env from './env';
import { Pool, PoolConfig, QueryResult } from 'pg';
import {
  usersTable,
  productsTable,
  categoriesTable,
  brandsTable,
  ordersTable,
  orderItemsTable,
  cartItemsTable,
  paymentsTable,
} from './schema';

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
      connectionTimeoutMillis: 5000,
    };

    this.pool = new Pool(poolConfig);

    this.pool.on('connect', () => {
      console.log('Connected to Database: PostgreSQL');
    });

    this.pool.on('error', (error: Error) => {
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
      console.log(`Executed query: ${text.split('\n')[0]}... [${duration} ms]`);
      return result;
    } catch (error: any) {
      console.error(`Database query error: ${error.message}`);
      throw new Error(`Database query failed: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async initializeTables(): Promise<void> {
    try {
      await this.executeQuery(usersTable);
      console.log('Users table initialized or already exists.');

      await this.executeQuery(productsTable);
      console.log('Products table initialized or already exists.');

      await this.executeQuery(categoriesTable);
      console.log('Categories table initialized or already exists.');

      await this.executeQuery(brandsTable);
      console.log('Brands table initialized or already exists.');

      await this.executeQuery(ordersTable);
      console.log('Orders table initialized or already exists.');

      await this.executeQuery(orderItemsTable);
      console.log('OrderItems table initialized or already exists.');

      await this.executeQuery(cartItemsTable);
      console.log('CartItems table initialized or already exists.');

      await this.executeQuery(paymentsTable);
      console.log('Payments table initialized or already exists.');

      await this.executeQuery(`ALTER TABLE users ALTER COLUMN phone TYPE BIGINT`);
      console.log('Altered users table: phone column to BIGINT');

      console.log('Database schema initialized successfully.');
    } catch (error: any) {
      console.error(`Error initializing database: ${error.message}`);
      throw error;
    }
  }

  async create<T extends object>(tableName: string, entity: T): Promise<number> {
    const keys = Object.keys(entity).join(', ');
    const values = Object.values(entity)
      .map((_, index) => `$${index + 1}`)
      .join(', ');

    const query = `INSERT INTO ${tableName} (${keys}) VALUES (${values}) RETURNING id`;
    const result = await this.executeQuery(query, Object.values(entity));
    return result.rows[0].id;
  }

  async readAll<T>(tableName: string): Promise<T[]> {
    const result = await this.executeQuery(`SELECT * FROM ${tableName}`);
    return result.rows as T[];
  }

  async readById<T>(tableName: string, id: number): Promise<T | null> {
    const result = await this.executeQuery(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async update<T>(tableName: string, id: number, entity: Partial<T>): Promise<void> {
    const updates = Object.keys(entity)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE ${tableName} SET ${updates} WHERE id = $${Object.keys(entity).length + 1}`;
    await this.executeQuery(query, [...Object.values(entity), id]);
  }

  async delete(tableName: string, id: number): Promise<void> {
    await this.executeQuery(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
  }

  getPool(): Pool {
    return this.pool;
  }
}

const db = new Database();

export const executeQuery = (text: string, params: any[] = []) =>
  db.executeQuery(text, params);

export const initializeTables = () => db.initializeTables();

export const createEntity = <T extends object>(tableName: string, entity: T) =>
  db.create(tableName, entity);

export const readAllEntities = <T>(tableName: string) =>
  db.readAll<T>(tableName);

export const readEntityById = <T>(tableName: string, id: number) =>
  db.readById<T>(tableName, id);

export const updateEntity = <T>(tableName: string, id: number, entity: Partial<T>) =>
  db.update(tableName, id, entity);

export const deleteEntity = (tableName: string, id: number) =>
  db.delete(tableName, id);

export default db;
