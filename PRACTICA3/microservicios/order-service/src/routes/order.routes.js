const express = require("express");
const router = express.Router();
const pool = require("../db");
const client = require("../grpc/catalogClient");

router.post("/orden", async (req, res) => {

  try {
    const { id_cliente, id_restaurante, items } = req.body;

    if (!id_cliente || !id_restaurante || !items || items.length === 0) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const itemsTransformados = items.map(item => ({
      id_item: item.id_item || item.id,
      cantidad: item.cantidad,
      precio_cliente: item.precio_cliente || item.precio
    }));

    console.log("[Order-Service] Enviando a catálogo:", {
      id_restaurante,
      items: itemsTransformados
    });

    // Convertimos gRPC en Promise para usar async/await limpio
    const response = await new Promise((resolve, reject) => {
      client.ValidateOrder(
        { id_restaurante, items: itemsTransformados },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });

    if (!response.valido) {
      return res.status(400).json({ error: response.mensaje });
    }

    // =============================
    // CALCULAR TOTAL
    // =============================
    const total = itemsTransformados.reduce((sum, item) =>
      sum + (item.precio_cliente * item.cantidad), 0
    );

    // =============================
    // INSERTAR ORDEN
    // =============================
    const [ordenResult] = await pool.query(
      `INSERT INTO ordenes 
       (id_cliente, id_restaurante, estado, total)
       VALUES (?, ?, 'CREADA', ?)`,
      [id_cliente, id_restaurante, total]
    );

    const id_orden = ordenResult.insertId;

    // =============================
    // INSERTAR DETALLE DE ORDEN
    // =============================
    for (const item of itemsTransformados) {
      await pool.query(
        `INSERT INTO orden_detalle 
         (id_orden, id_item, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [id_orden, item.id_item, item.cantidad, item.precio_cliente]
      );
    }

    console.log("[Order-Service] Orden creada correctamente");

    return res.status(201).json({
      mensaje: "Orden creada correctamente",
      id_orden
    });

  } catch (error) {
    console.error("[Order-Service] Error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
