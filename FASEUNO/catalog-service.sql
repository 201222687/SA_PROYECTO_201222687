-- ============================================
-- BASE DE DATOS: catalog_db
-- ============================================

DROP DATABASE IF EXISTS catalog_db;
CREATE DATABASE catalog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catalog_db;

CREATE TABLE restaurantes (
    id_restaurante INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE menu_items (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_restaurante INT NOT NULL,
    nombre VARCHAR(150),
    precio DECIMAL(10,2) CHECK (precio >= 0),
    disponible BOOLEAN DEFAULT TRUE
);
