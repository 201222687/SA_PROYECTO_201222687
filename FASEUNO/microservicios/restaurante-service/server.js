const amqp = require("amqplib");

const QUEUE = "orden_creada";
const RABBIT_URL = "amqp://localhost:5672";

async function startServer() {
  try {
    console.log("🚀 Iniciando Restaurant-Service...");

    const connection = await amqp.connect(RABBIT_URL);
    const channel = await connection.createChannel();

    // ⚠️ IMPORTANTE: durable debe coincidir con Order-Service
    await channel.assertQueue(QUEUE, { durable: false });

    console.log("🍽️ Restaurant-Service escuchando órdenes...");

    channel.consume(
      QUEUE,
      async (msg) => {
        if (!msg) return;

        try {
          const content = msg.content.toString();
          const orden = JSON.parse(content);

          console.log("📦 Orden recibida:");
          console.log(orden);

          await procesarOrden(orden);

          // Confirmamos mensaje manualmente
          channel.ack(msg);

        } catch (error) {
          console.error("❌ Error procesando orden:", error);

          // Rechazamos mensaje sin reencolar
          channel.nack(msg, false, false);
        }
      },
      {
        noAck: false // Confirmación manual
      }
    );

  } catch (error) {
    console.error("❌ Error conectando a RabbitMQ:", error);
  }
}

async function procesarOrden(orden) {
  console.log("👨‍🍳 Procesando orden...");
  
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log(`✅ Orden procesada correctamente\n`);
}

startServer();