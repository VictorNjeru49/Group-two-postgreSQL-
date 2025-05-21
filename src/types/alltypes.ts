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