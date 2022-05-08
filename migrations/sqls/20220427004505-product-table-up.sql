/* Create Category Table as prerequsite for Product Table */
CREATE TABLE category (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL);
/* Create product table */
CREATE TABLE product (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, price NUMERIC(10,2) NOT NULL, category_id INTEGER REFERENCES category (id));