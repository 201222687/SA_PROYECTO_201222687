const amqp = require('amqplib');

let channel;

async function connectRabbit() {
  try {

    const rabbitUrl = process.env.RABBIT_URL || 'amqp://localhost';

    const connection = await amqp.connect(rabbitUrl);

    channel = await connection.createChannel();

    const queue = 'orden_creada';

    await channel.assertQueue(queue, {
      durable: false
    });

    console.log("🐰 Conectado a RabbitMQ en:", rabbitUrl);

    console.log("🐰 Conectado a RabbitMQ");

  } catch (error) {
    console.error("Error conectando a RabbitMQ:", error);
  }
}

function getChannel() {
  return channel;
}

module.exports = { connectRabbit, getChannel };