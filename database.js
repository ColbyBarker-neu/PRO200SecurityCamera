import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

// client is defined via a .env file that isn't uploaded
// to githun
const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: false,
    servername: process.env.REDIS_HOST,
  },
});

client.on("error", (err) => {
  console.error("Redis Error:", err);
});

await client.connect();
console.log("connected to redis!")//not needed

class accessRedis{
  //prototyping
  // not sure if this will even work
  static async addImage(userTag, Imgdata) {
    await client.set(userTag, Imgdata)
    // not a secure way to store
    // assumes images will be passed in as a string format
  }
}

//test function, accessRedis can only be used after redis connects
accessRedis.addImage('user1','placeholder image data')
