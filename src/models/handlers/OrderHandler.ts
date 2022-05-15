import express, { Request, Response } from 'express';
import { Order, OrderProduct, OrdersStore } from '../Orders';
import verifyAuthToken from '../../Util';
import { Product } from '../Products';

const store = new OrdersStore();

/**
 * Creates an order based on a User in the database
 * @param req HTTP Request
 * @param res HTTP Response
 * @returns The created order, or an error if unsuccessful
 */
const createOrder = async (req: Request, res: Response) => {
    try {
        // Get order from payload
        const order = JSON.parse(req.get('order') as string) as Order;
        const addedOrder = await store.createOrder(order);
        return res.json(addedOrder);
    }
    catch (err) {
        res.status(401);
        return res.json(err);
    }
};

const getUserOrders = async (req: Request, res: Response) => {
    try {
        // Get ID from payload
        const id = req.params.id as unknown as number;
        const orders = await store.getUserOrders(id);
        return res.json(orders);
    } catch (err) {
        res.status(401);
        return res.json(err);
    }
};

const addProductToOrder = async(req: Request, res: Response) => {
    try {
        // Get data from payload
        const order = req.get('order') as unknown as number;
        const product = req.get('product') as unknown as number
        const qty = req.get('qty') as unknown as number;
        const newOrder = await store.addProductToOrder(order, product, qty);
        return res.json(newOrder);
    } catch (err) {
        res.status(401);
        return res.json(err);
    }
};

const getProductsFromOrderById = async(req: Request, res: Response) => {
    try {
        // Get data from payload
        const orderId = req.params.id as unknown as number;
        const products = await store.getProductsFromOrderById(orderId);
        return res.json(products);
    } catch (err) {
        res.status(401);
        return res.json(err);
    }
}

const orderRoutes = (app: express.Application) => {
    app.post('/orders/create', verifyAuthToken, createOrder);
    app.get('/orders/getUserOrders/:id', verifyAuthToken, getUserOrders);
    app.put('/orders/addProductToOrder', verifyAuthToken, addProductToOrder);
    app.get('/orders/getOrderById/:id', verifyAuthToken, getProductsFromOrderById);
};

export default orderRoutes;