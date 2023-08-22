const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // DATABASE
const cron = require("node-cron"); // EVERY MONTH UPDATE SERVER TOKENS AND DISTRIBUTE THEM TO USERS
const jsSHA = require("jssha");// ENCRYPT USER PASSWORDS
const cors = require('cors');// USED FOR HTTPS CONNECTIONS

const app = express();

app.use(express.json());

cron.schedule("0 0 0 1 * *", distributeTokens); // DISTRIBUTES TOKENS EVERY MONTH

app.use(cors());

app.use(express.static('public'));

const port = 3000;

const mongoURI = "mongodb+srv://webproject7:HVHDmG6eK2nuq9rM@cluster0.03czzuj.mongodb.net/?retryWrites=true&w=majority";

async function connectToDatabase(collectionName) {
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

// Χρήστης : 2) d) Εμφάνιση Προσφορών
async function getItemsInStockFromDatabase(storeId,on_discount=false) {
  const collection = await connectToDatabase('stock');
  
  // Αναζήτηση στο collection stocks για τα προϊόντα που είναι σε προσφορά
  const aggregationPipeline = [];
  if (on_discount) {
    aggregationPipeline.push(
      {
        $match: {
          store_id: storeId,
          discount : { $exists: true, $ne: {} }
        }
      }
    );
  } else {
    aggregationPipeline.push(
      {
        $match: {
          store_id: storeId
        }
      }
    );
  }
  aggregationPipeline.push(
    {
      $addFields: {
        store_id_int: { $toInt: "$store_id" }
      }
    },
    {
      $lookup: {
        from: 'items', // Name of the collection
        localField: 'item_id',
        foreignField: 'id',
        as: 'item'
      }
    },
    {
      $unwind: '$item'
    },
    {
      $lookup: {
        from: 'stores', // Name of the collection
        localField: 'store_id_int',
        foreignField: 'id',
        as: 'store'
      }
    },
    {
      $unwind: '$store'
    }
  );
  if (on_discount) {
    aggregationPipeline.push(
      {
        $lookup: {
          from: 'users', // Name of the users collection
          localField: 'og',
          foreignField: 'username',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: true,
          store_id: true,
          discount : true,
          'store.tags.name': true,
          'item.name': true,
          'item.id' : true,
          in_stock: true,
          'item.img' : true,
          user : true
        }
      }
    );
  } else {
    aggregationPipeline.push(
      {
        $project: {
          _id: true,
          store_id: true,
          price : true,
          'store.tags.name': true,
          'item.name': true,
          'item.id' : true,
          'item.category' : true,
          'item.subcategory' : true,
          in_stock: true,
          'item.img' : true,
        }
      }
    );
  }

  const cursor = collection.aggregate(aggregationPipeline);

  // Convert the aggregation cursor to an array of documents
  discountedItems = await cursor.toArray();

  return discountedItems;
}


// Χρήστης : 2) e) Like / Dislike / in Stock σε Προσφορές
async function handleLikesDislikesUpdate(req, res){
  try {
    const { likes , dislikes , in_stock , points } = req.body;
    const discountId = req.query.discountId;
    const collection = await connectToDatabase("stock");
    const objectIdDiscountId = new ObjectId(discountId);
    const result = await collection.updateOne({ _id: objectIdDiscountId }, { $set: {likes : likes, dislikes : dislikes , in_stock : in_stock} });
    await updateLikeDislikePoints(points);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

// Χρήστης 5) β) i. και i.. Σκορ Αξιολόγισης με βάση τις αξιολογίσεις των χρηστών
async function updateLikeDislikePoints(points){
  try {
    const {users, collection} = await getUsers();
    const users_to_Receive_or_Lose_Points = Object.keys(points);
    for (u in users_to_Receive_or_Lose_Points){
      for (user in users) {
        if (users[user].username === users_to_Receive_or_Lose_Points[u]) {
          users[user].points["monthly"] += points[users_to_Receive_or_Lose_Points[u]];
          break;
        }
      }
    }
    const updateOperations = users.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { points: user.points } },
      },
    }));
    await collection.bulkWrite(updateOperations);
  } catch (error) {
    console.error('Error updating points:', error);
  }
}

// Διαχειριστής : 1) Ανέβασμα JSON object
async function handleJSONUpload(req, res) {
  const collectionName = req.query.collection;
  const jsonData = req.body; // This will be the parsed JSON data from the request body
  
  if (!jsonData) {
    return res.status(400).send('No JSON data uploaded.');
  }

  try {
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

    // Send a response indicating success
    res.send(`JSON data uploaded and processed successfully to collection "${collectionName}". Inserted ${result.insertedCount} items.`);
  } catch (error) {
    console.error('Error processing JSON:', error);
    res.status(400).send('Error processing JSON data.');
  }
}

async function handleDeletion(req, res) {
  try {
    const collectionName = req.query.collection;
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
  const collection = await connectToDatabase('users');
  const users = await collection.find({}).toArray();
  return {users,collection};
}

async function getStock() {
  const collection = await connectToDatabase('stock');
  const stock = await collection.find({}).toArray();
  return {stock,collection};
}

async function getStores() {
  const collection = await connectToDatabase('stores');
  const stores = await collection.find({}).toArray();
  return {stores,collection};
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

// GET request for fetching items
app.get('/getItems', async (req, res) => {
  try {
    let collection = await connectToDatabase("items");
    let products = await collection.find({}).toArray();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching items:', error);
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

// GET request for fetching stores
app.get('/stores', async (req, res) => {
  try {
    const collection = await connectToDatabase("stores");
    const stores = await collection.find({}).toArray();
    res.status(200).json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET request for fetching all discounted items from 1 store
app.get('/getDiscountedItems', async (req, res) => {
  try {
    const shopId = req.query.shopId;
    if (shopId == "all") {
      const collection = await connectToDatabase("stock");
      const discountedItems = await collection.find({}).toArray();
      res.status(200).json(discountedItems);
    } else {
      const discountedItems = await getItemsInStockFromDatabase(shopId, true);
      res.status(200).json(discountedItems);
    }
  } catch (error) {
    console.error('Error fetching discounted items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/getStock', async (req, res) => {
  try {
    const shopId = req.query.shopId;
    const ItemsInStock = await getItemsInStockFromDatabase(shopId, false);
    res.status(200).json(ItemsInStock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET request for fetching all categories from database
app.get('/getSubcategories', async (req, res) => {
  try {
    const collection = await connectToDatabase("categories");
    const categories = await collection.find({}).toArray();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET request for fetching a user's information from the database
app.get('/getUserInfo', async (req, res) => {
  try {
    const username = req.query.username;
    const collection = await connectToDatabase("users");
    const {subcategories} = await collection.find({}).toArray();
    res.status(200).json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST request for updating db with likes / dislikes and stock by users
app.post('/assessment', handleLikesDislikesUpdate);

// POST request for uploading files to a collection by admin
app.post('/upload', handleJSONUpload);

// POST requst for deleting a collection by admin
app.post('/delete', handleDeletion);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
