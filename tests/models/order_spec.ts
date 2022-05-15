import app from "../../src/server";
import supertest from "supertest";
import jwt from 'jsonwebtoken';
import client from "../../src/database";
import { Order, OrderProduct, OrdersStore } from "../../src/models/Orders";
import { UsersStore, User } from '../../src/models/Users';
import { ProductsStore, Product, Category } from '../../src/models/Products';
import { doesNotMatch } from "assert";
const request = supertest(app);
let ordersStore: OrdersStore;
let usersStore: UsersStore;
let productsStore: ProductsStore;
let authenticatedUser: User;


// Do order method tests before endpoint testing
describe('Order Model Tests', () => {
    it('Expect Add Order method to be defined', () => {
        expect(ordersStore.createOrder).toBeDefined();
    });
});

describe('Order Endpoint Tests', () => {
    ordersStore = new OrdersStore();
    usersStore = new UsersStore();
    productsStore = new ProductsStore();
    beforeAll( async () => {
        // Create user for this series of tests
        const u: User = {
            userName: 'test_orders',
            firstName: 'Order',
            lastName: 'User',
            password: 'password123'
        };

        await usersStore.createUser(u);
        // Sign in user for later user
        const signedUser = jwt.sign({user: u}, process.env.TOKEN_SECRET as string);
        const signedNewUser = await request
        .get('/users/authenticate')
        .set('Authorization', 'Bearer ' + signedUser)
        .set('user', signedUser);

        authenticatedUser = signedNewUser.body;

        // Create a Product and Product Category
        const p: Product = {
            name: 'TestProduct',
            price: 22.99
        };

        const pc: Category = {
            name: 'TestCategory'
        }

        await productsStore.addCategory(pc);
        await productsStore.createProduct(p);

    });

    it('Create an new order with the test user.', async () => {
        const order: Order = {
            user_id: 1,
            active_flg: true
        }
        const response = await request
        .post('/orders/create')
        .set('Authorization', 'Bearer ' + authenticatedUser)
        .set('order', JSON.stringify(order));

        expect(response.status).toBe(200);
        const newOrder = response.body as Order;
        expect(newOrder.active_flg).toBeTrue();
        expect(newOrder.user_id).toBe(1);
    });

    it('Get the user order by user ID.', async () => {
        const response = await request
        .get('/orders/getUserOrders/1')
        .set('Authorization', 'Bearer ' + authenticatedUser);

        expect(response.status).toBe(200);
        const orders = response.body as Order[];
        expect(orders[0].id).toBeDefined();
        expect(orders[0].active_flg).toBeTrue();
    });

    it('Add a product to the order', async () => {

        const response = await request
        .put('/orders/addProductToOrder')
        .set('Authorization', 'Bearer ' + authenticatedUser)
        .set('order', '1')
        .set('product', '1')
        .set('qty', '3');

        expect(response.status).toBe(200);

    });

    it('Get the products associated with the order by id', async () => {
        const response = await request
        .get('/orders/getOrderById/1')
        .set('Authorization', 'Bearer ' + authenticatedUser)
        expect(response.status).toBe(200);
        // Should be one product in this order.
        console.log(JSON.stringify(response.body));
        expect(Object.keys(response.body).length).toEqual(1);
    });
});