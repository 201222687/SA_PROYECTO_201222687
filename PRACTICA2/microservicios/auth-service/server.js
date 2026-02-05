require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// RUTAS RELATIVAS CORRECTAS DESDE server.js
const UserRepository = require('./src/repositories/UserRepository');
const AuthService = require('./src/services/AuthService');
const JwtService = require('./src/utils/JwtService');

// Cargar el proto
const packageDef = protoLoader.loadSync('../proto/auth.proto'); // subir a microservicios/proto
const proto = grpc.loadPackageDefinition(packageDef).auth;

// Inicializar servicios
const userRepo = new UserRepository();
const jwtService = new JwtService();
const authService = new AuthService(userRepo, jwtService);

// Servidor gRPC
const server = new grpc.Server();

// Función helper para mapear errores a códigos gRPC
function mapErrorToGrpcCode(err) {
  const msg = err.message || 'Error desconocido';

  if (msg.includes('Correo ya existe')) return { code: grpc.status.ALREADY_EXISTS, message: msg };
  if (msg.includes('Usuario no existe')) return { code: grpc.status.NOT_FOUND, message: msg };
  if (msg.includes('Credenciales inválidas') || msg.includes('Faltan datos obligatorios')) {
    return { code: grpc.status.INVALID_ARGUMENT, message: msg };
  }
  return { code: grpc.status.INTERNAL, message: msg };
}

// Registrar servicios gRPC
server.addService(proto.AuthService.service, {
  Register: async (call, callback) => {
    try {
      const token = await authService.register(call.request);
      callback(null, { token });
    } catch (err) {
      callback(mapErrorToGrpcCode(err));
    }
  },

  Login: async (call, callback) => {
    try {
      const token = await authService.login(call.request);
      callback(null, { token });
    } catch (err) {
      callback(mapErrorToGrpcCode(err));
    }
  }
});

// Levantar servidor
server.bindAsync(
  '0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log('Auth Service gRPC corriendo en puerto 50051 🚀');
  }
);
