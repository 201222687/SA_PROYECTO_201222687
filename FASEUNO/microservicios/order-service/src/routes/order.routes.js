const express = require("express");
const router = express.Router();
const pool = require("../db");
const client = require("../grpc/catalogClient");
const authClient = require('../grpc/authClient');
const { getChannel } = require("../messaging/rabbitmq");


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

    // =============================
// PUBLICAR EVENTO A RABBITMQ
// =============================
const channel = getChannel();

const evento = {
  id_orden,
  id_cliente,
  id_restaurante,
  total,
  estado: "CREADA",
  fecha: new Date().toISOString()
};

channel.sendToQueue(
  "orden_creada",
  Buffer.from(JSON.stringify(evento)),
  { persistent: true }
);

console.log("📤 Evento enviado a RabbitMQ:", evento);
// ********************************************************

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

router.get('/orden/mis-ordenes/:id_cliente', async (req, res) => {
  try {

    const { id_cliente } = req.params;

    const [ordenes] = await pool.query(
      'SELECT * FROM ordenes WHERE id_cliente = ? ORDER BY fecha_creacion DESC',
      [id_cliente]
    );

    for (let orden of ordenes) {

      const [detalle] = await pool.query(
        'SELECT * FROM orden_detalle WHERE id_orden = ?',
        [orden.id_orden]
      );

      // LLAMADA gRPC A CATALOG PARA ENRIQUECER DATOS
    
     const catalogData = await new Promise((resolve, reject) => {
  client.GetOrderDetails(
    {
      id_restaurante: orden.id_restaurante,
      id_items: detalle.map(d => d.id_item)
    },
    (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }
  );
});

      // Restaurante completo (según proto nuevo)
orden.restaurante = catalogData.restaurant;

// unir nombre producto con detalle
orden.detalle = detalle.map(d => {

  const productoInfo = catalogData.items.find(
    p => p.id_item === d.id_item
  );

  return {
    ...d,
    nombre_producto: productoInfo?.nombre || "Desconocido"
  };
});


    }

    res.json(ordenes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo órdenes' });
  }
});



router.put('/orden/:id_orden/estado', async (req, res) => {
  try {

    const { id_orden } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['CREADA','EN_PROCESO','FINALIZADA','RECHAZADA','CANCELADA'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido'
      });
    }


    // 1️⃣ Obtener estado actual
    const [ordenActual] = await pool.query(
      'SELECT estado, id_cliente FROM ordenes WHERE id_orden = ?',
      [id_orden]
    );

    if (ordenActual.length === 0) {
      return res.status(404).json({
        error: 'Orden no encontrada'
      });
    }
   
    const estadoActual = ordenActual[0].estado;
    const idClienteOrden = ordenActual[0].id_cliente;

    console.log("ESTADO ACTUAL:", estadoActual);
    console.log("ESTADO SOLICITADO:", estado);


    // 2️⃣ Validar transiciones permitidas
    const transicionesPermitidas = {
      CREADA: ['EN_PROCESO', 'RECHAZADA','CANCELADA'],
      EN_PROCESO: ['FINALIZADA'],
      FINALIZADA: [],
      RECHAZADA: [],
      CANCELADA: []
    };

    if (!transicionesPermitidas[estadoActual].includes(estado)) {
      return res.status(400).json({
        error: `No se puede cambiar de ${estadoActual} a ${estado}`
      });
    }

// 3️⃣ Validar permisos según rol (si el gateway envía rol e id)
    const { rol, id_usuario } = req.headers; 
    // Esto depende de cómo reenvíes los datos desde el Gateway

    

console.log("ROL RECIBIDO:", rol);
console.log("ID_USUARIO RECIBIDO:", id_usuario);


    // CLIENTE solo puede cancelar su propia orden
    if (rol === 'CLIENTE') {

      if (estado !== 'CANCELADA') {
        return res.status(403).json({
          error: 'El cliente solo puede cancelar órdenes'
        });
      }

      if (parseInt(id_usuario) !== idClienteOrden) {
        return res.status(403).json({
          error: 'No puedes modificar esta orden'
        });
      }
    }


    // 3️⃣ Actualizar
    await pool.query(
      'UPDATE ordenes SET estado = ? WHERE id_orden = ?',
      [estado, id_orden]
    );

    res.json({
      mensaje: 'Estado actualizado correctamente'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});


router.get('/restaurante/:id', async (req, res) => {
  try {
    const id_restaurante = req.params.id;

    const [ordenes] = await pool.query(
      "SELECT * FROM ordenes WHERE id_restaurante = ? AND estado = 'CREADA'",
      [id_restaurante]
    );

    const ordenesEnriquecidas = [];

    for (let orden of ordenes) {

      const cliente = await new Promise((resolve, reject) => {
        authClient.GetUserById(
          { id_usuario: orden.id_cliente },
          (err, response) => {
            if (err) return reject(err);
            resolve(response);
          }
        );
      });

      ordenesEnriquecidas.push({
        ...orden,
        cliente
      });
    }

    res.json(ordenesEnriquecidas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



router.get('/orden/restaurante2/:id_restaurante', async (req, res) => {
  try {

    const { id_restaurante } = req.params;

    // Traer órdenes
    const [ordenes] = await pool.query(
      'SELECT * FROM ordenes WHERE id_restaurante = ? ORDER BY fecha_creacion DESC',
      [id_restaurante]
    );

    if (ordenes.length === 0) {
      return res.json([]);
    }

    // Traer TODOS los detalles
    const idsOrdenes = ordenes.map(o => o.id_orden);

    const [detalles] = await pool.query(
      'SELECT * FROM orden_detalle WHERE id_orden IN (?)',
      [idsOrdenes]
    );

    //  Obtener id_items únicos
    const idsItems = [...new Set(detalles.map(d => d.id_item))];

    //  UNA sola llamada gRPC
    const catalogData = await new Promise((resolve, reject) => {
      client.GetOrderDetails(
        {
          id_restaurante: parseInt(id_restaurante),
          id_items: idsItems
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });

    // 5️⃣ Crear mapa de productos
    const itemsMap = {};
    catalogData.items.forEach(item => {
      itemsMap[item.id_item] = item.nombre;
    });

    // 6️⃣ Agrupar detalles por orden
    const detallesPorOrden = {};

    detalles.forEach(d => {
      if (!detallesPorOrden[d.id_orden]) {
        detallesPorOrden[d.id_orden] = [];
      }

      detallesPorOrden[d.id_orden].push({
        ...d,
        nombre_producto: itemsMap[d.id_item] || "Desconocido"
      });
    });

    // 7️⃣ Armar respuesta final
    const resultado = ordenes.map(o => ({
      ...o,
      restaurante: catalogData.restaurant,
      detalle: detallesPorOrden[o.id_orden] || []
    }));

    res.json(resultado);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo órdenes del restaurante' });
  }
});
module.exports = router;
