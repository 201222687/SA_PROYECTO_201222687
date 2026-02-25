// =============================
// IMPORTACIONES
// =============================
const express = require("express");
const router = express.Router();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const jwt = require("jsonwebtoken");


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

const CATALOG_HOST = process.env.CATALOG_HOST || "localhost:50052";

const client = new catalogProto.CatalogService(
  CATALOG_HOST,
  grpc.credentials.createInsecure()
);


// =============================
// MIDDLEWARE AUTORIZACIÓN RESTAURANTE
// =============================
function authorizeRestaurant(req, res, next) {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Token de autorización requerido"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Formato de token inválido"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.rol !== "RESTAURANTE") {
      return res.status(403).json({
        error: "Acceso solo para restaurantes"
      });
    }

    req.user = decoded;

    next();

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    }

    return res.status(500).json({
      error: "Error validando token"
    });
  }
}


// =============================
// GET MENU ITEMS
// =============================
router.get("/", (req, res) => {

  client.GetMenuItems({}, (error, response) => {

    if (error) {
      console.error("Error obteniendo menú:", error);
      return res.status(500).json({ error: "Error obteniendo menú" });
    }

    res.json(response);
  });
});


// =============================
// GET MENU ITEMS POR RESTAURANTE
// =============================
router.get("/restaurant/:id", (req, res) => {

  const id_restaurante = parseInt(req.params.id);

  client.GetMenuItemsByRestaurant(
    { id_restaurante },
    (error, response) => {

      if (error) {
        console.error("Error obteniendo menú por restaurante:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json(response);
    }
  );
});


// =============================
// CREAR MENU ITEM
// =============================
router.post("/", authorizeRestaurant, (req, res) => {

  const { id_restaurante, nombre, precio, disponible } = req.body;

  client.CreateMenuItem(
    { id_restaurante, nombre, precio, disponible },
    (error, response) => {

      if (error) {
        console.error("Error creando item:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json(response);
    }
  );
});


// =============================
// ACTUALIZAR MENU ITEM
// =============================
router.put("/:id", authorizeRestaurant, (req, res) => {

  const id_item = parseInt(req.params.id);
  const { nombre, precio, disponible } = req.body;

  client.UpdateMenuItem(
    { id_item, nombre, precio, disponible },
    (error, response) => {

      if (error) {
        console.error("Error actualizando item:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json(response);
    }
  );
});


// =============================
// ELIMINAR MENU ITEM
// =============================
router.delete("/:id", authorizeRestaurant, (req, res) => {

  const id_item = parseInt(req.params.id);

  client.DeleteMenuItem(
    { id_item },
    (error, response) => {

      if (error) {
        console.error("Error eliminando item:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json(response);
    }
  );
});

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



module.exports = router;
