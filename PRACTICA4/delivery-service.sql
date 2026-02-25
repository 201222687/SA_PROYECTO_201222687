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
