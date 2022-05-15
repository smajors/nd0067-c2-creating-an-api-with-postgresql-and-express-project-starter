import client from '../database';
import { Product } from './Products';

export type OrderProduct = {
    id?: number,
    quantity: number,
    // Foreign key to PRODUCT(id)
    product_id: number,
    // Foreign key to ORDER(id)
    order_id: number,
    product_name?: string,
    price?: number
};

export type Order = {
    id?: number,
    // Foreign key to USER(id)
    user_id: number,
    active_flg: boolean
}

export class OrdersStore {
    /**
     * Creates an order in the database and returns it
     * @param o Order to be created
     * @returns New order created in the database
     */
    async createOrder(o: Order): Promise<Order> {
        try {
            const sql = 'INSERT INTO user_order (user_id, active_flg) VALUES ($1, $2) RETURNING *';
            const conn = await client.connect();
            const result = await conn.query(sql, [o.user_id, o.active_flg]);
            const newOrder: Order = result.rows[0];
            conn.release();
            return newOrder;
        } catch (err) {
            throw new Error(`Error occurred attempting to create a new order: ${err}`);
        }
    }

    /**
     * Returns a list of orders by user
     * @param id User ID to get orders for
     * @returns A list of orders for this user
     */
    async getUserOrders(id: number): Promise<Order[]> {
        try {
            const sql = 'SELECT * FROM user_order WHERE user_id = ($1)';
            const conn = await client.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            return result.rows as Order[];

        } catch (err) {
            throw new Error(`Error occurred attempting to get an order from the database: ${err}`)
        } 
    }

    async addProductToOrder(order_id: number, product_id: number, qty: number): Promise<OrderProduct> {
        try {
            const sql = 'INSERT INTO order_product (quantity, product_id, order_id) VALUES ($1, $2, $3) RETURNING *';
            const conn = await client.connect();
            const result = await conn.query(sql, [qty, product_id, order_id]);
            const newProduct: OrderProduct = result.rows[0];
            conn.release();
            console.log(newProduct);
            return newProduct;
        } catch (err) {
            throw new Error(`Error occurred attempting to add to an order. ${err}`);
        }
    }
    
    async getProductsFromOrderById(orderId: number): Promise<OrderProduct[]> {
        try {
            const sql = 'SELECT op.id as ID, op.product_id as PRODUCT_ID, op.order_id AS order_id, p.name as PRODUCT_NAME, p.price AS PRICE, op.quantity AS QUANTITY FROM product p LEFT JOIN order_product op ON op.product_id = p.id LEFT JOIN user_order uo ON uo.id = op.order_id WHERE uo.id = ($1)';
            const conn = await client.connect();
            const result = await conn.query(sql, [orderId]);
            conn.release();
            const orderProducts: OrderProduct[] = result.rows as OrderProduct[];
            console.log(orderProducts);
            return orderProducts;
        } catch (err) {
            throw new Error(`Error occurred attempting to retrieve order by ID. ${err}`);
        }
    }
}