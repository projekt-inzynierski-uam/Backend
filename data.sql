CREATE DATABASE todoapp;

CREATE TABLE todos (
    id VARCHAR(255) PRIMARY KEY,
    assigned VARCHAR(255),
    title VARCHAR(30),
    finish_date DATE NOT NULL,
    points INTEGER
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
);

CREATE TABLE objectives (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(25),
    min_points INTEGER,
    max_points INTEGER,
    current_points INTEGER,
    isFinished BOOLEAN
);

CREATE TABLE users_objectives_connection (
    id SERIAL PRIMARY KEY,
    objective_id VARCHAR(255) REFERENCES objectives (id),
    user_email VARCHAR(255) REFERENCES users (email)
);

CREATE TABLE active_objective (
    id SERIAL PRIMARY KEY,
    objective_id VARCHAR(255) REFERENCES objectives (id),
    user_email VARCHAR(255) REFERENCES users (email)
);
