import dotenv from "dotenv";
dotenv.config();

import { createClient, SCHEMA_FIELD_TYPE } from "redis";

// client is defined via a .env file that isn't uploaded
// to github
const client = createClient({
  url: process.env.REDIS_URL+process.env.REDIS_HOST,
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

const setup = async () => {
  await client.ft.create('account_dat', {
    'username': {
      type: SCHEMA_FIELD_TYPE.TEXT,
    },
    'email': {
      type: SCHEMA_FIELD_TYPE.TEXT,
    },
    'password': {
      type: SCHEMA_FIELD_TYPE.TEXT,
    }
  }, {
    ON: 'HASH',
    PREFIX: 'usr:'
  })
  await client.ft.create('image_dat'), {
    'username': {
      type: SCHEMA_FIELD_TYPE.TEXT,
    },
    'imgdata': {
      type: SCHEMA_FIELD_TYPE.TEXT,
    },
    'filename': {
      type:SCHEMA_FIELD_TYPE.TEXT,
    }
  }, {
    ON: 'HASH',
    PREFIX: 'img:usr:'
  }
}
/*
,
//VectorAlgorithms used in example, imported from @xenova/transformers - used for encryption
//example: https://redis.io/docs/latest/develop/clients/nodejs/vecsearch/
'embedding': {
  type: SCHEMA_FIELD_TYPE.VECTOR,
  TYPE: 'FLOAT32',
  ALGORITHM: VectorAlgorithms.HNSW,
  DISTANCE_METRIC: 'L2',
  DIM: 768,
}
*/

class accessRedis{
  static async addUser(username, HashedPassword,email) {
    await client.hSet(`usr:${username}`,{
      'username': username,
      'email': email,
      'password': HashedPassword
    })
  }
  static async addImage() { //username, file / username, file-content, filename
    const username = arguments[0]
    var imgdata = ''
    var filename = ''
    const imageSet = {
      'username': '',
      'imgdata': '',
      'filename': '',
    }
    if (arguments.length === 3) {//data was passed in
      imgdata = arguments[1]
      filename = arguments[2]
    } else { //file was passed in
      //fs package needed
    }
    imageSet.username = username
    imageSet.imgdata = imgdata
    imageSet.filename = filename
    await client.hSet(`img:usr:${username}`,imageSet)
  }
}

//test functions, accessRedis can only be used after redis connects
accessRedis.addUser('JohnDoe', 'Jane', 'John@outlook.com')
accessRedis.addUser('user1','password1','email1')
accessRedis.addImage('user1', 'placeholder data', 'image.png')
console.log('data added')
