import client from '../database';
import { SALT, SALT_ROUNDS } from '../database';
import bcrypt from 'bcrypt';

/**
 * Model shape for User
 */
export type User = {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
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
        'INSERT INTO site_user (user_name, password) VALUES($1, $2) RETURNING *';
      const conn = await client.connect();

      // Get hash
      const hash = bcrypt.hashSync(u.password + SALT, Number(SALT_ROUNDS));

      const result = await conn.query(sql, [u.userName, hash]);
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
   * Authenticates a given user. Returns null if there was an issue authenticating.
   * @param username Username to check
   * @param password Password to check
   */
  async authenticate(username: string, password: string): Promise<User | null> {
    const conn = await client.connect();
    const sql = 'SELECT password FROM site_user WHERE user_name = ($1)';

    const result = await conn.query(sql, [username]);

    // There is a user. Check the password against the hash
    if (result.rows.length) {
      const user: User = result.rows[0];

      if (bcrypt.compareSync(password + SALT, user.password)) {
        return user;
      }
    }

    return null;
  }
}
