export interface CartItem {
    product: {
        id: number;
        name: string;
        description: string;
        price: number;
        stock: number;
        bar_code: string;
        qr_code: string;
        category: number;
        image: string;
    };
    quantity: number;
}

export interface Cart {
    user: number;
    cart_items: CartItem[];
    total_value: string;
}
