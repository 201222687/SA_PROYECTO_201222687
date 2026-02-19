const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// =============================
// CARGAR PROTO
// =============================
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "../../../proto/auth.proto"),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Host configurable
const AUTH_HOST = process.env.AUTH_GRPC_HOST || 'localhost:50051';

const authClient = new authProto.AuthService(
  AUTH_HOST,
  grpc.credentials.createInsecure()
);

module.exports = authClient;