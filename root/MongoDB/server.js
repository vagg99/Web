const { MongoClient } = require('mongodb');
const http = require('http');

const port = 3000;

const mongoURI = "mongodb+srv://webproject7:HVHDmG6eK2nuq9rM@cluster0.03czzuj.mongodb.net/?retryWrites=true&w=majority";

async function connectToDatabase() {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  console.log("connected to database !");
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

async function registerUser(username, password) {
  const collection = await connectToDatabase();
  // You should hash the password here before storing it in the database for security purposes
  const userData = { username, password };
  const result = await collection.insertOne(userData);
  if (result.insertedCount === 1) {
    return 'User registered successfully!';
  } else {
    throw new Error('Failed to register user.');
  }
}

// Add a new route to handle the registration data
async function handleRegistration(req, res) {
  console.log("aaaaa");
  console.log(req.url);
  console.log(req.method);
  console.log(req.method === 'POST')
  if (req.method === 'POST' && req.url === '/register') {
    try {
      console.log("a")
      const body = await getRequestBody(req);
      const { username, password } = JSON.parse(body);

      // Call the registerUser function to store the user data
      const message = await registerUser(username, password);

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

// Attach the handleRegistration function to the server
const server = http.createServer(async (req, res) => {
  console.log(req)
  console.log(req.method)
  if (req.method === 'GET' && req.url === '/users') {
    // Handle GET request for fetching users
    try {
      const users = await getUsers();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
    } catch (error) {
      console.error('Error fetching users:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  } else {
    // Handle POST request for registration
    handleRegistration(req, res);
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
