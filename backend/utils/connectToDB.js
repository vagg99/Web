const { MongoClient } = require('mongodb');
const cache = require('./cache.js');
const { TTLS } = require('./constants.js');

const mongoURI = "mongodb+srv://webproject7:HVHDmG6eK2nuq9rM@cluster0.03czzuj.mongodb.net/?retryWrites=true&w=majority";

async function connectToDatabase(collectionName) {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client.db('website7').collection(collectionName)
}
async function getData(collectionName){
  const cachedCollection = await cache.get(collectionName);
  if (cachedCollection) { return cachedCollection; }
  // else
  const collection = await connectToDatabase(collectionName);
  const data = await collection.find({}).toArray();
  cache.set(collectionName, data, TTLS);
  return data;
}

module.exports = {
    connectToDatabase,
    getData
}