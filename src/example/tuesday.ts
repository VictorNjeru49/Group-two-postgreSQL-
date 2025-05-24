import db, { executeQuery } from "../config/db";
import {
  TUser,
  TProduct,
  TOrder,
  TOrderItem,
  TCategory,
  TBrand,
  TCartItem,
  TPayment
} from "../types/alltypes";

// 1. JOIN: Get detailed order data (user, product, category, brand)
export const getOrderDetails = async () => {
  const query = `
    SELECT 
      o.id AS order_id,
      u.fullname,
      p.product_name,
      c.name AS category,
      b.name AS brand,
      oi.quantity,
      oi.price,
      (oi.quantity * oi.price) AS total_item_cost,
      o.total AS order_total
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    ORDER BY o.id;
  `;
  return await executeQuery(query);
};

// 2. GROUP BY: Total sales per category
export const getSalesByCategory = async () => {
  const query = `
    SELECT 
      c.name AS category,
      SUM(oi.quantity * oi.price) AS total_sales
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    GROUP BY c.name
    ORDER BY total_sales DESC;
  `;
  return await executeQuery(query);
};

// 3. GROUP BY ROLLUP: Sales by category and brand with subtotals
export const getSalesRollup = async () => {
  const query = `
    SELECT 
      c.name AS category,
      b.name AS brand,
      SUM(oi.quantity * oi.price) AS total_sales
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    GROUP BY ROLLUP (c.name, b.name)
    ORDER BY c.name, b.name;
  `;
  return await executeQuery(query);
};

// 4. GROUP BY CUBE: Sales analysis by category and brand with all combinations
export const getSalesCube = async () => {
  const query = `
    SELECT 
      c.name AS category,
      b.name AS brand,
      SUM(oi.quantity * oi.price) AS total_sales
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    GROUP BY CUBE (c.name, b.name)
    ORDER BY category, brand;
  `;
  return await executeQuery(query);
};
