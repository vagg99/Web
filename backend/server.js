const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // DATABASE
const cron = require("node-cron"); // EVERY MONTH UPDATE SERVER TOKENS AND DISTRIBUTE THEM TO USERS
const jsSHA = require("jssha");// ENCRYPT USER PASSWORDS
const cors = require('cors');// USED FOR HTTPS CONNECTIONS
const session = require('express-session'); // USED FOR SESSIONS
const cookieParser = require('cookie-parser'); // USED FOR COOKIES
const config = require('../url.js'); // hosting ips

const app = express();

app.use(session({
  secret: 'nektarios', // Change this to a secure random string
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set secure to true in production with HTTPS
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: `${config.frontend.url}:${config.frontend.port}`, // Replace with your frontend's URL
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.static('public'));

cron.schedule("0 0 0 1 * *", distributeTokens); // DISTRIBUTES TOKENS EVERY MONTH

const mongoURI = "mongodb+srv://webproject7:HVHDmG6eK2nuq9rM@cluster0.03czzuj.mongodb.net/?retryWrites=true&w=majority";

async function connectToDatabase(collectionName) {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client.db('website7').collection(collectionName);
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

async function loginUser(username, password, req, res) {
  const {users, collection} = await getUsers();
  let password_hashed = hash(username,password);
  for (user in users) {
    if (users[user].username === username && users[user].password_hashed === password_hashed) {
      if (users[user].isAdmin) {
        req.session.user = {
          username: users[user].username,
          isAdmin: true,
          test : "test"
        };
        console.log(req.session)
        console.log(req.session.user)
        req.session.isAuth = true;
        console.log(req.sessionStore);
        //res.cookie('myCookie', req.session.user, { maxAge: 3600000, httpOnly: true });
        //req.cookies['myCookie'] = req.session.user;
      }
      return 'User logged in successfully!';
    }
  }
  return false;
}

// Add a new route to handle the registration data
async function handleRegistration(req, res) {
  if (req.method === 'POST' && req.url === '/register') {
    try {
      const { username, tokens, points, email, password, isAdmin } = req.body;


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
      const { username, password } = req.body;

      // Call the loginUser function to check if the user exists
      const message = await loginUser(username, password, req, res);
      
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

const adminAuthMiddleware = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
      return next();
  }
  res.status(401).send('Unauthorized');
};

// for encrypting passwords
function hash(username,password) {
  let Obj = new jsSHA("SHA-256", "TEXT", username); // uses the user's username as salt
  Obj.update(password);
  return Obj.getHash("HEX");
}

// Χρήστης : 2) d) Εμφάνιση Προσφορών
async function getDiscountedItemsFromDatabase(storeId) {
  // Παρε το ονομα του μαγαζιου απο το collection των μαγαζιων
  const {stores, storecollection} = await getStores();
  let shopName = null;
  for (let store in stores){
    if (stores[store].id == storeId) {
      shopName = stores[store].tags.name;
      break;
    }
  }
  
  const {stock, collection} = await getStock();
  
  // Αναζήτηση στο collection stocks για τα προϊόντα που είναι σε προσφορά
  const aggregationPipeline = [
    {
      $match: {
        store_id: storeId,
        discount_price: { $gt: 0 }
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
        from: 'users', // Name of the users collection
        localField: 'user_id',
        foreignField: '_id',
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
        'item.name': true,
        in_stock: true,
        discount_price: true,
        date: true,
        likes: true,
        dislikes : true,
        'item.img' : true,
        'user.username': true,
        'user.points.total': true,
        achievements : true,
      }
    }
  ];

  const cursor = collection.aggregate(aggregationPipeline);

  // Convert the aggregation cursor to an array of documents
  discountedItems = await cursor.toArray();


  return {discountedItems,shopName};
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

app.get('/root/admin/admin.html', adminAuthMiddleware, (req, res) => {
  res.sendFile(__dirname + '/admin.html');
});

// GET request for fetching items
app.get('/items', async (req, res) => {
  try {
    let collection = await connectToDatabase("items");
    let products = await collection.find({}).toArray();
    let collection2 = await connectToDatabase("categories");
    let categories = await collection2.find({}).toArray();
    items = {
      products: products,
      categories: categories
    }
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST request for registration
app.route('/login')
  .get((req, res) => {
    // Handle GET request logic
  })
  .post(handleLogin);
//app.post('/register', handleRegistration);

// POST request for login
//app.post('/login', handleLogin);

app.get('/login', (req, res) => {});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/'); // Redirect to home or login page
});

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
      const {discountedItems,shopName} = await getDiscountedItemsFromDatabase(shopId);
      res.status(200).json({ discountedItems , shopName : shopName });
    }
  } catch (error) {
    console.error('Error fetching discounted items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET request for fetching all subcategories from database
app.get('/getSubcategories', async (req, res) => {
  try {
    const collection = await connectToDatabase("categories");
    const subcategories = await collection.find({}).toArray();
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

app.get('/get-session-data', (req, res) => {
  console.log(req.session);
  console.log(req.sessionID);
  console.log(req.cookies);
  console.log(req.sessionStore);
  const sessionId = req.cookies['connect.sid'];

  if (!sessionId) {
    return res.status(401).json({ error: 'User is not authenticated.' });
  }

  req.sessionStore.get(sessionId, (error, session) => {
    console.log(session);
    console.log(session.user);
    if (error || !session || !session.user) {
      return res.status(401).json({ error: 'User is not authenticated.' });
    }

    const customData = session.user.test || 'No custom data available.';
    res.status(200).json({ customData });
  });
});

app.listen(config.backend.port, () => {
  console.log(`Server is running on ${config.backend.url}:${config.backend.port}`);
});
