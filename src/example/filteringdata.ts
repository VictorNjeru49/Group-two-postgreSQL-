// Database schema-based filtering implementation
import { Pool } from 'pg';

// Type definitions based on your schema
interface User {
  id: number;
  fullname: string;
  email: string;
  phone: number;
  address: string;
  created_at: Date;
  updated_at: Date;
}

interface Product {
  id: number;
  product_name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category_id: number | null;
  brand_id: number | null;
  sku: string | null;
  created_at: Date;
  updated_at: Date;
  image_url: string | null;
  is_active: boolean;
}

// Base filter options
interface BaseFilterOptions {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  searchFields?: string[];
}

// User-specific filter options
interface UserFilterOptions extends BaseFilterOptions {
  id?: number;
  ids?: number[];
  fullname?: string;
  fullnameContains?: string;
  email?: string;
  emailContains?: string;
  emailDomain?: string; // e.g., "gmail.com"
  phone?: number;
  phoneStartsWith?: string;
  addressContains?: string;
  createdAfter?: Date | string;
  createdBefore?: Date | string;
  updatedAfter?: Date | string;
  updatedBefore?: Date | string;
}

// Product-specific filter options
interface ProductFilterOptions extends BaseFilterOptions {
  id?: number;
  ids?: number[];
  productName?: string;
  productNameContains?: string;
  descriptionContains?: string;
  minPrice?: number;
  maxPrice?: number;
  priceRange?: { min: number; max: number };
  minStock?: number;
  maxStock?: number;
  stockRange?: { min: number; max: number };
  categoryId?: number;
  categoryIds?: number[];
  brandId?: number;
  brandIds?: number[];
  sku?: string;
  skuContains?: string;
  hasImage?: boolean;
  isActive?: boolean;
  createdAfter?: Date | string;
  createdBefore?: Date | string;
  updatedAfter?: Date | string;
  updatedBefore?: Date | string;
}

// Response interface
interface FilterResponse<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// Base filtering class for PostgreSQL
abstract class BasePostgreSQLFilter<T, F extends BaseFilterOptions> {
  constructor(protected pool: Pool, protected tableName: string) {}

  // Abstract method to build WHERE clauses
  protected abstract buildWhereClause(filters: F): { 
    whereClause: string; 
    params: any[]; 
    paramIndex: number; 
  };

  // Main filtering method
  async filter(filters: F): Promise<FilterResponse<T>> {
    const { whereClause, params, paramIndex } = this.buildWhereClause(filters);
    
    // Build the main query
    let query = `SELECT * FROM ${this.tableName}`;
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }

    // Add search functionality
    if (filters.search && filters.searchFields && filters.searchFields.length > 0) {
      const searchConditions = filters.searchFields
        .map(field => `${field} ILIKE $${paramIndex + filters.searchFields!.indexOf(field)}`)
        .join(' OR ');
      
      const searchClause = whereClause ? ` AND (${searchConditions})` : ` WHERE (${searchConditions})`;
      query += searchClause;
      
      // Add search parameters
      filters.searchFields.forEach(() => {
        params.push(`%${filters.search}%`);
      });
    }

    // Add sorting
    if (filters.sortBy) {
      const sortOrder = filters.sortOrder || 'asc';
      query += ` ORDER BY ${filters.sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY id ASC`; // Default sorting
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName}` + 
      (whereClause ? ` WHERE ${whereClause}` : '');
    const countResult = await this.pool.query(countQuery, params.slice(0, params.length - (filters.searchFields?.length || 0)));
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    if (filters.page && filters.pageSize) {
      const offset = (filters.page - 1) * filters.pageSize;
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(filters.pageSize, offset);
    } else if (filters.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
      
      if (filters.offset) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(filters.offset);
      }
    }

    // Execute the query
    const result = await this.pool.query(query, params);

    // Calculate pagination info
    let paginationInfo: any = { total };
    
    if (filters.page && filters.pageSize) {
      const totalPages = Math.ceil(total / filters.pageSize);
      paginationInfo = {
        ...paginationInfo,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages,
        hasNextPage: filters.page < totalPages,
        hasPreviousPage: filters.page > 1
      };
    }

    return {
      data: result.rows,
      ...paginationInfo
    };
  }

  // Utility method for date range conditions
  protected addDateRangeCondition(
    conditions: string[],
    params: any[],
    paramIndex: number,
    fieldName: string,
    after?: Date | string,
    before?: Date | string
  ): number {
    if (after) {
      conditions.push(`${fieldName} >= $${paramIndex}`);
      params.push(after);
      paramIndex++;
    }
    
    if (before) {
      conditions.push(`${fieldName} <= $${paramIndex}`);
      params.push(before);
      paramIndex++;
    }
    
    return paramIndex;
  }
}

// User filtering implementation
class UserFilter extends BasePostgreSQLFilter<User, UserFilterOptions> {
  constructor(pool: Pool) {
    super(pool, 'users');
  }

  protected buildWhereClause(filters: UserFilterOptions): { 
    whereClause: string; 
    params: any[]; 
    paramIndex: number; 
  } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // ID filtering
    if (filters.id) {
      conditions.push(`id = $${paramIndex}`);
      params.push(filters.id);
      paramIndex++;
    }

    if (filters.ids && filters.ids.length > 0) {
      conditions.push(`id = ANY($${paramIndex})`);
      params.push(filters.ids);
      paramIndex++;
    }

    // Fullname filtering
    if (filters.fullname) {
      conditions.push(`fullname = $${paramIndex}`);
      params.push(filters.fullname);
      paramIndex++;
    }

    if (filters.fullnameContains) {
      conditions.push(`fullname ILIKE $${paramIndex}`);
      params.push(`%${filters.fullnameContains}%`);
      paramIndex++;
    }

    // Email filtering
    if (filters.email) {
      conditions.push(`email = $${paramIndex}`);
      params.push(filters.email);
      paramIndex++;
    }

    if (filters.emailContains) {
      conditions.push(`email ILIKE $${paramIndex}`);
      params.push(`%${filters.emailContains}%`);
      paramIndex++;
    }

    if (filters.emailDomain) {
      conditions.push(`email ILIKE $${paramIndex}`);
      params.push(`%@${filters.emailDomain}`);
      paramIndex++;
    }

    // Phone filtering
    if (filters.phone) {
      conditions.push(`phone = $${paramIndex}`);
      params.push(filters.phone);
      paramIndex++;
    }

    if (filters.phoneStartsWith) {
      conditions.push(`CAST(phone AS TEXT) LIKE $${paramIndex}`);
      params.push(`${filters.phoneStartsWith}%`);
      paramIndex++;
    }

    // Address filtering
    if (filters.addressContains) {
      conditions.push(`address ILIKE $${paramIndex}`);
      params.push(`%${filters.addressContains}%`);
      paramIndex++;
    }

    // Date filtering
    paramIndex = this.addDateRangeCondition(
      conditions, params, paramIndex, 'created_at',
      filters.createdAfter, filters.createdBefore
    );

    paramIndex = this.addDateRangeCondition(
      conditions, params, paramIndex, 'updated_at',
      filters.updatedAfter, filters.updatedBefore
    );

    return {
      whereClause: conditions.join(' AND '),
      params,
      paramIndex
    };
  }

  // Convenience methods for common user queries
  async getUsersByEmailDomain(domain: string): Promise<User[]> {
    const result = await this.filter({ emailDomain: domain });
    return result.data;
  }

  async getUsersByNamePattern(namePattern: string): Promise<User[]> {
    const result = await this.filter({ fullnameContains: namePattern });
    return result.data;
  }

  async getRecentUsers(days: number = 30): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await this.filter({ 
      createdAfter: cutoffDate,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    return result.data;
  }
}

// Product filtering implementation
class ProductFilter extends BasePostgreSQLFilter<Product, ProductFilterOptions> {
  constructor(pool: Pool) {
    super(pool, 'products');
  }

  protected buildWhereClause(filters: ProductFilterOptions): { 
    whereClause: string; 
    params: any[]; 
    paramIndex: number; 
  } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // ID filtering
    if (filters.id) {
      conditions.push(`id = $${paramIndex}`);
      params.push(filters.id);
      paramIndex++;
    }

    if (filters.ids && filters.ids.length > 0) {
      conditions.push(`id = ANY($${paramIndex})`);
      params.push(filters.ids);
      paramIndex++;
    }

    // Product name filtering
    if (filters.productName) {
      conditions.push(`product_name = $${paramIndex}`);
      params.push(filters.productName);
      paramIndex++;
    }

    if (filters.productNameContains) {
      conditions.push(`product_name ILIKE $${paramIndex}`);
      params.push(`%${filters.productNameContains}%`);
      paramIndex++;
    }

    // Description filtering
    if (filters.descriptionContains) {
      conditions.push(`description ILIKE $${paramIndex}`);
      params.push(`%${filters.descriptionContains}%`);
      paramIndex++;
    }

    // Price filtering
    if (filters.minPrice !== undefined) {
      conditions.push(`price >= $${paramIndex}`);
      params.push(filters.minPrice);
      paramIndex++;
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(`price <= $${paramIndex}`);
      params.push(filters.maxPrice);
      paramIndex++;
    }

    if (filters.priceRange) {
      conditions.push(`price BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(filters.priceRange.min, filters.priceRange.max);
      paramIndex += 2;
    }

    // Stock filtering
    if (filters.minStock !== undefined) {
      conditions.push(`stock_quantity >= $${paramIndex}`);
      params.push(filters.minStock);
      paramIndex++;
    }

    if (filters.maxStock !== undefined) {
      conditions.push(`stock_quantity <= $${paramIndex}`);
      params.push(filters.maxStock);
      paramIndex++;
    }

    if (filters.stockRange) {
      conditions.push(`stock_quantity BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(filters.stockRange.min, filters.stockRange.max);
      paramIndex += 2;
    }

    // Category filtering
    if (filters.categoryId) {
      conditions.push(`category_id = $${paramIndex}`);
      params.push(filters.categoryId);
      paramIndex++;
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      conditions.push(`category_id = ANY($${paramIndex})`);
      params.push(filters.categoryIds);
      paramIndex++;
    }

    // Brand filtering
    if (filters.brandId) {
      conditions.push(`brand_id = $${paramIndex}`);
      params.push(filters.brandId);
      paramIndex++;
    }

    if (filters.brandIds && filters.brandIds.length > 0) {
      conditions.push(`brand_id = ANY($${paramIndex})`);
      params.push(filters.brandIds);
      paramIndex++;
    }

    // SKU filtering
    if (filters.sku) {
      conditions.push(`sku = $${paramIndex}`);
      params.push(filters.sku);
      paramIndex++;
    }

    if (filters.skuContains) {
      conditions.push(`sku ILIKE $${paramIndex}`);
      params.push(`%${filters.skuContains}%`);
      paramIndex++;
    }

    // Image filtering
    if (filters.hasImage !== undefined) {
      if (filters.hasImage) {
        conditions.push(`image_url IS NOT NULL AND image_url != ''`);
      } else {
        conditions.push(`(image_url IS NULL OR image_url = '')`);
      }
    }

    // Active status filtering
    if (filters.isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex}`);
      params.push(filters.isActive);
      paramIndex++;
    }

    // Date filtering
    paramIndex = this.addDateRangeCondition(
      conditions, params, paramIndex, 'created_at',
      filters.createdAfter, filters.createdBefore
    );

    paramIndex = this.addDateRangeCondition(
      conditions, params, paramIndex, 'updated_at',
      filters.updatedAfter, filters.updatedBefore
    );

    return {
      whereClause: conditions.join(' AND '),
      params,
      paramIndex
    };
  }

  // Convenience methods for common product queries
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const result = await this.filter({ categoryId, isActive: true });
    return result.data;
  }

  async getProductsByBrand(brandId: number): Promise<Product[]> {
    const result = await this.filter({ brandId, isActive: true });
    return result.data;
  }

  async getProductsInPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const result = await this.filter({ 
      priceRange: { min: minPrice, max: maxPrice },
      isActive: true,
      sortBy: 'price',
      sortOrder: 'asc'
    });
    return result.data;
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    const result = await this.filter({ 
      maxStock: threshold,
      isActive: true,
      sortBy: 'stock_quantity',
      sortOrder: 'asc'
    });
    return result.data;
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    const result = await this.filter({
      search: searchTerm,
      searchFields: ['product_name', 'description'],
      isActive: true,
      sortBy: 'product_name',
      sortOrder: 'asc'
    });
    return result.data;
  }

  async getPopularProducts(limit: number = 10): Promise<Product[]> {
    // Assuming you have a way to determine popularity (could be based on sales, views, etc.)
    const result = await this.filter({
      isActive: true,
      sortBy: 'created_at', // or whatever metric you use for popularity
      sortOrder: 'desc',
      limit
    });
    return result.data;
  }
}

// Usage examples
async function exampleUsage() {
  const pool = new Pool({
    user: 'your_username',
    host: 'localhost',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
  });

  const userFilter = new UserFilter(pool);
  const productFilter = new ProductFilter(pool);

  try {
    // Example 1: Filter users by email domain with pagination
    const gmailUsers = await userFilter.filter({
      emailDomain: 'gmail.com',
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    console.log('Gmail users:', gmailUsers);

    // Example 2: Search users by name
    const johnUsers = await userFilter.filter({
      search: 'john',
      searchFields: ['fullname', 'email'],
      limit: 5
    });
    console.log('Users named John:', johnUsers);

    // Example 3: Filter products by category and price range
    const expensiveProducts = await productFilter.filter({
      categoryId: 1,
      priceRange: { min: 100, max: 500 },
      isActive: true,
      sortBy: 'price',
      sortOrder: 'desc',
      page: 1,
      pageSize: 20
    });
    console.log('Expensive products in category 1:', expensiveProducts);

    // Example 4: Get low stock products
    const lowStockProducts = await productFilter.getLowStockProducts(5);
    console.log('Low stock products:', lowStockProducts);

    // Example 5: Search products
    const searchResults = await productFilter.searchProducts('laptop');
    console.log('Products matching "laptop":', searchResults);

    // Example 6: Get recent users
    const recentUsers = await userFilter.getRecentUsers(7); // Last 7 days
    console.log('Recent users:', recentUsers);

  } catch (error) {
    console.error('Error filtering data:', error);
  } finally {
    await pool.end();
  }
}

// Export classes and interfaces
export { 
  UserFilter, 
  ProductFilter, 
  User, 
  Product, 
  UserFilterOptions, 
  ProductFilterOptions,
  FilterResponse
};