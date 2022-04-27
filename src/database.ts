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
  client = new Pool({
    host: variables.POSTGRES_HOST,
    database: variables.POSTGRES_DB_DEV,
    user: variables.POSTGRES_USER_DEV,
    password: variables.POSTGRES_PASSWORD_DEV,
  });
} else if (ENV == 'test') {
  client = new Pool({
    host: variables.POSTGRES_HOST,
    database: variables.POSTGRES_DB_TEST,
    user: variables.POSTGRES_USER_TEST,
    password: variables.POSTGRES_PASSWORD_TEST,
  });
} else {
  throw new Error(`Invalid ENVIRONMENT specified. ENV=${ENV}`);
}

export default client;
