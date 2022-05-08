/* Create order table */
CREATE TABLE user_order
(
    id SERIAL PRIMARY KEY,  
    user_id INTEGER NOT NULL REFERENCES site_user (id),  
    active_flg BOOLEAN NOT NULL
);

/* Create order-product link table */
CREATE TABLE order_product
(
    id SERIAL PRIMARY KEY,
    quantity INTEGER NOT NULL,
    product_id INTEGER NOT NULL REFERENCES product (id),
    order_id INTEGER NOT NULL REFERENCES user_order (id)
);