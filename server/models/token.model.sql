CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    refreshToken VARCHAR(255),
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id)
);