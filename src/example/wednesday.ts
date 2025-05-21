import db, { executeQuery } from "../config/db";
import { TProduct, TUser } from "../types/alltypes";

// User CRUD Operations

// Insert a single user
export const insertUser = async (user: TUser): Promise<number | undefined> => {
    try {
        const res = await executeQuery(
            `INSERT INTO users (fullname, email, phone, address, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, NOW(), NOW()) 
             RETURNING id`,
            [user.fullname, user.email, user.phone, user.address]
        );

        const userId = res.rows[0]?.id;
        console.log(`User inserted with ID: ${userId}`);
        return userId;
    } catch (error) {
        console.error(`Error inserting user: ${error}`);
        throw error;
    }
};

// Insert multiple users
export const insertMultipleUsers = async (users: TUser[]): Promise<void> => {
    const client = await db.getPool().connect();
    try {
        await client.query('BEGIN');

        for (const user of users) {
            await client.query(
                'INSERT INTO users (fullname, email, phone, address, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())', 
                [user.fullname, user.email, user.phone, user.address]
            );
        }

        await client.query('COMMIT');
        console.log(`${users.length} users inserted successfully`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error inserting multiple users:', err);
        throw err;
    } finally {
        client.release();
    }
};

// Read all users
export const getAllUsers = async (): Promise<TUser[]> => {
    try {
        const res = await executeQuery('SELECT * FROM users');
        console.log(`Retrieved ${res.rows.length} users`);
        return res.rows as TUser[];
    } catch (err) {
        console.error('Error querying users:', err);
        throw err;
    }
};

// Read a user by ID
export const getUserById = async (id: number): Promise<TUser | null> => {
    try {
        const res = await executeQuery('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0] || null;
    } catch (err) {
        console.error('Error querying user by ID:', err);
        throw err;
    }
};

// Update a user by ID
export const updateUser = async (id: number, user: Partial<TUser>): Promise<void> => {
    const updates = Object.keys(user).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(user);

    try {
        await executeQuery(`UPDATE users SET ${updates}, updated_at = NOW() WHERE id = $${values.length + 1}`, [...values, id]);
        console.log(`User with ID ${id} updated successfully`);
    } catch (err) {
        console.error('Error updating user:', err);
        throw err;
    }
};

// Delete a user by ID
export const deleteUser = async (id: number): Promise<void> => {
    try {
        const res = await executeQuery('DELETE FROM users WHERE id = $1', [id]);
        console.log(`Deleted ${res.rowCount} user(s) with ID: ${id}`);
    } catch (err) {
        console.error('Error deleting user:', err);
        throw err;
    }
};

// Delete all users
export const deleteAllUsers = async (): Promise<void> => {
    try {
        const res = await executeQuery('DELETE FROM users');
        console.log(`Deleted ${res.rowCount} users`);
    } catch (err) {
        console.error('Error deleting all users:', err);
        throw err;
    }
};

// Product CRUD Operations

// Insert a single product
export const insertProduct = async (product: TProduct): Promise<number | undefined> => {
    try {
        const res = await executeQuery(
            `INSERT INTO products (product_name, description, price, stock_quantity, category_id, brand_id, sku, created_at, updated_at, image_url, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $9)
             RETURNING id`, 
            [
                product.product_name,
                product.description,
                product.price,
                product.stock_quantity,
                product.category_id,
                product.brand_id,
                product.sku,
                product.image_url,
                product.is_active
            ]
        );

        const productId = res.rows[0]?.id; 
        console.log(`Product inserted with ID: ${productId}`);
        return productId;

    } catch (error) {
        console.error(`Error inserting product: ${error}`);
        throw error; 
    }
};

// Read all products
export const getAllProducts = async (): Promise<TProduct[]> => {
    try {
        const res = await executeQuery('SELECT * FROM products');
        console.log(`Retrieved ${res.rows.length} products`);
        return res.rows as TProduct[];
    } catch (err) {
        console.error('Error querying products:', err);
        throw err;
    }
};

// Read a product by ID
export const getProductById = async (id: number): Promise<TProduct | null> => {
    try {
        const res = await executeQuery('SELECT * FROM products WHERE id = $1', [id]);
        return res.rows[0] || null;
    } catch (err) {
        console.error('Error querying product by ID:', err);
        throw err;
    }
};

// Update a product by ID
export const updateProduct = async (id: number, product: Partial<TProduct>): Promise<void> => {
    const updates = Object.keys(product).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(product);

    try {
        await executeQuery(`UPDATE products SET ${updates}, updated_at = NOW() WHERE id = $${values.length + 1}`, [...values, id]);
        console.log(`Product with ID ${id} updated successfully`);
    } catch (err) {
        console.error('Error updating product:', err);
        throw err;
    }
};

// Delete a product by ID
export const deleteProduct = async (id: number): Promise<void> => {
    try {
        const res = await executeQuery('DELETE FROM products WHERE id = $1', [id]);
        console.log(`Deleted ${res.rowCount} product(s) with ID: ${id}`);
    } catch (err) {
        console.error('Error deleting product:', err);
        throw err;
    }
};

// Delete all products
export const deleteAllProducts = async (): Promise<void> => {
    try {
        const res = await executeQuery('DELETE FROM products');
        console.log(`Deleted ${res.rowCount} products`);
    } catch (err) {
        console.error('Error deleting all products:', err);
        throw err;
    }
};
