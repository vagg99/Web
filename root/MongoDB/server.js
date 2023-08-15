const express = require('express');
const { MongoClient } = require('mongodb'); // DATABASE
const cron = require("node-cron"); // EVERY MONTH UPDATE SERVER TOKENS AND DISTRIBUTE THEM TO USERS
const jsSHA = require("jssha");// ENCRYPT USER PASSWORDS
const cors = require('cors');// USED FOR HTTPS CONNECTIONS
const multer = require('multer');// USED FOR UPLOADING FILES
const path = require('path');

const app = express();

cron.schedule("0 0 0 1 * *", distributeTokens); // DISTRIBUTES TOKENS EVERY MONTH

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));

const port = 3000;

const mongoURI = "mongodb+srv://webproject7:HVHDmG6eK2nuq9rM@cluster0.03czzuj.mongodb.net/?retryWrites=true&w=majority";

async function connectToDatabase(collectionName = 'users') {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client.db('website7').collection(collectionName);
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

async function loginUser(username, password) {
  const {users, collection} = await getUsers();
  let password_hashed = hash(username,password);
  for (user in users) {
    if (users[user].username === username && users[user].password_hashed === password_hashed) {
      return 'User logged in successfully!';
    }
  }
  return false;
}

// Add a new route to handle the registration data
async function handleRegistration(req, res) {
  if (req.method === 'POST' && req.url === '/register') {
    try {
      const body = await getRequestBody(req);
      const { username, tokens, points, email, password, isAdmin } = JSON.parse(body);


      const {users, collection} = await getUsers();

      for (user in users) {
        if (users[user].username === username) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Username already exists' }));
          return;
        }
        if (users[user].email === email) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email already exists' }));
          return;
        }
      }

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

async function handleLogin(req, res) {
  if (req.method === 'POST' && req.url === '/login') {
    try {
      const body = await getRequestBody(req);
      const { username, password } = JSON.parse(body);

      // Call the loginUser function to check if the user exists
      const message = await loginUser(username, password);
      
      if (!message){
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Wrong username or password.' }));
        return;
      }

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
  let Obj = new jsSHA("SHA-256", "TEXT", username); // uses the user's username as salt
  Obj.update(password);
  return Obj.getHash("HEX");
}
// Χρήστης : 4) Σύστημα Tokens
async function distributeTokens() {
  console.log(`Monthly Token Distribution ! Distributing tokens to ${users.length} users...`);
  // Χρειαζομαστε και το collection για να κανουμε save τις αλλαγες στη βαση
  const {users, collection} = await getUsers();
  // Υπολογισμός νέων tokens για κάθε χρήστη και μηδενισμός πόντων
  let ApothematikoTokens = 0;
  let TotalPoints = 0;
  for (let i = 0; i < users.length; i++) {
    ApothematikoTokens += users[i].tokens["monthly"];
    TotalPoints += users[i].points["monthly"];
  }
  for (let i = 0; i < users.length; i++) {
    if (TotalPoints) {
      users[i].tokens["monthly"] = Math.round(ApothematikoTokens * users[i].points["monthly"] / TotalPoints);
      users[i].points["monthly"] = 0;
    }
    users[i].tokens["total"] += await users[i].tokens["monthly"];
  }
  // UPDATING MONGODB
  const updateOperations = users.map(user => ({
    updateOne: {
      filter: { _id: user._id },
      update: { $set: { points: user.points , tokens: user.tokens } },
    },
  }));
  await collection.bulkWrite(updateOperations);
}

// Διαχειριστής : 1) Ανέβασμα αρχείου JSON

async function handleFileUploaditems(req, res) { await handleFileUpload("items", req, res); }
async function handleFileUploadstores(req, res) { await handleFileUpload("stores", req, res); }

async function handleFileUpload(collectionName, req, res) {
  const uploadedFile = req.file;

  if (!uploadedFile) {
      return res.status(400).send('No file uploaded.');
  }

  const fileExtension = path.extname(uploadedFile.originalname);
  if (fileExtension !== '.json') {
      return res.status(400).send('Only JSON files are allowed.');
  }

  try {
    const jsonData = JSON.parse(uploadedFile.buffer.toString());

    // Transform jsonData into an array of insert operations
    const insertOperations = jsonData.map(item => ({
      insertOne: {
        document: item
      }
    }));
    
    // Connect to MongoDB
    const collection = await connectToDatabase(collectionName);
    
    // Perform bulkWrite to insert multiple documents at once
    const result = await collection.bulkWrite(insertOperations);
    
    //console.log(`${result.insertedCount} items inserted into collection "${collectionName}"`);

    // Clear the buffer to release memory
    uploadedFile.buffer = null;

    res.send(`File uploaded and processed successfully to collection "${collectionName}". Inserted ${result.insertedCount} items.`);
  } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(400).send('Invalid JSON data.');
  }
}

async function handleDeletionitems(req, res) { await handleDeletion("items", req, res); }
async function handleDeletionstores(req, res) { await handleDeletion("stores", req, res); }

async function handleDeletion(collectionName, req, res) {
  try {
    const collection = await connectToDatabase(collectionName);
    const result = await collection.deleteMany({});
    res.status(200).json(`Deleted ${result.deletedCount} ${collectionName}.`);
  } catch (error) {
    console.error(`Error deleting ${collectionName}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Διαχειριστής : 4) Απεικόνιση Leaderboard
async function getLeaderboard() {
  const {users, collection} = await getUsers();
  let leaderboard = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].points && users[i].tokens) {
      leaderboard.push({
        username: users[i].username,
        points : users[i].points["total"],
        tokens: users[i].tokens
      });
    }
  }
  leaderboard.sort((a,b) => b.points - a.points);
  return leaderboard;
}

async function getUsers() {
  const collection = await connectToDatabase();
  const users = await collection.find({}).toArray();
  return {users,collection};
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

// POST request for login
app.post('/login', handleLogin);

// GET request for leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST request for uploading files to items collection by admin
app.post('/upload-items', upload.single('jsonFile'), handleFileUploaditems);

// POST request for uploading files to stores collection by admin
app.post('/upload-stores', upload.single('jsonFile'), handleFileUploadstores);

// POST requst for deleting the items collection by admin
app.post('/delete-items', handleDeletionitems);

// POST request for deleting the stores collection by admin
app.post('/delete-stores', handleDeletionstores);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
