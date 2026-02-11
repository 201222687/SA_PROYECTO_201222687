// =============================
// IMPORTACIONES
// =============================
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const pool = require("../db");

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
// LÓGICA DE VALIDACIÓN
// =============================
async function ValidateOrder(call, callback) {

  const { id_restaurante, items } = call.request;

  console.log("[Catalog-Service] Solicitud recibida:", call.request);

  try {

    for (const item of items) {

      const [rows] = await pool.query(
        `SELECT * FROM menu_items 
         WHERE id_item = ? 
         AND id_restaurante = ?`,
        [item.id_item, id_restaurante]
      );

      if (rows.length === 0) {
        return callback(null, {
          valido: false,
          mensaje: `Producto ${item.id_item} no pertenece al restaurante`
        });
      }

      const producto = rows[0];

      if (!producto.disponible) {
        return callback(null, {
          valido: false,
          mensaje: `Producto ${item.id_item} no disponible`
        });
      }

      if (parseFloat(producto.precio) !== parseFloat(item.precio_cliente)) {
        return callback(null, {
          valido: false,
          mensaje: `Precio incorrecto para producto ${item.id_item}`
        });
      }
    }

    return callback(null, {
      valido: true,
      mensaje: "Validación exitosa"
    });

  } catch (error) {

    console.error("[Catalog-Service] Error interno:", error);

    return callback(null, {
      valido: false,
      mensaje: "Error interno en catálogo"
    });
  }
}

// =============================
// FUNCIÓN PARA CREAR SERVIDOR
// =============================
function startCatalogServer() {

  const server = new grpc.Server();

  server.addService(catalogProto.CatalogService.service, {
    ValidateOrder
  });

  server.bindAsync(
    "0.0.0.0:50052",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("✅ Catalog-Service gRPC corriendo en puerto 50052");
      server.start();
    }
  );
}

module.exports = startCatalogServer;
