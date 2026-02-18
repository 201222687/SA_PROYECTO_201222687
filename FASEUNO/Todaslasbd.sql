-- ============================================
-- BASE DE DATOS: auth_db
-- ============================================

DROP DATABASE IF EXISTS auth_db;
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auth_db;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE usuario_roles (
    id_usuario INT NOT NULL,
    id_role INT NOT NULL,
    PRIMARY KEY (id_usuario, id_role)
);


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

-- ============================================
-- BASE DE DATOS: order_db
-- ============================================

DROP DATABASE IF EXISTS order_db;
CREATE DATABASE order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE order_db;


CREATE TABLE ordenes (
    id_orden INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_restaurante INT NOT NULL,
    estado ENUM('CREADA','EN_PROCESO','FINALIZADA','RECHAZADA'),
    total DECIMAL(10,2),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orden_detalle (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT NOT NULL,
    id_item INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2)
);

-- ============================================
-- BASE DE DATOS: delivery_db
-- ============================================

DROP DATABASE IF EXISTS delivery_db;
CREATE DATABASE delivery_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE delivery_db;


CREATE TABLE entregas (
    id_entrega INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT NOT NULL,
    id_repartidor INT NOT NULL,
    estado ENUM('EN_CAMINO','ENTREGADO','CANCELADO'),
    fecha_asignacion TIMESTAMP,
    fecha_entrega TIMESTAMP
);
