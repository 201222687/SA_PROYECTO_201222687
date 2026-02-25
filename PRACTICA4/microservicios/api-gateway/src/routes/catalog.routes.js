// =============================
// IMPORTACIONES
// =============================
const express = require("express");
const router = express.Router();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const jwt = require('jsonwebtoken');

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
// MIDDLEWARE AUTORIZACIÓN ADMIN
// =============================
function authorizeAdmin(req, res, next) {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de autorización requerido'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.rol !== 'ADMIN') {
      return res.status(403).json({
        error: 'Acceso solo para administradores'
      });
    }

    req.user = decoded;

    next();

  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    return res.status(500).json({
      error: 'Error validando token'
    });
  }
}

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



// =============================
// GET MENU ITEMS POR ID DE RESTAURANTE
// =============================

router.get("/menu-items/:id", (req, res) => {

  const id_restaurante = parseInt(req.params.id);

  client.GetMenuItemsByRestaurant(
    { id_restaurante },
    (error, response) => {

      if (error) {
        console.error("Error gRPC:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json(response);
    }
  );
});

// =============================
// CREAR RESTAURANTE (NUEVO)
// =============================
router.post("/restaurants", authorizeAdmin,(req, res) => {

  const { nombre, direccion, activo } = req.body;

  client.CreateRestaurant(
    { nombre, direccion, activo },
    (error, response) => {

      if (error) {
        console.error("Error creando restaurante:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json(response);
    }
  );
});

// =============================
// ACTUALIZAR RESTAURANTE (NUEVO)
// =============================
router.put("/restaurants/:id",authorizeAdmin, (req, res) => {

  const id_restaurante = parseInt(req.params.id);
  const { nombre, direccion, activo } = req.body;

  client.UpdateRestaurant(
    { id_restaurante, nombre, direccion, activo },
    (error, response) => {

      if (error) {
        console.error("Error actualizando restaurante:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json(response);
    }
  );
});

// =============================
// ELIMINAR RESTAURANTE (NUEVO)
// =============================
router.delete("/restaurants/:id",authorizeAdmin, (req, res) => {

  const id_restaurante = parseInt(req.params.id);

  client.DeleteRestaurant(
    { id_restaurante },
    (error, response) => {

      if (error) {
        console.error("Error eliminando restaurante:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json(response);
    }
  );
});


module.exports = router;
