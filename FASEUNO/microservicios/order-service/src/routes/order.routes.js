const express = require("express");
const router = express.Router();
const pool = require("../db");
const client = require("../grpc/catalogClient");

// parte de bitacora inicio
const fs = require("fs");
const path = require("path");

// Ruta del archivo de bitácora
//const logPath = path.join(__dirname, "../../ordenexitosafallida.txt");
// Ruta ABSOLUTA a la raíz del proyecto
const logPath = path.join(process.cwd(), "ordenexitosafallida.txt");

// Función para escribir en archivo
//function escribirLog(contenido) {
//  fs.appendFileSync(logPath, contenido + "\n");
//}
// Función para escribir
function escribirLog(contenido) {
  fs.appendFileSync(logPath, contenido + "\n", { encoding: "utf8" });
}

// parte de bitacora fin

router.post("/orden", async (req, res) => {

  const fecha = new Date().toISOString();
  let log = "========================================\n";
  log += "NUEVA SOLICITUD DE ORDEN\n";
  log += `Fecha: ${fecha}\n`;


  try {

    // parte de bitacora inicio   
    console.log("========================================");
    console.log("NUEVA SOLICITUD DE ORDEN");
    console.log("Fecha:", fecha);
    // parte de bitacora fin

    const { id_cliente, id_restaurante, items } = req.body;

    if (!id_cliente || !id_restaurante || !items || items.length === 0) {      
      // parte de bitacora inicio
      console.log("Estado Final: DATOS INCOMPLETOS");
      console.log("========================================");
      log += "Estado Final: DATOS INCOMPLETOS\n";
      log += "========================================\n";
      escribirLog(log);
      // parte de bitacora final
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const itemsTransformados = items.map(item => ({
      id_item: item.id_item || item.id,
      cantidad: item.cantidad,
      precio_cliente: item.precio_cliente || item.precio
    }));

    /*
    console.log("[Order-Service] Enviando a catálogo:", {
      id_restaurante,
      items: itemsTransformados
    });
    */
    console.log("[Order-Service] Enviando a catálogo:");
    console.log("Cliente:", id_cliente);
    console.log("Restaurante:", id_restaurante);
    console.log("Items enviados:", JSON.stringify(itemsTransformados));

    log += `Cliente: ${id_cliente}\n`;
    log += `Restaurante: ${id_restaurante}\n`;
    log += `Items enviados: ${JSON.stringify(itemsTransformados)}\n`;

     // =============================
    // LLAMADA gRPC A CATALOG
    // =============================
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

  console.log("Resultado Validación gRPC:", response.valido ? "EXITOSA" : "FALLIDA");
  console.log("Mensaje Validación:", response.mensaje);
   
  log += `Resultado Validación gRPC: ${response.valido ? "EXITOSA" : "FALLIDA"}\n`;
  log += `Mensaje Validación: ${response.mensaje}\n`;


    if (!response.valido) {
      console.log("Estado Final: ORDEN RECHAZADA");
      console.log("========================================");
      log += "Estado Final: ORDEN RECHAZADA\n";
      log += "========================================\n";
      escribirLog(log);
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

    console.log("Estado Final: ORDEN CREADA");
    console.log("ID Orden:", id_orden);
    console.log("========================================");

    log += "Estado Final: ORDEN CREADA\n";
    log += `ID Orden: ${id_orden}\n`;
    log += "========================================\n";
    escribirLog(log);

    return res.status(201).json({
      mensaje: "Orden creada correctamente",
      id_orden
    });

  } catch (error) {
    console.error("[Order-Service] Error:", error);

    console.error("ERROR INTERNO:", error.message);
    console.log("Estado Final: ERROR INTERNO");
    console.log("========================================");

    log += `ERROR INTERNO: ${error.message}\n`;
    log += "Estado Final: ERROR INTERNO\n";
    log += "========================================\n";
    escribirLog(log);

    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
