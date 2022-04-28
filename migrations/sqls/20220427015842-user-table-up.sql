/* Create user table */
CREATE TABLE site_user 
(
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(25) UNIQUE NOT NULL, 
    first_name VARCHAR(50) NOT NULL, 
    last_name VARCHAR(50) NOT NULL, 
    password CHAR(64) NOT NULL
);