export interface TUser{
    id?:number,
    fullname: string,
    email: string,
    phone: number,
    address: string,
    created_at?: Date,
    updated_at?: Date
}

export interface TProduct{
    id?: number,
    product_name: string,
    description: string,
    price: number,
    stock_quantity: number,
    category_id: number,
    brand_id: number,
    sku: string,
    created_at?: Date,
    updated_at?: Date,
    image_url : string,
    is_active: boolean
}

export interface TCategory {
  id?: number;
  name: string;
  description?: string;
  created_at?: Date;
}

export interface TBrand {
  id?: number;
  name: string;
  description?: string;
  created_at?: Date;
}

export interface TOrder {
  id?: number;
  user_id: number;
  order_status?: string; // e.g., 'pending', 'shipped', 'delivered'
  total: number;
  shipping_address: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface TOrderItem {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface TCartItem {
  id?: number;
  user_id: number;
  product_id: number;
  quantity: number;
  added_at?: Date;
}

export interface TPayment {
  id?: number;
  order_id: number;
  payment_method: string; 
  payment_status?: string; 
  transaction_id?: string;
  paid_at?: Date;
}

