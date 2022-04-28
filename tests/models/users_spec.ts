import { User, UsersStore } from '../../src/models/Users';
import app from '../../src/server'
import supertest from 'supertest';

const store = new UsersStore();
const request = supertest(app);

// Do user model tests before attempting endpoint testing
describe('User Model Tests', () => {
    it('Should have a User Authentication Method', () => {
        expect (store.authenticate).toBeDefined();
    });
    it('Should have a Create User Method', () => {
        expect(store.createUser).toBeDefined();
    });
    /*
    it('Should have a Show All Users method', () => {
        expect(store.showAllUsers).toBeDefined();
    });
    */
});

describe('User Model Endpoint Tests', () => {
    it('Call to Create with no parameters fails with a 401', async () => {
        const response = await request.put('/users');
        expect(response.status).toBe(401);
    });
})