// index.js
import express from "express";
import "dotenv/config";
import planRouter from "./routes/Plan.js";
import { connectToRedis } from "./db/Connection.js";
import { setupRabbitMQ } from "./rabbitmq/publisher.js";
// import process from "process";
const PORT = process.env.APPLICATION_PORT;
const HOST = process.env.APPLICATION_HOST;

const init = async () => {
  await connectToRedis();
  setupRabbitMQ();
  const app = express();
  app.set("etag", false);

  app.get("/", (req, res) => {
    res.send("Hello, World!");
  });
  app.use(express.json()); // Parse JSON request body
  app.use(express.urlencoded({ extended: true })); // Parse form data
  app.use("/plan", planRouter);

  app.all("*", async (req, res) => {
    return res.status(404).send();
  });

  app.listen(PORT, () => {
    console.log(`Server listening at http://${HOST}:${PORT}`);
  });
};

init();
