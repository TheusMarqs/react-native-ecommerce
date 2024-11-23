export interface Order {
    id: number;
    client: number;
    date: string;
    total: string;
    order_items: OrderItem[];
}

export interface OrderItem {
    id: number;
    order: number; 
    product: Product;
    quantity: number;
}
