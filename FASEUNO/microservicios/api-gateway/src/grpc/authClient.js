const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('../proto/auth.proto');
const proto = grpc.loadPackageDefinition(packageDef).auth;

module.exports = new proto.AuthService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

