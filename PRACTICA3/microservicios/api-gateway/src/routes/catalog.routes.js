// =============================
// IMPORTACIONES
// =============================
const express = require("express");
const router = express.Router();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

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
// CREAR CLIENTE gRPC
// =============================

// IMPORTANTE:
// En docker-compose debes tener:
// CATALOG_HOST=catalog-service:50052

const CATALOG_HOST = process.env.CATALOG_HOST || 'localhost:50052';

const client = new catalogProto.CatalogService(
  process.env.CATALOG_HOST,
  grpc.credentials.createInsecure()
);

// =============================
// GET RESTAURANTES
// =============================
router.get("/restaurants", (req, res) => {

  client.GetRestaurants({}, (error, response) => {

    if (error) {
      console.error("Error obteniendo restaurantes:", error);
      return res.status(500).json({ error: "Error obteniendo restaurantes" });
    }

    res.json(response);
  });
});

// =============================
// GET MENU ITEMS
// =============================
router.get("/menu-items", (req, res) => {

  client.GetMenuItems({}, (error, response) => {

    if (error) {
      console.error("Error obteniendo menú:", error);
      return res.status(500).json({ error: "Error obteniendo menú" });
    }

    res.json(response);
  });
});

module.exports = router;
