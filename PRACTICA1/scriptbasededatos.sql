-- ============================================
-- BASE DE DATOS: Delivereats
-- ============================================

DROP DATABASE IF EXISTS delivereats;
CREATE DATABASE delivereats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE delivereats;

-- ============================================
-- TABLAS AUTH (Usuarios y Roles)
-- ============================================

CREATE TABLE roles (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario_roles (
    id_usuario INT NOT NULL,
    id_role INT NOT NULL,
    PRIMARY KEY (id_usuario, id_role),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_role) REFERENCES roles(id_role)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- TABLAS CATALOGO (Restaurantes y Menú)
-- ============================================

CREATE TABLE restaurantes (
    id_restaurante INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    direccion VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_restaurante INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_restaurante) REFERENCES restaurantes(id_restaurante)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- TABLAS ORDENES (Órdenes y Detalles)
-- ============================================

CREATE TABLE ordenes (
    id_orden INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_restaurante INT NOT NULL,
    estado ENUM('CREADA','EN_PROCESO','FINALIZADA','RECHAZADA') NOT NULL DEFAULT 'CREADA',
    total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    direccion_entrega VARCHAR(200) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_restaurante) REFERENCES restaurantes(id_restaurante)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE orden_detalle (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT NOT NULL,
    id_item INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_item) REFERENCES menu_items(id_item)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================
-- TABLAS DELIVERY (Entregas)
-- ============================================

CREATE TABLE entregas (
    id_entrega INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT NOT NULL UNIQUE,
    id_repartidor INT,
    estado ENUM('EN_CAMINO','ENTREGADO','CANCELADO') NOT NULL DEFAULT 'EN_CAMINO',
    fecha_asignacion TIMESTAMP NULL,
    fecha_entrega TIMESTAMP NULL,
    FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_repartidor) REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================
-- DATOS DE PRUEBA (Roles, Usuarios, Restaurantes, Menú, Órdenes, Entregas)
-- ============================================

-- Roles
INSERT INTO roles (nombre) VALUES
('ADMIN'),
('CLIENTE'),
('RESTAURANTE'),
('REPARTIDOR');

-- Usuarios
INSERT INTO usuarios (nombre, correo, password_hash, telefono, direccion) VALUES
('Admin Principal', 'admin@delivereats.com', 'hash_admin', '5555-0001', 'Zona 1, Ciudad'),
('Juan Cliente', 'cliente@delivereats.com', 'hash_cliente', '5555-0002', 'Zona 7, Ciudad'),
('Restaurante Owner', 'restaurante@delivereats.com', 'hash_rest', '5555-0003', 'Zona 10, Ciudad'),
('Pedro Repartidor', 'repartidor@delivereats.com', 'hash_repartidor', '5555-0004', 'Zona 5, Ciudad');

-- Asignar roles a usuarios
INSERT INTO usuario_roles (id_usuario, id_role) VALUES
(1, 1), -- Admin -> ADMIN
(2, 2), -- Cliente -> CLIENTE
(3, 3), -- Owner -> RESTAURANTE
(4, 4); -- Repartidor -> REPARTIDOR

-- Restaurantes
INSERT INTO restaurantes (nombre, descripcion, direccion, telefono) VALUES
('Pizza Express', 'Pizzas artesanales y bebidas', 'Zona 10, Ciudad', '2222-1111'),
('Burger House', 'Hamburguesas premium', 'Zona 4, Ciudad', '2222-2222');

-- Menú
INSERT INTO menu_items (id_restaurante, nombre, descripcion, precio, disponible) VALUES
(1, 'Pizza Pepperoni', 'Pizza grande con pepperoni', 65.00, TRUE),
(1, 'Pizza Hawaiana', 'Pizza grande con piña y jamón', 60.00, TRUE),
(1, 'Coca Cola 600ml', 'Bebida gaseosa', 10.00, TRUE),
(2, 'Hamburguesa Clásica', 'Carne, queso y vegetales', 45.00, TRUE),
(2, 'Papas Fritas', 'Papas medianas', 20.00, TRUE),
(2, 'Refresco Natural', 'Bebida natural', 12.00, TRUE);

-- Órdenes
INSERT INTO ordenes (id_cliente, id_restaurante, estado, total, direccion_entrega) VALUES
(2, 1, 'CREADA', 75.00, 'Zona 7, Calle Principal'),
(2, 2, 'EN_PROCESO', 65.00, 'Zona 7, Avenida Central'),
(2, 1, 'FINALIZADA', 70.00, 'Zona 7, Colonia A'),
(2, 2, 'RECHAZADA', 45.00, 'Zona 7, Colonia B');

-- Detalles de órdenes
INSERT INTO orden_detalle (id_orden, id_item, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 65.00, 65.00),
(1, 3, 1, 10.00, 10.00),

(2, 4, 1, 45.00, 45.00),
(2, 5, 1, 20.00, 20.00),

(3, 2, 1, 60.00, 60.00),
(3, 3, 1, 10.00, 10.00),

(4, 4, 1, 45.00, 45.00);

-- Entregas
INSERT INTO entregas (id_orden, id_repartidor, estado, fecha_asignacion, fecha_entrega) VALUES
(2, 4, 'EN_CAMINO', NOW(), NULL),
(3, 4, 'ENTREGADO', NOW(), NOW()),
(4, NULL, 'CANCELADO', NULL, NULL);

-- ============================================
-- CONSULTAS DE VALIDACIÓN (Opcional)
-- ============================================

-- Ver usuarios con roles
SELECT u.id_usuario, u.nombre, r.nombre AS rol
FROM usuarios u
JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
JOIN roles r ON ur.id_role = r.id_role
ORDER BY u.id_usuario;

-- Ver menú completo
SELECT res.nombre AS restaurante, mi.nombre AS item, mi.precio, mi.disponible
FROM menu_items mi
JOIN restaurantes res ON mi.id_restaurante = res.id_restaurante
ORDER BY res.id_restaurante;

-- Ver órdenes con estado
SELECT o.id_orden, u.nombre AS cliente, r.nombre AS restaurante, o.estado, o.total
FROM ordenes o
JOIN usuarios u ON o.id_cliente = u.id_usuario
JOIN restaurantes r ON o.id_restaurante = r.id_restaurante
ORDER BY o.id_orden;

-- Ver entregas con estado
SELECT e.id_entrega, e.id_orden, e.estado, u.nombre AS repartidor
FROM entregas e
LEFT JOIN usuarios u ON e.id_repartidor = u.id_usuario
ORDER BY e.id_entrega;
