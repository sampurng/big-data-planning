import amqp from "amqplib";

const uri = "amqp://guest:guest@localhost";
import "dotenv/config";

const publisher = {};

const setupRabbitMQ = async () => {
  const connection = await amqp.connect(uri);
  console.log("✅ Connected to RabbitMQ");
  const channel = await connection.createChannel();
  const queue = process.env.RABBIT_MQ_QUEUE;
  await channel.assertQueue(queue, { durable: true });
  console.log("RabbitMQ setup done");

  function publish(operation, data) {
    const message = {
      operation,
      data,
    };
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }

  publisher.publish = publish;
};

export { publisher, setupRabbitMQ };
