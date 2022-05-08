import express, { Request, Response } from 'express';
import { Product, Category, ProductsStore } from '../Products';
import verifyAuthToken from '../../Util';

const store = new ProductsStore();

/**
 * Action method to create a new product
 * @param req HTTP Request
 * @param res HTTP Response
 */
const createProduct = async (req: Request, res: Response) => {
  try {
    // Get product from payload
    const product = JSON.parse(req.get('product') as string) as Product;
    const addedProduct = await store.createProduct(product);
    return res.json(addedProduct);
  } catch (err) {
    res.status(401);
    return res.json(err);
  }
};

/**
 * Action method to get a product by ID.
 * @param req HTTP Request
 * @param res HTTP Response
 */
const getProduct = async (req: Request, res: Response) => {
  try {
    // Get id from payload
    const productId = req.params.id as unknown as number;
    const product = await store.getProduct(productId);
    return res.json(product);
  } catch (err) {
    res.status(401);
    return res.json(err);
  }
};

/**
 * Action method to get all store products
 * @param req HTTP Request
 * @param res HTTP Response
 */
const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Get all products
    const products = await store.getAllProducts();
    return res.json(products);
  } catch (err) {
    res.status(401);
    return res.json(err);
  }
};

/**
 * Action method to get all products grouped by category
 * @param req HTTP Request
 * @param res HTTP Response
 */
const getAllProductsByCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id as unknown as number;
    const products = await store.getAllProductsByCategory(categoryId);
    return res.json(products);
  } catch (err) {
    res.status(401);
    return res.json(err);
  }
};

const addCategory = async (req: Request, res: Response) => {
  try {
    const category = JSON.parse(req.get('category') as string) as Category;
    const newCategory = await store.addCategory(category);
    return res.json(newCategory);
  } catch (err) {
    console.log(err);
    res.status(401);
    return res.json(err);
  }
};

const productRoutes = (app: express.Application) => {
  app.post('/products/create', verifyAuthToken, createProduct);
  app.get('/products/getAllProducts', verifyAuthToken, getAllProducts);
  app.get(
    '/products/getAllProductsByCategory/:id',
    verifyAuthToken,
    getAllProductsByCategory
  );
  app.get('/products/getProduct/:id', verifyAuthToken, getProduct);
  app.post('/products/category/create', verifyAuthToken, addCategory);
};

export default productRoutes;
