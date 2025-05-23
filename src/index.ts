import {
  insertUser,
  getAllUsers,
  updateUser,
  deleteUser,
  insertProduct,
  getAllProducts,
  updateProduct,
  deleteProduct
} from './example/wednesday';

import {
  getOrderDetails,
  getSalesByCategory,
  getSalesRollup,
  getSalesCube
} from './example/tuesday';

import { initializeTables } from './config/db';

async function main() {
  try {
    await initializeTables();

    // -- User Operations --
    const userId = await insertUser({
      fullname: 'John Doe',
      email: 'john4@example.com',
      phone: 1234567890,
      address: '123 Main St'
    });
    console.log(`Inserted User ID: ${userId}`);

    const users = await getAllUsers();
    console.log("All Users:", users);

    await updateUser(userId!, { phone: 3987654321 });
    await deleteUser(userId!);

    // -- Product Operations --
    const productId = await insertProduct({
      product_name: 'Sample Product',
      description: 'This is a sample product',
      price: 19.99,
      stock_quantity: 100,
      category_id: 1,
      brand_id: 1,
      sku: 'SKU123',
      image_url: 'http://example.com/image.jpg',
      is_active: true
    });
    console.log(`Inserted Product ID: ${productId}`);

    const products = await getAllProducts();
    console.log("All Products:", products);

    await updateProduct(productId!, { price: 17.99 });
    await deleteProduct(productId!);

    // -- Analytics (Tuesday) --
    const orderDetails = await getOrderDetails();
    console.log("Order Details:", orderDetails);

    const salesByCategory = await getSalesByCategory();
    console.log("Sales by Category:", salesByCategory);

    const salesRollup = await getSalesRollup();
    console.log("Sales Rollup:", salesRollup);

    const salesCube = await getSalesCube();
    console.log("Sales Cube:", salesCube);

  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main().catch(console.error);
