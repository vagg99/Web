const { MongoClient } = require('mongodb');
const jsSHA = require("jssha");
const express = require('express');
const cors = require('cors');

const app = express();

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

async function registerUser(username, email, password) {
  const collection = await connectToDatabase();
  let password_hashed = hash(password);
  // για unhashed password κανε const userData = { username, email, password };
  const userData = { username, email, password_hashed };
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
      const { username, email, password } = JSON.parse(body);

      // Call the registerUser function to store the user data
      const message = await registerUser(username, email, password);

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
function hash(password) {
  let Obj = new jsSHA("SHA-256", "TEXT", "Nektarios");
  Obj.update(password);
  return Obj.getHash("HEX");
}

async function getUsers() {
  const collection = await connectToDatabase();
  const users = await collection.find({}).toArray();
  return users;
}

// GET request for fetching users
app.get('/users', async (req, res) => {
  try {
    const users = await getUsers();
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
