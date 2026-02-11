// =============================
// IMPORTACIONES
// =============================
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
require("dotenv").config(); // Cargar variables de entorno

// Importar pool de base de datos
const pool = require("./src/db");

// =============================
// CARGAR ARCHIVO PROTO
// =============================
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "../proto/catalog.proto"), // Ruta correcta
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
// FUNCIÓN PRINCIPAL DE VALIDACIÓN
// =============================
async function ValidateOrder(call, callback) {

  const { id_restaurante, items } = call.request;

  
  

  try {

    console.log("Solicitud recibida:", call.request);

    console.log("Items recibidos:", items);

    for (const item of items) {

      // Consultar producto en la base de datos
      const [rows] = await pool.query(
        `SELECT * FROM menu_items 
         WHERE id_item = ? 
         AND id_restaurante = ?`,
        [item.id_item, id_restaurante]
      );

      // Validar existencia y pertenencia
      if (rows.length === 0) {
        return callback(null, {
          valido: false,
          mensaje: `Producto ${item.id_item} no pertenece al restaurante`
        });
      }

      const producto = rows[0];

      // Validar disponibilidad
      if (!producto.disponible) {
        return callback(null, {
          valido: false,
          mensaje: `Producto ${item.id_item} no disponible`
        });
      }

      // Validar precio (convertimos ambos a float por seguridad)
      if (parseFloat(producto.precio) !== parseFloat(item.precio_cliente)) {
        return callback(null, {
          valido: false,
          mensaje: `Precio incorrecto para producto ${item.id_item}`
        });
      }
    }

    // Si todo es correcto
    return callback(null, {
      valido: true,
      mensaje: "Validación exitosa"
    });

  } catch (error) {

    console.error("Error en validación:", error);

    return callback(null, {
      valido: false,
      mensaje: "Error interno en catálogo"
    });
  }
}

// =============================
// CREAR SERVIDOR gRPC
// =============================
const server = new grpc.Server();

server.addService(catalogProto.CatalogService.service, {
  ValidateOrder
});

// =============================
// INICIAR SERVIDOR
// =============================
server.bindAsync(
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("✅ Catalog-Service gRPC corriendo en puerto 50052");
    server.start();
  }
);
