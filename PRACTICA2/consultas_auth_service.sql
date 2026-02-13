
use auth_db;

-- borrar 
TRUNCATE TABLE  roles;

-- Ingreso de datos
INSERT INTO roles (nombre) VALUES ('ADMIN'), ('CLIENTE'),('RESTAURANTE'), ('REPARTIDOR');
INSERT INTO usuario_roles (id_usuario,id_role) VALUES (1,2);
INSERT INTO usuario_roles (id_usuario,id_role) VALUES (8,1);

-- Consultas

select * from usuarios;
select * from usuario_roles;
select * from roles;


SELECT 
    u.id_usuario,
    u.nombre,
    u.correo,
    r.nombre AS rol
FROM usuarios u
JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
JOIN roles r ON ur.id_role = r.id_role
ORDER BY u.id_usuario;
