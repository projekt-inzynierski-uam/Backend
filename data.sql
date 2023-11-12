CREATE DATABASE todoapp;

CREATE TABLE todos (
    id VARCHAR(255) PRIMARY KEY,
    user_email VARCHAR(255),
    title VARCHAR(30),
    is_assigned_to_group BOOLEAN NOT NULL
);

CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    hashed_password VARCHAR(255)
);

CREATE TABLE groups (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE user_in_groups (
    id SERIAL PRIMARY KEY,
    group_id VARCHAR(255) REFERENCES groups (id),
    user_email VARCHAR(255) REFERENCES users (email)
)