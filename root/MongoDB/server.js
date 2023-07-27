const express = require('express');
const { MongoClient } = require('mongodb'); // DATABASE
const cron = require("node-cron"); // EVERY MONTH UPDATE SERVER TOKENS AND DISTRIBUTE THEM TO USERS
const jsSHA = require("jssha");// ENCRYPT USER PASSWORDS
const cors = require('cors');// USED FOR HTTPS CONNECTIONS

const app = express();

//cron.schedule("0 0 0 1 * *", distributeTokens); // EVERY MONTH

cron.schedule("*/15 * * * * *", distributeTokens); // EVERY 15 SECONDS FOR TESTING

app.use(cors());

const port = 3000;

const mongoURI = "mongodb+srv://webproject7:HVHDmG6eK2nuq9rM@cluster0.03czzuj.mongodb.net/?retryWrites=true&w=majority";

async function connectToDatabase() {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client.db('website7').collection('users'); // Replace 'your_database_name' with the actual name of your database and collection
}

async function getRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk.toString();
    });
    request.on('end', () => {
      resolve(body);
    });
    request.on('error', (error) => {
      reject(error);
    });
  });
}

async function registerUser(username, tokens, points, email, password, isAdmin) {
  const collection = await connectToDatabase();
  let password_hashed = hash(username,password);
  const userData = { username, tokens, points, email, password_hashed, isAdmin };
  const result = await collection.insertOne(userData);
  if (result.insertedCount === 1) {
    return 'User registered successfully!';
  } else {
    throw new Error('Failed to register user.');
  }
}

// Add a new route to handle the registration data
async function handleRegistration(req, res) {
  if (req.method === 'POST' && req.url === '/register') {
    try {
      const body = await getRequestBody(req);
      const { username, tokens, points, email, password, isAdmin } = JSON.parse(body);

      // Call the registerUser function to store the user data
      const message = await registerUser(username, tokens, points, email, password, isAdmin);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
}

// for encrypting passwords
function hash(username,password) {
  let Obj = new jsSHA("SHA-256", "TEXT", username);
  Obj.update(password);
  return Obj.getHash("HEX");
}

async function distributeTokens() {
  const {users, collection} = getUsers();
  ApothematikoTokens = 0;
  TotalPoints = 0;
  for (let i = 0; i < users.length; i++) {
    ApothematikoTokens += users[i].tokens["monthly"];
    TotalPoints += users[i].points["monthly"];
  }
  for (let i = 0; i < users.length; i++) {
    users[i].tokens["monthly"] = Math.round(Apothematiko * users[i].points["monthly"] / points);
    users[i].tokens["total"] += users[i].tokens["monthly"];
    users[i].points["total"] += users[i].points["monthly"];
    users[i].points["monthly"] = 0;
  }
  await updateDatabase(users,collection);
}

async function getUsers() {
  const collection = await connectToDatabase();
  const users = await collection.find({}).toArray();
  return users,collection;
}

async function updateDatabase(users,collection) {
  const updateOperations = users.map(user => ({
    updateOne: {
      filter: { _id: user._id },
      update: { $set: { points: user.points , tokens: user.tokens } },
    },
  }));
  await collection.bulkWrite(updateOperations);
}

// GET request for fetching users
app.get('/users', async (req, res) => {
  try {
    const {users, collection} = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST request for registration
app.post('/register', handleRegistration);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
