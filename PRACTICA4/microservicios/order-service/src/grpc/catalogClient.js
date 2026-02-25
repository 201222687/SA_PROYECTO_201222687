const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
require("dotenv").config();

// =============================
// CARGAR PROTO
// =============================
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

// =============================
// CONFIGURAR HOST DINÁMICO
// =============================

// Si está en Docker → usa nombre del servicio
// Si está local → usa localhost

const CATALOG_HOST =
  process.env.CATALOG_HOST || "localhost:50052";

console.log("[Order-Service] Conectando a:", CATALOG_HOST);

// =============================
// CREAR CLIENTE gRPC
// =============================
const client = new catalogProto.CatalogService(
  CATALOG_HOST,
  grpc.credentials.createInsecure()
);

module.exports = client;
