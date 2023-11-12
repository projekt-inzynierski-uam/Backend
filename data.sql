CREATE DATABASE todoapp;

CREATE TABLE todos (
    id VARCHAR(255) PRIMARY KEY,
    user_email VARCHAR(255),
<<<<<<< Updated upstream
    title VARCHAR(30)
=======
    title VARCHAR(30),
    is_assigned_to_group BOOLEAN NOT NULL
>>>>>>> Stashed changes
);

CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    hashed_password VARCHAR(255)
);