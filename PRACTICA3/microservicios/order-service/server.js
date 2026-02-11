require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

// Importar rutas
const orderRoutes = require("./src/routes/order.routes");
app.use("/", orderRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 Order-Service corriendo en puerto ${PORT}`);
});

/*
// =============================
// IMPORTACIONES
// =============================
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const client = require("./src/grpc/catalogClient");


// =============================
// CONFIGURACIÓN EXPRESS
// =============================
const app = express();
app.use(express.json());

// =============================
// CONEXIÓN BASE DE DATOS (order_db)
// =============================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// =============================
// ENDPOINT CREAR ORDEN
// =============================
app.post("/orden", async (req, res) => {
  try {
    const { id_cliente, id_restaurante, items } = req.body;

    // Validaciones básicas
    if (!id_cliente || !id_restaurante || !items || items.length === 0) {
      return res.status(400).json({
        error: "Datos incompletos"
      });
    }

    // =============================
    // TRANSFORMAR ITEMS AL FORMATO PROTO
    // =============================
    const itemsTransformados = items.map(item => ({
      id_item: item.id_item || item.id,
      cantidad: item.cantidad,
      precio_cliente: item.precio_cliente || item.precio
    }));

    console.log("Enviando a catálogo:", {
      id_restaurante,
      items: itemsTransformados
    });

    // =============================
    // LLAMADA gRPC A CATALOG-SERVICE
    // =============================
    client.ValidateOrder(
      {
        id_restaurante,
        items: itemsTransformados
      },
      async (error, response) => {

        if (error) {
          console.error("Error gRPC:", error);
          return res.status(500).json({
            error: "Error comunicando con catálogo"
          });
        }

        // Si catálogo rechaza la orden
        if (!response.valido) {
          return res.status(400).json({
            error: response.mensaje
          });
        }

        // =============================
        // CALCULAR TOTAL DE LA ORDEN
        // =============================
        const total = itemsTransformados.reduce((sum, item) => {
          return sum + (item.precio_cliente * item.cantidad);
        }, 0);



        // =============================
        // GUARDAR ORDEN EN BD
        // =============================
        const [result] = await pool.query(
          `INSERT INTO ordenes 
           (id_cliente, id_restaurante, estado, total) 
           VALUES (?, ?, 'CREADA', ?)`,
          [id_cliente, id_restaurante,total]
        );

        return res.status(201).json({
          mensaje: "Orden creada correctamente",
          id_orden: result.insertId
        });
      }
    );

  } catch (error) {
    console.error("Error interno:", error);
    return res.status(500).json({
      error: "Error interno del servidor"
    });
  }
});

// =============================
// INICIAR SERVIDOR
// =============================
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Order-Service corriendo en puerto ${PORT}`);
});
*/