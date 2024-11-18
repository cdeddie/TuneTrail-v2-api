import { createClient } from "redis";

const redisClient = createClient(); // IN PROD, this needs some args or something

redisClient.on('error', (err) => {
  console.error('Redis Client Error: ', err);
});

(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

export default redisClient;