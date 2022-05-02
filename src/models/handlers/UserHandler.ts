import express, { NextFunction, Request, Response } from 'express';
import { User, UsersStore } from '../Users';
import jwt, { Secret } from 'jsonwebtoken';

const store = new UsersStore();

/**
 * Action method to create a user
 * @param req HTTP Request
 * @param res HTTP Response
 * @returns JSON Payload with the created user as a signed object
 */
const createUser = async (req: Request, res: Response) => {
  try {
    // Get User object from JSON string
    const user = JSON.parse(req.get('user') as string) as User;
    const tokenSecret = process.env.TOKEN_SECRET as unknown as Secret;
    const addedUser = await store.createUser(user);
    const token = jwt.sign({ user: addedUser }, tokenSecret);
    return res.json(token);
  } catch (err) {
    res.status(401);
    res.json(err);
  }
};

/**
 * Action method to retrieve a user by ID
 * @param req HTTP Request
 * @param res HTTP Response
 * @returns JSON Payload with the retrieved user
 */
const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id as unknown as number;
    const user = await store.getUser(userId);
    return res.json(user);
  } catch (err) {
    res.status(401);
    res.json(err);
  }
};

/**
 * Action method to retrieve all users
 * @param req HTTP Request
 * @param res HTTP Response
 * @returns JSON Payload with all users in database
 */
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await store.getAllUsers();
    return res.json(users);
  } catch (err) {
    res.status(401);
    res.json(err);
  }
};

/**
 * Action method to Authenticate and login a user
 * @param req HTTP Request
 * @param res HTTP Response
 * @returns JSON Payload with the logged in user signed
 */
const authenticateUser = async (req: Request, res: Response) => {
  try {
    // Get user attempting to authenticate as the verified payload
    const userPayload = JSON.parse(res.get('verifiedPayload'));
    const user = userPayload.user as User;
    const tokenSecret = process.env.TOKEN_SECRET as unknown as Secret;
    const authenticatedUser = await store.authenticate(
      user.userName,
      user.password
    );
    if (authenticatedUser) {
      const token = jwt.sign({ user: authenticateUser }, tokenSecret);
      return res.json(token);
    } else {
      res.status(403);
      return res.send('User Error');
    }
  } catch (err) {
    res.status(403);
    res.json(err);
  }
};

/**
 * Verify user provided authentication token
 * @param req HTTP Request
 * @param res HTTP Response
 * @returns JSON Payload with verified data, or a 401 error
 */
const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    const tokenSecret = process.env.TOKEN_SECRET as unknown as Secret;
    if (token && tokenSecret) {
      const decoded = jwt.verify(token, tokenSecret);
      // Add verified payload to the response
      res.set('verifiedPayload', JSON.stringify(decoded));
    }
  } catch (err) {
    return res.status(401).json(err);
  }
  next();
};

const userRoutes = (app: express.Application) => {
  app.post('/users/create', createUser);
  app.get('/users/authenticate', verifyAuthToken, authenticateUser);
  app.get('/users/getAllUsers', verifyAuthToken, getAllUsers);
  app.get('/users/getUser/:id', verifyAuthToken, getUser);
};

export default userRoutes;
