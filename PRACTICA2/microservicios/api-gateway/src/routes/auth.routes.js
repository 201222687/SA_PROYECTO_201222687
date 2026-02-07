const express = require('express');
const router = express.Router();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
/*
const packageDef = protoLoader.loadSync('../proto/auth.proto');
const proto = grpc.loadPackageDefinition(packageDef).auth;
*/

// ================================
// Cargar proto
// ================================
const PROTO_PATH = path.join(__dirname, '../../../proto/auth.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDef).auth;

// ================================
// Cliente gRPC
// ================================

// Conexión gRPC usando variable de entorno
const GRPC_AUTH_HOST = process.env.GRPC_AUTH_HOST || 'localhost:50051';

const client = new proto.AuthService(
  GRPC_AUTH_HOST,
  grpc.credentials.createInsecure()
);

/*
const client = new proto.AuthService(
  'localhost:50051', 
  grpc.credentials.createInsecure()
);
*/
// ================================
// Helper errores gRPC
// ================================
function handleGrpcResponse(err, response, res) {
  if (err) {
    return res.status(400).json({
      error: err.message,
      code: err.code
    });
  }
  res.json(response);
}

/*
// Función helper para manejar errores gRPC
function handleGrpcResponse(err, response, res) {
  if (err) {
    const code = err.code || grpc.status.INTERNAL;
    const message = err.message || 'Error desconocido';
    return res.status(400).json({ code, message });
  }
  res.json(response);
}
  */


// ================================
// RUTAS
// ================================


// Rutas


//  Registro público  CLIENTE
router.post('/register', (req, res) => {
  client.Register(req.body, (err, response) =>
    handleGrpcResponse(err, response, res)
  );
});

//  Login (todos)
router.post('/login', (req, res) => {
  client.Login(req.body, (err, response) =>
    handleGrpcResponse(err, response, res)
  );
});

//  Registro ADMIN  Repartidor / Restaurante
router.post('/admin/register', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token de autorización requerido'
    });
  }

  const metadata = new grpc.Metadata();
  metadata.add('authorization', authHeader);

  client.Register(req.body, metadata, (err, response) =>
    handleGrpcResponse(err, response, res)
  );
});


/*
router.post('/register', (req, res) => {
  client.Register(req.body, (err, response) => handleGrpcResponse(err, response, res));
});

router.post('/login', (req, res) => {
  client.Login(req.body, (err, response) => handleGrpcResponse(err, response, res));
});
*/



module.exports = router;
