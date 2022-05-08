import { User, UsersStore } from '../../src/models/Users';
import app from '../../src/server'
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

const userStore = new UsersStore();
const request = supertest(app);
const JWT_TOKEN_SECRET = process.env.TOKEN_SECRET as string;
let authenticatedUser: string;

// Do user model tests before attempting endpoint testing
describe('User Model Tests', () => {
    it('Should have a User Authentication Method', () => {
        expect (userStore.authenticate).toBeDefined();
    });
    it('Should have a Create User Method', () => {
        expect(userStore.createUser).toBeDefined();
    });
    
    it('Should have a Get All Users method', () => {
        expect(userStore.getAllUsers).toBeDefined();
    });
    it('Should have a get single user method', () => {
        expect(userStore.getUser).toBeDefined();
    })
    
});

describe('User Model Endpoint Tests', () => {
    let u: User; 
    beforeAll(() => {
        // Construct user
        u = {
            userName: 'test123',
            firstName: 'Test',
            lastName: 'User',
            password: 'password123'
        }
    });
    it ('Call to / returns Hello World', async () => {
        const response = await request.get('/');
        expect(response.text).toContain('Hello World');
    });
    it('Call to Create with no parameters fails with a 401', async () => {
        const response = await request.post('/users/create');
        expect(response.status).toBe(401);
    })
    it('Make a new user with all correct data, and a correct JWT', async () => {
        const response = await request
        .post('/users/create')
        .set('Authorization', 'Bearer ' + JWT_TOKEN_SECRET)
        .set('user', JSON.stringify(u));
        expect(response.status).toBe(200);
    });
    it('Attempt to login with an invalid username/password combo. Returns 403', async () => {
        const badUser: User = {
            userName: 'badUsername',
            password: 'badPassword'
        };
        // 'Sign' the bad user so a valid auth token is available
        const tokenizedUser = jwt.sign({user: badUser}, JWT_TOKEN_SECRET);
        const response = await request
        .get('/users/authenticate')
        .set('Authorization', 'Bearer ' + tokenizedUser)
        .set('user', tokenizedUser);
        expect(response.status).toBe(403);

    });
    it('Attempt to login with a bad token/no token. Returns 401', async () => {
        const badUser: User = {
            userName: 'badUsername',
            password: 'badPassword'
        };
        // 'Sign' the bad user with a bad token
        const tokenizedUser = jwt.sign({user: badUser}, 'Some bad token secret');
        const response = await request
        .get('/users/authenticate')
        .set('Authorization', 'Bearer ' + tokenizedUser)
        .set('user', tokenizedUser);
        expect(response.status).toBe(401);
    });

    it('Attempt to login with a valid login, but a bad token. Returns 401', async () => {
        // 'Sign' the bad user with a bad token
        const tokenizedUser = jwt.sign({user: u}, 'Some bad token secret');
        const response = await request
        .get('/users/authenticate')
        .set('Authorization', 'Bearer ' + tokenizedUser)
        .set('user', tokenizedUser);
        expect(response.status).toBe(401);
    });

    it('Attempt to login with a valid login, with a valid token. Returns 200', async () => {
        // 'Sign' the good user with a good token
        const tokenizedUser = jwt.sign({user: u}, JWT_TOKEN_SECRET);
        const response = await request
        .get('/users/authenticate')
        .set('Authorization', 'Bearer ' + tokenizedUser)
        .set('user', tokenizedUser);
        // Save authenticated user for later
        authenticatedUser = response.body;
        expect(response.status).toBe(200);
    });

    it('Attempt to retrieve all users. At this point there should be one user.', async () => {
        const response = await request
        .get('/users/getAllUsers')
        .set('Authorization', 'Bearer ' + authenticatedUser);
        expect(response.status).toBe(200);
        expect(Object.keys(response.body).length).toEqual(2);
    });

    it ('Get user by id returns a user', async () => {
        const response = await request
        .get('/users/getUser/2')
        .set('Authorization', 'Bearer ' + authenticatedUser);
        expect(response.status).toBe(200);
        const returnedUserName = response.body.user_name;
        expect(returnedUserName).toBe('test123');
    });
});