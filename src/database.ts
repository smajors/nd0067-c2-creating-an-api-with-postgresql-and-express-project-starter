import dotenv from 'dotenv';
import { Pool } from 'pg';

// Init env variables
dotenv.config();

// Get a reference to process.env
const variables = process.env;

let client: Pool;

// Create client depending on environment
const ENV = variables.ENV;

// Get proper database based on environment.
// Throw an error if the environment is not defined.
if (ENV === 'dev') {
  console.log('Using dev environment');
  client = new Pool({
    host: variables.POSTGRES_HOST,
    database: variables.POSTGRES_DB_DEV,
    user: variables.POSTGRES_USER_DEV,
    password: variables.POSTGRES_PASSWORD_DEV,
  });
} else if (ENV == 'test') {
  console.log('Using test environment');
  client = new Pool({
    host: variables.POSTGRES_HOST,
    database: variables.POSTGRES_DB_TEST,
    user: variables.POSTGRES_USER_TEST,
    password: variables.POSTGRES_PASSWORD_TEST,
  });
} else {
  throw new Error(`Invalid ENVIRONMENT specified. ENV=${ENV}`);
}

export const SALT = variables.BCRYPT_SALT;
export const SALT_ROUNDS = variables.SALT_ROUNDS;

export default client;
