const mysql = require('mysql2/promise');

class UserRepository {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'db', // db es el nombre del servicio MySQL
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

/*

Características:

Captura duplicados (errno 1062)

Conexión pool segura

Retorna null si no encuentra usuario

*/