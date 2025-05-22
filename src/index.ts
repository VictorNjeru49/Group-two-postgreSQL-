import {
  insertUser,
  updateUser,
  deleteUser,
  insertProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getExpensiveProducts,
  getAllusers,
  getusersAndProducts,
  getusersWithMostProducts,
} from "./example/wednesday";
 import {
  getOrdersWithUsers,
  getUsersWithOrders,
  getOrdersWithUsersRightJoin,
  getUsersAndOrdersFullJoin,
  getOrdersWithItems,
  getUserOrderProductDetails,
} from './example/joinQueries';



import db from "./config/db";

async function main() {
  try {
    await db.initializeTables();

    // User Operations

    const userId = await insertUser({
      fullname: "John Doe",
      email: "john1@example.com",
      phone: 1234567890,
      address: "123 Main St",
    });
    console.log(`Inserted User ID: ${userId}`);

    const users = await getAllusers();
    console.table(users);

    await updateUser(1, { phone: 39654321 });

    await deleteUser(14);

    // Product Operations
    const productId = await insertProduct({
      product_name: "Sample Product",
      description: "This is a sample product",
      price: 19.99,
      stock_quantity: 100,
      category_id: 1,
      brand_id: 1,
      sku: "SKU123",
      image_url: "http://example.com/image.jpg",
      is_active: true,
    });
    console.log(`Inserted Product ID: ${productId}`);

    const products = await getAllProducts();
    console.table(products);

    await updateProduct(productId!, { price: 17.99 });

    await deleteProduct(productId!);

    // Set Operations
    const usersAndProducts = await getusersAndProducts();
    console.log("Users and Products:", usersAndProducts);

    // Subqueries
    const usersWithMostProducts = await getusersWithMostProducts();
    console.log("Users with More than 5 Products:", usersWithMostProducts);

    // Common Table Expressions (CTEs)
    const expensiveProducts = await getExpensiveProducts();
    console.log("Expensive Products:", expensiveProducts);

    // Perform INNER JOIN between orders and users
    const ordersWithUsers = await getOrdersWithUsers();
    console.log("INNER JOIN - Orders with Users:");
    console.table(ordersWithUsers);

    // Perform LEFT JOIN between users and orders
    const usersWithOrders = await getUsersWithOrders();
    console.log("LEFT JOIN - Users with Orders:");
    console.table(usersWithOrders);

    // Perform RIGHT JOIN between users and orders
    const ordersWithUsersRight = await getOrdersWithUsersRightJoin();
    console.log("RIGHT JOIN - Orders with Users:");
    console.table(ordersWithUsersRight);

    // Perform FULL OUTER JOIN between users and orders
    const usersAndOrdersFull = await getUsersAndOrdersFullJoin();
    console.log("FULL OUTER JOIN - Users and Orders:");
    console.table(usersAndOrdersFull);

    // Perform multiple INNER JOINs between orders, order_items, and products
    const ordersWithItems = await getOrdersWithItems();
    console.log("INNER JOIN - Orders with Items:");
    console.table(ordersWithItems);

    // Perform multiple INNER JOINs across users, orders, order_items, and products
    const userOrderProductDetails = await getUserOrderProductDetails();
    console.log("INNER JOIN - User Order Product Details:");
    console.table(userOrderProductDetails);

    console.log("All join operations completed successfully.");
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main().catch(console.error);
