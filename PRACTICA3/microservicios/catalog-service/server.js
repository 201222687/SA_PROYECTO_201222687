require("dotenv").config();

const startCatalogServer = require("./src/grpc/catalogServer");

console.log("🚀 Iniciando Catalog-Service...");
startCatalogServer();
