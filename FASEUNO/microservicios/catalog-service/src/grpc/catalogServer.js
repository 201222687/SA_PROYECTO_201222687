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
// OBTENER RESTAURANTES
// =============================
async function GetRestaurants(call, callback) {
  try {

    const [rows] = await pool.query("SELECT * FROM restaurantes");

    return callback(null, {
      restaurants: rows
    });

  } catch (error) {

    console.error("[Catalog-Service] Error obteniendo restaurantes:", error);

    return callback({
      code: grpc.status.INTERNAL,
      message: "Error obteniendo restaurantes"
    });
  }
}

// =============================
// OBTENER MENU ITEMS
// =============================
async function GetMenuItems(call, callback) {

  console.log("[Catalog-Service] Solicitud de menú");
  
  try {

    const [rows] = await pool.query("SELECT * FROM menu_items");

    return callback(null, {
      menuItems: rows
    });

  } catch (error) {

    console.error("[Catalog-Service] Error obteniendo menu items:", error);

    return callback({
      code: grpc.status.INTERNAL,
      message: "Error obteniendo menu items"
    });
  }
}

// =============================
// OBTENER MENU ITEMS POR RESTAURANTE
// =============================
async function GetMenuItemsByRestaurant(call, callback) {

  const { id_restaurante } = call.request;

  console.log("[Catalog-Service] Menú solicitado para restaurante:", id_restaurante);

  try {

    const [rows] = await pool.query(
      `SELECT * FROM menu_items 
       WHERE id_restaurante = ?`,
      [id_restaurante]
    );

    return callback(null, {
      menuItems: rows
    });

  } catch (error) {

    console.error("[Catalog-Service] Error obteniendo menú por restaurante:", error);

    return callback({
      code: grpc.status.INTERNAL,
      message: "Error obteniendo menu items por restaurante"
    });
  }
}

// =============================
// CREAR RESTAURANTE
// =============================
async function CreateRestaurant(call, callback) {

  const { nombre, direccion, activo } = call.request;

  try {

    if (!nombre) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "El nombre es obligatorio"
      });
    }

    await pool.query(
      `INSERT INTO restaurantes (nombre, direccion, activo)
       VALUES (?, ?, ?)`,
      [nombre, direccion || null, activo]
    );

    return callback(null, {
      mensaje: "Restaurante creado correctamente"
    });

  } catch (error) {

    console.error("[Catalog-Service] Error creando restaurante:", error);

    return callback({
      code: grpc.status.INTERNAL,
      message: "Error creando restaurante"
    });
  }
}


// =============================
// ACTUALIZAR RESTAURANTE
// =============================
async function UpdateRestaurant(call, callback) {

  const { id_restaurante, nombre, direccion, activo } = call.request;

  try {

    const [result] = await pool.query(
      `UPDATE restaurantes
       SET nombre = ?, direccion = ?, activo = ?
       WHERE id_restaurante = ?`,
      [nombre, direccion || null, activo, id_restaurante]
    );

    if (result.affectedRows === 0) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Restaurante no encontrado"
      });
    }

    return callback(null, {
      mensaje: "Restaurante actualizado correctamente"
    });

  } catch (error) {

    console.error("[Catalog-Service] Error actualizando restaurante:", error);

    return callback({
      code: grpc.status.INTERNAL,
      message: "Error actualizando restaurante"
    });
  }
}

// =============================
// ELIMINAR RESTAURANTE
// =============================
async function DeleteRestaurant(call, callback) {

  const { id_restaurante } = call.request;

  try {

    const [result] = await pool.query(
      `DELETE FROM restaurantes WHERE id_restaurante = ?`,
      [id_restaurante]
    );

    if (result.affectedRows === 0) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Restaurante no encontrado"
      });
    }

    return callback(null, {
      mensaje: "Restaurante eliminado correctamente"
    });

  } catch (error) {

    console.error("[Catalog-Service] Error eliminando restaurante:", error);

    return callback({
      code: grpc.status.INTERNAL,
      message: "Error eliminando restaurante"
    });
  }
}


// =============================
// FUNCIÓN PARA CREAR SERVIDOR
// =============================
function startCatalogServer() {

  const server = new grpc.Server();

  server.addService(catalogProto.CatalogService.service, {
    ValidateOrder,
    GetRestaurants,
    GetMenuItems,
    GetMenuItemsByRestaurant,
    CreateRestaurant,
    UpdateRestaurant,
    DeleteRestaurant
  });

  server.bindAsync(
    "0.0.0.0:50052",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("Catalog-Service gRPC corriendo en puerto 50052");
      server.start();
    }
  );
}

module.exports = startCatalogServer;
