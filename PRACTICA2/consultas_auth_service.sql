

use auth_db;
select * from usuarios;
select * from usuario_roles;
select * from roles;



-- borrar 
TRUNCATE TABLE  roles;

-- Ingreso de datos
INSERT INTO roles (nombre) VALUES ('ADMIN'), ('CLIENTE'),('RESTAURANTE'), ('REPARTIDOR');