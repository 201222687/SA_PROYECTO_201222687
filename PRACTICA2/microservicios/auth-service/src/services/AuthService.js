const bcrypt = require('bcryptjs');

class AuthService {
  constructor(userRepo, jwtService) {
    this.userRepo = userRepo;
    this.jwtService = jwtService;
  }

  async register({ nombre, correo, password, rol }, requesterRole = 'CLIENTE') {
    if (!nombre || !correo || !password) {
      throw new Error('Faltan datos obligatorios');
    }

    if (rol && requesterRole !== 'ADMIN') {
      throw new Error('No autorizado para crear este tipo de usuario');
    }

    const finalRole = rol || 'CLIENTE';

    const existing = await this.userRepo.findByEmail(correo);
    if (existing) throw new Error('Correo ya existe');

    const password_hash = await bcrypt.hash(password, 12);
    const userId = await this.userRepo.create({ nombre, correo, password_hash });

    await this.userRepo.assignRole(userId, finalRole);

    const token = this.jwtService.generate({
      sub: userId,
      correo,
      rol: finalRole
    });

    return {
      token,
      id_usuario: userId,
      correo,
      rol: finalRole
    };
  }

  async login({ correo, password }) {
    const user = await this.userRepo.findByEmail(correo);
    if (!user) throw new Error('Usuario no existe');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Credenciales inválidas');

    const rol = await this.userRepo.getUserRole(user.id_usuario);

    const token = this.jwtService.generate({
      sub: user.id_usuario,
      correo,
      rol
    });

    return {
      token,
      id_usuario: user.id_usuario,
      correo,
      rol
    };
  }
}

module.exports = AuthService;


/*
const bcrypt = require('bcryptjs');

class AuthService {
  constructor(userRepo, jwtService) {
    this.userRepo = userRepo;
    this.jwtService = jwtService;
  }

  async register({ nombre, correo, password }) {
    if (!nombre || !correo || !password) {
      throw new Error('Faltan datos obligatorios');
    }

    const existingUser = await this.userRepo.findByEmail(correo);
    if (existingUser) throw new Error('Correo ya existe');

    const password_hash = await bcrypt.hash(password, 12);
    const userId = await this.userRepo.create({ nombre, correo, password_hash });

    return this.jwtService.generate({ sub: userId, correo });
  }

  async login({ correo, password }) {
    if (!correo || !password) throw new Error('Faltan datos obligatorios');

    const user = await this.userRepo.findByEmail(correo);
    if (!user) throw new Error('Usuario no existe');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Credenciales inválidas');

    return this.jwtService.generate({ sub: user.id_usuario, correo: user.correo });
  }
}

module.exports = AuthService;

*/

/*Características:

Validación de campos obligatorios

Hashing seguro con bcrypt (salt 12)

Manejo claro de errores (Correo ya existe, Usuario no existe, Credenciales inválidas)
*/