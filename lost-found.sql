CREATE DATABASE IF NOT EXISTS lost_found;
USE lost_found;

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  location_found VARCHAR(150) NOT NULL,
  date_found DATE NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO items (name, category, location_found, date_found)
VALUES ('Black phone', 'Electronics', 'Library', '2026-11-05'),
       ('House keys', 'Keys', 'Main gate', '2026-11-06');