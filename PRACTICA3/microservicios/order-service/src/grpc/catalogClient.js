const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Ruta correcta hacia la carpeta raíz /proto
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "../../../proto/catalog.proto"),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const catalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

// Cliente gRPC apuntando al catalog-service
const client = new catalogProto.CatalogService(
  "localhost:50052", // si estás local
  grpc.credentials.createInsecure()
);

module.exports = client;
