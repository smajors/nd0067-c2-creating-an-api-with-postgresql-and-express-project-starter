import app from '../../src/server'
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { Category, Product, ProductsStore } from '../../src/models/Products';
import { User, UsersStore } from '../../src/models/Users';

const request = supertest(app);
let productStore: ProductsStore;
let usersStore: UsersStore;
let authenticatedUser: User;

const timer = (ms: number | undefined) => new Promise(res => setTimeout(res, ms));

/* PRODUCTS */

// Do product method tests before endpoint testing
describe('Product Model Tests', () => {
    it('Add Product Method is Defined', () => {
        expect(productStore.createProduct).toBeDefined();
    });
    it('Get Product Method is Defined', () => {
        expect(productStore.getProduct).toBeDefined();
    });
    it('Get all Products Method is Defined', () => {
        expect(productStore.getAllProducts).toBeDefined();
    });
    it('Get All Products Grouped by Category Method is Defined', () => {
        expect(productStore.getAllProductsByCategory).toBeDefined();
    });
    it('Expect add category method to be defined.', () => {
        expect(productStore.addCategory).toBeDefined();
    })
});

describe('Product endpoint tests', () => {
    productStore = new ProductsStore();
    usersStore = new UsersStore();
    let category1: Category;
    let category2: Category;
    let category3: Category;
    beforeAll( async () => {
        await timer(2000);
        category1 = {
            name: 'Electronics'
        }
        category2 = {
            name: 'Housewares'
        }
        category3 = {
            name: 'Clothing'
        }
        // Login test user from prior tests
        const u: User = {
            userName: 'test_products',
            firstName: 'Product',
            lastName: 'User',
            password: 'password123'
        }

        // Piggy back off UserStore to create Test user
        const rawUser = await usersStore.createUser(u);
        // Sign in user for later use
        const signedUser = jwt.sign({user: u}, process.env.TOKEN_SECRET as string);
        const signedNewUser = await request
        .get('/users/authenticate')
        .set('Authorization', 'Bearer ' + signedUser)
        .set('user', signedUser);

        authenticatedUser = signedNewUser.body;


        if (!authenticatedUser) fail('Test user does not exist');
    });

    it('Do call to getAllProducts for a 200 response', async () => {
        const response = await request
        .get('/products/getAllProducts')
        .set('Authorization', 'Bearer ' + authenticatedUser);
        expect(response.status).toBe(200);
    })
    
    it('Add all three categories to the database. Return 200 for each.', async () => {
        const response1 = await request
        .post('/products/category/create')
        .set('Authorization', 'Bearer ' + authenticatedUser)
        .set('category', JSON.stringify(category1));

        const response2 = await request
        .post('/products/category/create')
        .set('Authorization', 'Bearer ' + authenticatedUser)
        .set('category', JSON.stringify(category2));

        const response3 = await request
        .post('/products/category/create')
        .set('Authorization', 'Bearer ' + authenticatedUser)
        .set('category', JSON.stringify(category3));

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);
        expect(response3.status).toBe(200);
    });

    it('Create five products. Three will have Category 1 and Two will hava Category 3. All responses checked for 200 status code and correct data.', async () => {
        const product1: Product = {
            name: 'Computer',
            price: 1199.99,
            category_id: 1
        }
        const product2: Product = {
            name: 'LED Monitor',
            price: 249.99,
            category_id: 1
        }
        const product3: Product = {
            name: '60 inch LED TV',
            price: 649.99,
            category_id: 1
        }
        const product4: Product = {
            name: 'Blue Jeans',
            price: 59.99,
            category_id: 3
        }
        const product5: Product = {
            name: 'Button-down Shirt',
            price: 39.99,
            category_id: 3
        }
        // API Create the Products
        const response1 = await request
        .post('/products/create')
        .set('Authorization', 'Bearer ' + authenticatedUser)
        .set('product', JSON.stringify(product1));
        const response2 = await request
        .post('/products/create')
        .set('Authorization', 'Bearer ' + authenticatedUser)
        .set('product', JSON.stringify(product2));
        const response3 = await request
        .post('/products/create')
        .set('Authorization', 'Bearer ' + authenticatedUser)
        .set('product', JSON.stringify(product3));
        const response4 = await request
        .post('/products/create')
        .set('Authorization', 'Bearer ' + authenticatedUser)
        .set('product', JSON.stringify(product4));
        const response5 = await request
        .post('/products/create')
        .set('Authorization', 'Bearer ' + authenticatedUser)
        .set('product', JSON.stringify(product5));

        // Do assertions. First that there were actual 200 responses
        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);
        expect(response3.status).toBe(200);
        expect(response4.status).toBe(200);
        expect(response5.status).toBe(200);

        // We have good responses, parse one product for correct data
        const newProduct1 = response1.body as Product;

        expect(newProduct1.name).toEqual('Computer');
        const stringPrice = newProduct1.price.toString();
        expect(stringPrice).toEqual('1199.99');
        expect(newProduct1.category_id = 1);
    });

    it('Get the product with id of 3 and compare with given data', async () => {
        const response = await request
        .get('/products/getProduct/3')
        .set('Authorization', 'Bearer ' + authenticatedUser);

        const product = response.body as Product

        expect(response.status).toBe(200);
        expect(product.name).toBeDefined();
        expect(product.price).toBeDefined();
        expect(product.category_id).toBeDefined();       
    });

    it('Get all products in database. Return value should be five or six products in total. (Depending on test order)', async () => {
        const response = await request
        .get('/products/getAllProducts')
        .set('Authorization', 'Bearer ' + authenticatedUser);
        expect(response.status).toBe(200);
        expect(Object.keys(response.body).length).toBeGreaterThanOrEqual(5);
    });

    it('Get all products with a category ID of 1 (Electronics)', async () => {
        const response = await request
        .get('/products/getAllProductsByCategory/1')
        .set('Authorization', 'Bearer ' + authenticatedUser);
        expect(response.status).toBe(200);
        expect(Object.keys(response.body).length).toEqual(3);
        
    });

});