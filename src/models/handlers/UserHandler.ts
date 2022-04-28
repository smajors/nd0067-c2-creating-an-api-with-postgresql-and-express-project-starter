import express, { NextFunction, Request, Response } from 'express';
import { User, UsersStore } from '../Users';
import jwt from 'jsonwebtoken';

const store = new UsersStore();

const createUser = async (req: Request, res: Response) => {
  const user: User = req.body.user;
  if (user) {
    const newUser = await store.createUser(user);
    res.json(newUser);
  } else {
    throw new Error('An unknown error has occurred');
  }
};

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let token = authHeader?.split(' ')[1];
    // If not in the auth header, look in the body
    if (!token) {
      token = req.body.token;
    }
    const tokenSecret = process.env.TOKEN_SECRET;
    if (token && tokenSecret) {
      const decoded = jwt.verify(token, tokenSecret);
      next();
    }
  } catch (err) {
    res.status(401);
    res.json(err);
  }
};

const userRoutes = (app: express.Application) => {
  app.post('/users', verifyAuthToken, createUser);
};

export default userRoutes;
