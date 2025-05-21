import {insertUser,getAllUsers,updateUser,deleteUser,insertProduct,getAllProducts,updateProduct,deleteProduct} from './example/wednesday';

async function main() {
    try {
        // User Operations
        const userId = await insertUser({ fullname: 'John Doe', email: 'john@example.com', phone: 1234567890, address: '123 Main St' });
        console.log(`Inserted User ID: ${userId}`);

        const users = await getAllUsers();
        console.log(users);

        await updateUser(userId!, { phone: 3987654321 });

        await deleteUser(userId!);

        // Product Operations
        const productId = await insertProduct({ product_name: 'Sample Product', description: 'This is a sample product', price: 19.99, stock_quantity: 100, category_id: 1, brand_id: 1, sku: 'SKU123', image_url: 'http://example.com/image.jpg', is_active: true });
        console.log(`Inserted Product ID: ${productId}`);

        const products = await getAllProducts();
        console.log(products);

        await updateProduct(productId!, { price: 17.99 });

        await deleteProduct(productId!);
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main().catch(console.error);
