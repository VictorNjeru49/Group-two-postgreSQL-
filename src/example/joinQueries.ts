import { executeQuery } from "../config/db";

interface OrderWithUser {
  order_id: number;
  order_date: Date;
  total_amount: number;
  user_id: number;
  fullname: string;
}

interface UserWithOrders {
  user_id: number;
  fullname: string;
  order_id: number | null;
  order_date: Date | null;
  total_amount: number | null;
}

interface OrderWithItems {
  order_id: number;
  order_date: Date;
  total_amount: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface UserOrderProduct {
  user_id: number;
  fullname: string;
  order_id: number;
  order_date: Date;
  total_amount: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

/**
 * Retrieves all orders along with the user who placed each order.
 * Demonstrates an INNER JOIN between orders and users.
 */

export const getOrdersWithUsers = async (): Promise<OrderWithUser[]> => {
  const query = `
    SELECT
      o.id AS order_id,
      o.order_date,
      o.total_amount,
      u.id AS user_id,
      u.fullname
    FROM orders o
    INNER JOIN users u ON o.user_id = u.id;
  `;
  const res = await executeQuery(query);
  return res.rows as OrderWithUser[];
};

/**
 * Retrieves all users and their orders, including users who haven't placed any orders.
 * Demonstrates a LEFT JOIN between users and orders.
 */
export const getUsersWithOrders = async (): Promise<UserWithOrders[]> => {
  const query = `
    SELECT
      u.id AS user_id,
      u.fullname,
      o.id AS order_id,
      o.order_date,
      o.total_amount
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id;
  `;
  const res = await executeQuery(query);
  return res.rows as UserWithOrders[];
};

/**
 * Retrieves all orders and the users who placed them, including orders without associated users.
 * Demonstrates a RIGHT JOIN between users and orders.
 */
export const getOrdersWithUsersRightJoin = async (): Promise<
  UserWithOrders[]
> => {
  const query = `
    SELECT
      u.id AS user_id,
      u.fullname,
      o.id AS order_id,
      o.order_date,
      o.total_amount
    FROM users u
    RIGHT JOIN orders o ON u.id = o.user_id;
  `;
  const res = await executeQuery(query);
  return res.rows as UserWithOrders[];
};

/**
 * Combines users and orders, including all users and all orders, regardless of whether there's a match.
 * Demonstrates a FULL OUTER JOIN between users and orders.
 */
export const getUsersAndOrdersFullJoin = async (): Promise<
  UserWithOrders[]
> => {
  const query = `
    SELECT
      u.id AS user_id,
      u.fullname,
      o.id AS order_id,
      o.order_date,
      o.total_amount
    FROM users u
    FULL OUTER JOIN orders o ON u.id = o.user_id;
  `;
  const res = await executeQuery(query);
  return res.rows as UserWithOrders[];
};

/**
 * Retrieves all orders along with their associated products and quantities.
 * Demonstrates multiple INNER JOINs between orders, order_items, and products.
 */

export const getOrdersWithItems = async (): Promise<OrderWithItems[]> => {
  const query = `
    SELECT
      o.id AS order_id,
      o.order_date,
      o.total_amount,
      p.id AS product_id,
      p.product_name AS product_name,
      oi.quantity,
      oi.price
    FROM orders o
    INNER JOIN order_items oi ON o.id = oi.order_id
    INNER JOIN products p ON oi.product_id = p.id;
  `;
  const res = await executeQuery(query);
  return res.rows as OrderWithItems[];
};

/**
 * Retrieves a comprehensive view of users, their orders, and the products in each order.
 * Demonstrates multiple INNER JOINs across users, orders, order_items, and products.
 */
export const getUserOrderProductDetails = async (): Promise<
  UserOrderProduct[]
> => {
  const query = `
    SELECT
      u.id AS user_id,
      u.fullname,
      o.id AS order_id,
      o.order_date,
      o.total_amount,
      p.id AS product_id,
      p.product_name AS product_name,
      oi.quantity,
      oi.price
    FROM users u
    INNER JOIN orders o ON u.id = o.user_id
    INNER JOIN order_items oi ON o.id = oi.order_id
    INNER JOIN products p ON oi.product_id = p.id;
  `;
  const res = await executeQuery(query);
  return res.rows as UserOrderProduct[];
};
