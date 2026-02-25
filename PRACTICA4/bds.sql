-- ==========================================================
-- PROYECTO: DELIVEREATS – FASE 2
-- BASES DE DATOS COMPLETAS (MYSQL)
-- Arquitectura preparada para microservicios y mensajería
-- ==========================================================



/* ==========================================================
   1️⃣ BASE DE DATOS: auth_db
   ========================================================== */

DROP DATABASE IF EXISTS auth_db;
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auth_db;

CREATE TABLE roles (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE usuario_roles (
    id_usuario INT NOT NULL,
    id_role INT NOT NULL,
    PRIMARY KEY (id_usuario, id_role),
    CONSTRAINT fk_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_role FOREIGN KEY (id_role)
        REFERENCES roles(id_role)
        ON DELETE CASCADE
);



/* ==========================================================
   2️⃣ BASE DE DATOS: catalog_db
   ========================================================== */

DROP DATABASE IF EXISTS catalog_db;
CREATE DATABASE catalog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catalog_db;

CREATE TABLE restaurantes (
    id_restaurante INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_restaurante INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    disponible BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_restaurante
        FOREIGN KEY (id_restaurante)
        REFERENCES restaurantes(id_restaurante)
        ON DELETE CASCADE
);

CREATE INDEX idx_menu_restaurante ON menu_items(id_restaurante);



/* ==========================================================
   3️⃣ BASE DE DATOS: order_db
   ========================================================== */

DROP DATABASE IF EXISTS order_db;
CREATE DATABASE order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE order_db;

CREATE TABLE ordenes (
    id_orden INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_restaurante INT NOT NULL,
    estado ENUM(
        'CREADA',
        'VALIDADA',
        'EN_PROCESO',
        'LISTA',
        'ENVIADA_A_DELIVERY',
        'FINALIZADA',
        'RECHAZADA',
        'CANCELADA'
    ) NOT NULL DEFAULT 'CREADA',
    total DECIMAL(10,2),
    version INT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE orden_detalle (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT NOT NULL,
    id_item INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_orden
        FOREIGN KEY (id_orden)
        REFERENCES ordenes(id_orden)
        ON DELETE CASCADE
);

CREATE INDEX idx_orden_cliente ON ordenes(id_cliente);
CREATE INDEX idx_orden_restaurante ON ordenes(id_restaurante);


-- =============================
-- EVENTOS DE ORDEN (Auditoría)
-- =============================

CREATE TABLE order_events (
    id_evento BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT NOT NULL,
    tipo_evento VARCHAR(100) NOT NULL,
    payload JSON NOT NULL,
    procesado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evento_orden
        FOREIGN KEY (id_orden)
        REFERENCES ordenes(id_orden)
        ON DELETE CASCADE
);


-- =============================
-- OUTBOX PATTERN (RabbitMQ)
-- =============================

CREATE TABLE outbox_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id INT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSON NOT NULL,
    enviado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outbox_enviado ON outbox_events(enviado);



/* ==========================================================
   4️⃣ BASE DE DATOS: delivery_db
   ========================================================== */

DROP DATABASE IF EXISTS delivery_db;
CREATE DATABASE delivery_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE delivery_db;

CREATE TABLE repartidores (
    id_repartidor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entregas (
    id_entrega INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT NOT NULL,
    id_repartidor INT NOT NULL,
    estado ENUM(
        'ASIGNADA',
        'EN_CAMINO',
        'ENTREGADO',
        'CANCELADO'
    ) NOT NULL,
    fecha_asignacion TIMESTAMP,
    fecha_entrega TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_entrega_orden ON entregas(id_orden);
CREATE INDEX idx_entrega_repartidor ON entregas(id_repartidor);