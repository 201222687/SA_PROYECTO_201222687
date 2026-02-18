

const mysql = require('mysql2/promise');

class UserRepository {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'host.docker.internal',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
  }

  async findByEmail(correo) {
    const [rows] = await this.pool.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );
    return rows[0] || null;
  }

  async create(user) {
    const [result] = await this.pool.query(
      'INSERT INTO usuarios (nombre, correo, password_hash) VALUES (?,?,?)',
      [user.nombre, user.correo, user.password_hash]
    );
    return result.insertId;
  }

  async assignRole(userId, roleName) {
    const [[role]] = await this.pool.query(
      'SELECT id_role FROM roles WHERE nombre = ?',
      [roleName]
    );

    if (!role) throw new Error('Rol no existe');

    await this.pool.query(
      'INSERT INTO usuario_roles (id_usuario, id_role) VALUES (?,?)',
      [userId, role.id_role]
    );
  }

  async getUserRole(userId) {
    const [[row]] = await this.pool.query(`
      SELECT r.nombre
      FROM roles r
      JOIN usuario_roles ur ON r.id_role = ur.id_role
      WHERE ur.id_usuario = ?
    `, [userId]);

    return row?.nombre;
  }
}

module.exports = UserRepository;



/*
const mysql = require('mysql2/promise');

class UserRepository {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'host.docker.internal', // mysql es el nombre del servicio MySQL
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  async findByEmail(correo) {
    const [rows] = await this.pool.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );
    return rows[0] || null;
  }

  async create(user) {
    try {
      const [result] = await this.pool.query(
        'INSERT INTO usuarios (nombre, correo, password_hash) VALUES (?,?,?)',
        [user.nombre, user.correo, user.password_hash]
      );
      return result.insertId;
    } catch (err) {
      // Error de duplicado en MySQL
      if (err.errno === 1062) {
        throw new Error('Correo ya existe');
      }
      throw err;
    }
  }
}

module.exports = UserRepository;
*/
/*

Características:

Captura duplicados (errno 1062)

Conexión pool segura

Retorna null si no encuentra usuario

*/