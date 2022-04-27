/* Create product table */
CREATE TABLE order_item 
(
    id SERIAL PRIMARY KEY, 
    product_id INTEGER NOT NULL REFERENCES product (id), 
    user_id INTEGER NOT NULL REFERENCES site_user (id), 
    quantity INTEGER NOT NULL, 
    active_flg BOOLEAN NOT NULL
);SE