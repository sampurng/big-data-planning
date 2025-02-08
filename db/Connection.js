import "dotenv/config";
import redis from "redis";

const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST;

const redisClient = redis.createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
});

const Database = {
  redisDb: undefined,
};

export const connectToRedis = async () => {
  try {
    const rc = await redisClient.connect();
    Database.redisDb = rc;
    console.info("Connected to client Sucessfully");
  } catch (error) {
    console.error("error in connecting to client", error);
  }
};

// module.exports = connectToRedis;
// module.exports = Database;

export default Database;
