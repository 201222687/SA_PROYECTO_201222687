use catalog_db;


select * from menu_items;
select * from restaurantes;


INSERT INTO restaurantes (nombre, direccion, activo) VALUES
('Pizza Planet', 'Zona 10', TRUE),
('Burger House', 'Zona 14', TRUE),
('Sushi Express', 'Zona 15', TRUE),
('Taco Loco', 'Zona 1', TRUE),
('Pasta Italia', 'Zona 9', TRUE);

INSERT INTO menu_items (id_restaurante, nombre, precio, disponible) VALUES
(1, 'Pizza Pepperoni', 80.00, TRUE),
(1, 'Pizza Hawaiana', 85.00, TRUE),
(1, 'Lasagna', 65.00, TRUE),
(1, 'Pan con Ajo', 25.00, TRUE),
(1, 'Refresco', 10.00, FALSE);

INSERT INTO menu_items (id_restaurante, nombre, precio, disponible) VALUES
(2, 'Hamburguesa Clásica', 45.00, TRUE),
(2, 'Hamburguesa Doble', 60.00, TRUE),
(2, 'Papas Fritas', 20.00, TRUE),
(2, 'Aros de Cebolla', 22.00, TRUE),
(2, 'Milkshake', 18.00, TRUE);

INSERT INTO menu_items (id_restaurante, nombre, precio, disponible) VALUES
(3, 'California Roll', 55.00, TRUE),
(3, 'Dragon Roll', 70.00, TRUE),
(3, 'Nigiri Salmón', 50.00, TRUE),
(3, 'Tempura Roll', 65.00, TRUE),
(3, 'Sopa Miso', 30.00, TRUE);

INSERT INTO menu_items (id_restaurante, nombre, precio, disponible) VALUES
(4, 'Taco al Pastor', 15.00, TRUE),
(4, 'Taco de Carne Asada', 18.00, TRUE),
(4, 'Quesadilla', 20.00, TRUE),
(4, 'Nachos', 35.00, TRUE),
(4, 'Horchata', 12.00, TRUE);

INSERT INTO menu_items (id_restaurante, nombre, precio, disponible) VALUES
(5, 'Spaghetti Bolognesa', 75.00, TRUE),
(5, 'Fettuccine Alfredo', 78.00, TRUE),
(5, 'Ravioli Ricotta', 82.00, TRUE),
(5, 'Pizza Margarita', 70.00, TRUE),
(5, 'Tiramisú', 40.00, TRUE);



