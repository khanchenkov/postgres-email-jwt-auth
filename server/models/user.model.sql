CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    isActivated boolean DEFAULT false,
    activationLink VARCHAR(255)
);