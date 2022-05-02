import client from '../database';
import { SALT, SALT_ROUNDS } from '../database';
import bcrypt from 'bcrypt';

/**
 * Model shape for User
 */
export type User = {
  id?: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  password: string;
};

export class UsersStore {
  /**
   * Creates a new user in the database
   * @param u User to create
   */
  async createUser(u: User): Promise<User> {
    try {
      const sql =
        'INSERT INTO site_user (user_name, first_name, last_name, password) VALUES($1, $2, $3, $4) RETURNING *';
      const conn = await client.connect();
      // Get hash
      const hash = bcrypt.hashSync(u.password + SALT, Number(SALT_ROUNDS));
      const result = await conn.query(sql, [
        u.userName,
        u.firstName,
        u.lastName,
        hash,
      ]);
      const user: User = result.rows[0];
      conn.release();

      return user;
    } catch (err) {
      throw new Error(
        `Error occurred while attempting to create new user: ${err}`
      );
    }
  }

  /**
   * Returns a list of all users in the database.
   * @returns A list of all users, or null if there are no users
   */
  async getAllUsers(): Promise<User[] | null> {
    try {
      const sql = 'SELECT * FROM site_user';
      const conn = await client.connect();
      const result = await conn.query(sql);
      conn.release();
      if (result.rows.length) {
        const users: User[] = result.rows;
        return users;
      }
    } catch (err) {
      throw new Error(
        `Error occurred when attempting to get all users: ${err}`
      );
    }

    return null;
  }

  /**
   * Returns a user from the database by ID.
   * @param id The id of the User to return
   * @returns User by id, or null if the user does not exist
   */
  async getUser(id: number): Promise<User | null> {
    try {
      const sql = 'SELECT * FROM site_user WHERE id = ($1)';
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      conn.release();
      if (result.rows.length) {
        const user: User = result.rows[0];
        return user;
      }
    } catch (err) {
      throw new Error(
        `Error occurred when attempting to get all users: ${err}`
      );
    }
    return null;
  }

  /**
   * Authenticates a given user. Returns null if there was an issue authenticating.
   * @param username Username to check
   * @param password Password to check
   */
  async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM site_user WHERE user_name = ($1)';
      const result = await conn.query(sql, [username]);
      conn.release();

      // There is a user. Check the password against the hash
      if (result.rows.length) {
        const user: User = result.rows[0];
        if (
          await bcrypt.compare(password.trim() + SALT, user.password.trim())
        ) {
          return user;
        }
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
    return null;
  }
}
