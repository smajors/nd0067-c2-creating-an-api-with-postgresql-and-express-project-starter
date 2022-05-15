import client from '../database';

/**
 * Model for Product Category
 */
export type Category = {
  // Primary key to Product.category_id
  id?: number;
  name: string;
};

/**
 * Model for Product
 */
export type Product = {
  id?: number;
  name: string;
  price: number;
  // Foreign key to Category table
  category_id?: number;
  category?: Category;
};

export class ProductsStore {
  async addCategory(c: Category): Promise<Category> {
    try {
      const sql = 'INSERT INTO category(name) VALUES ($1) RETURNING *';
      const conn = await client.connect();
      const result = await conn.query(sql, [c.name]);
      const newCategory: Category = result.rows[0];
      return newCategory;
    } catch (err) {
      throw new Error(`Error occurred inserting new category: ${err}`);
    }
  }

  /**
   * Creates the given product in the database.
   * @param p Product to create
   */
  async createProduct(p: Product): Promise<Product> {
    try {
      const sql =
        'INSERT INTO product (name, price, category_id) VALUES ($1, $2, $3) RETURNING *';
      const conn = await client.connect();
      const result = await conn.query(sql, [p.name, p.price, p.category_id]);
      const newProduct: Product = result.rows[0];
      conn.release();
      return newProduct;
    } catch (err) {
      throw new Error(
        `Error occurred attempting to create a new product: ${err}`
      );
    }
  }

  async getProduct(id: number): Promise<Product | null> {
    try {
      const sql = 'SELECT * from product where id = ($1)';
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      if (result.rows.length) {
        const product: Product = result.rows[0];
        return product;
      }
    } catch (err) {
      throw new Error(
        `Error occurred while attempting to retrieve a product: ${err}`
      );
    }
    return null;
  }

  /**
   * Gets all products from the database. Must pass in valid token.
   */
  async getAllProducts(): Promise<Product[] | null> {
    try {
      const sql = 'SELECT * FROM product';
      const conn = await client.connect();
      const result = await conn.query(sql);
      conn.release();
      if (result.rows.length) {
        const products: Product[] = result.rows;
        return products;
      }
    } catch (err) {
      throw new Error(
        `Error occurred when attempting to get all products: ${err}`
      );
    }

    return null;
  }

  async getAllProductsByCategory(
    categoryId: number
  ): Promise<Product[] | null> {
    try {
      const sql =
        'SELECT p.id, p.name, p.price, c.id as category_id, c.name as category_name FROM product p LEFT JOIN category c on p.category_id = c.id WHERE p.category_id = ($1) ORDER BY c.name ASC';
      const conn = await client.connect();
      const result = await client.query(sql, [categoryId]);
      conn.release();
      if (result.rows.length) {
        const products: Product[] = [];
        result.rows.forEach((row) => {
          const category: Category = {
            id: row.category_id,
            name: row.category_name,
          };
          const product: Product = {
            id: row.id,
            name: row.name,
            price: row.price,
            category: category,
          };
          products.push(product);
        });

        return products;
      }
    } catch (err) {
      throw new Error(
        `An error occurred retrieving products by category name: ${err}`
      );
    }
    return null;
  }
}
