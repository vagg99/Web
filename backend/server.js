const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // DATABASE
const cron = require("node-cron"); // EVERY MONTH UPDATE SERVER TOKENS AND DISTRIBUTE THEM TO USERS
const jsSHA = require("jssha");// ENCRYPT USER PASSWORDS
const cors = require('cors');// USED FOR HTTPS CONNECTIONS
const session = require('express-session'); // USED FOR SESSIONS
const cookieParser = require('cookie-parser');// USED FOR COOKIES
const NodeCache = require("node-cache"); // USED FOR CACHE AND FASTER RESPONSE TIMES
const cache = new NodeCache();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(session({
  secret: 'nektarios', // Change this to a secure random string
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set secure to true in production with HTTPS
}));

app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true, // Allow credentials (cookies)
}));

app.use(express.static('public'));


const StartingTokens = 100; // Tokens that every user starts with , and gets every month
const TTLS = 3600; // Time to live for cache in seconds

cron.schedule("0 0 0 1 * *", distributeTokens); // DISTRIBUTES TOKENS EVERY MONTH
cron.schedule("0 0 * * *", deleteOldDiscounts); // CHECK EVERYDAY FOR DISCOUNT THAT ARE A WEEK OLD AND DELETE THEM


const port = 3000;

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

async function registerUser(username, email, password) {
  const collection = await connectToDatabase('users');
  let password_hashed = hash(username,password);
  let tokens = { "total" : StartingTokens , "monthly" : StartingTokens};
  let points = { "total" : 0 , "monthly" : 0};
  let isAdmin = false;
  let firstname = "";
  let lastname = "";
  let address = [""];
  const userData = { username, tokens, points, email, password_hashed, isAdmin , firstname , lastname , address };
  const result = await collection.insertOne(userData);
  cache.del('users');
  if (result.insertedId) {
    return 'User registered successfully!';
  } else {
    throw new Error('Failed to register user.');
  }
}

async function loginUser(username, password) {
  const users = await getData('users');
  let password_hashed = hash(username,password);
  for (user in users) {
    if (users[user].username === username && users[user].password_hashed === password_hashed) {
      return {message:'User logged in successfully!', user : users[user]};
    }
  }
  return {message:false,user:false};
}

// Add a new route to handle the registration data
async function handleRegistration(req, res) {
  if (req.method === 'POST' && req.url === '/register') {
    try {
      const { username, email, password } = req.body;

      const users = await getData('users');

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

async function handleLogin(req, res) {
  if (req.method === 'POST' && req.url === '/login') {
    try {
      const { username, password } = req.body;
      // Call the loginUser function to check if the user exists
      const {message,user} = await loginUser(username, password);

      if (!message){
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Wrong username or password.' }));
        return;
      }
      req.session.user = {
        username: username,
        isAdmin: user.isAdmin,
        points : user.points,
        tokens : user.tokens
      };
      res.cookie('sessionid', req.sessionID);

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
// 5_a_i and 5_a_ii rules
function twenty_percent_smaller(newprice,oldprice){
  return ((newprice / oldprice) < 0.8);
}

// get date
function getCurrentDate() {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
function getOneWeekAgoDate(){
  const oneWeekAgo = new Date();

  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const year = oneWeekAgo.getFullYear();
  const month = String(oneWeekAgo.getMonth() + 1).padStart(2, '0');
  const day = String(oneWeekAgo.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Χρήστης : 2) d) Εμφάνιση Προσφορών
async function getItemsInStockFromDatabase(storeId,on_discount=false) {
  const cacheKey = on_discount ? `discounted_${storeId}` : `non_discounted_${storeId}`;
  const cachedItems = cache.get(cacheKey);
  if (cachedItems) return cachedItems;
  //else
  const collection = await connectToDatabase('stock');
  
  // Αναζήτηση στο collection stocks για τα προϊόντα που είναι σε προσφορά
  const aggregationPipeline = [];
  if (on_discount) {
    aggregationPipeline.push(
      {
        $match: {
          store_id: storeId,
          on_discount : true
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
      /*
      {
        $lookup: {
          from: 'users', // Name of the users collection
          let: { userId: { $toObjectId: '$user_id' } }, // Convert user_id to ObjectId
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } }
          ],
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      */
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
          user_id : true,
          user : true,
          'on_discount' : true
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
          discount : true,
          'store.tags.name': true,
          'item.name': true,
          'item.id' : true,
          'item.category' : true,
          'item.subcategory' : true,
          in_stock: true,
          'item.img' : true,
          'on_discount' : true
        }
      }
    );
  }

  const cursor = collection.aggregate(aggregationPipeline);

  // Convert the aggregation cursor to an array of documents
  const discountedItems = await cursor.toArray();

  cache.set(cacheKey, discountedItems, TTLS);

  return discountedItems;
}


// Χρήστης : 2) e) Like / Dislike / in Stock σε Προσφορές
async function handleLikesDislikesUpdate(req, res){
  try {
    const { likes , dislikes , in_stock , points } = req.body;
    const discountId = req.query.discountId;
    const collection = await connectToDatabase("stock");
    const objectIdDiscountId = new ObjectId(discountId);
    const result = await collection.updateOne({ _id: objectIdDiscountId }, { $set: {'discount.likes' : likes, 'discount.dislikes' : dislikes , in_stock : in_stock} });
    await updateLikeDislikePoints(points);
    cache.flushAll();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Χρήστης : 3) Υποβολή Προσφορών
async function handleDiscountSubmission(req, res) {
  try {
    let { productId, newprice , userId } = req.body;
    newprice = Number(newprice);

    const collection = await connectToDatabase("stock");
    const product = await collection.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (newprice < 0) {
      res.status(400).json({ error: 'Invalid price' });
      return;
    }

    if (newprice >= product.price) {
      res.status(400).json({ error: 'Discount price must be lower than the original price' });
      return;
    }

    if (product.on_discount && newprice >= product.discount.discount_price) {
      res.status(400).json({ error: 'Discount price must be lower than the current discount price' });
      return;
    }

    if (product.on_discount && !twenty_percent_smaller(newprice,product.discount.discount_price)) {
      res.status(400).json({ error: 'Discount price must be at least 20% lower than the current discount price' });
      return;
    }
    
    let achievements = {};

    let p = await calculatePoints(product,newprice);

    if (p == 50){
      achievements["5_a_i"] = true;
    }
    if (p == 20){
      achievements["5_a_ii"] = true;
    }

    const result = await collection.updateOne({ _id: new ObjectId(productId) }, { $set: {
      on_discount : true,
      discount: { 
        discount_price: newprice,
        date : getCurrentDate(),
        likes : 0,
        dislikes : 0,
        achievements : achievements
      },
      user_id : userId
    }});

    if (p) getPointsforSubmission(userId,p)
    cache.flushAll();
    res.status(200).json(result);
  } catch (error){
    console.error('Error submitting discount:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
// Διαγραφή προσφορών που είναι παλιότερες απο μία βδομάδα
// (η συνάρτηση καλείται κάθε μέρα στα μεσάνυχτα οπότε μετα απο 1 βδομαδα
// απο την υποβολη τους θα έχουν διαγραφεί.)
async function deleteOldDiscounts() {
  const collection = await connectToDatabase("stock");
  
  // Calculate the date that was a week ago from today
  const oneWeekAgo = getOneWeekAgoDate();
  const discountsToDelete = await collection.find({ "discount.date": { $lt: oneWeekAgo } }).toArray();

  const bulkOperations = [];

  for (const discount of discountsToDelete) {
    let p = calculatePoints(discount,discount.discount.discount_price)
    if (p) {
      bulkOperations.push({
        updateOne: {
          filter: { _id: discount._id },
          update: {
            $set: {
              "discount.date": getCurrentDate(),  // Update the discount date to current date
              "discount.achievements.5_a_i" : p == 50 ? true : false,
              "discount.achievements.5_a_ii" : p == 20 ? true : false
            }
          }
        }
      });
    } else {
      bulkOperations.push({
        updateOne: {
          filter: { _id: discount._id },
          update: {
            $set: {
              "discount": {},          // Reset the discount field
              "on_discount": false    // Set on_discount flag to false
            }
          }
        }
      });
    }
  }

  if (bulkOperations.length > 0) {
    const result = await collection.bulkWrite(bulkOperations);
    console.log(`Processed ${result.modifiedCount + result.deletedCount} discounts.`);
    cache.flushAll();
  } else {
    console.log("No discounts to process.");
  }
}

// Χρήστης : 4) Σύστημα Tokens
async function distributeTokens() {
  console.log(`Monthly Token Distribution ! Distributing tokens to ${users.length} users...`);
  const collection = await connectToDatabase('users');
  const users = await collection.find({}).toArray();
  // Υπολογισμός νέων tokens για κάθε χρήστη και μηδενισμός πόντων
  let ApothematikoTokens = 0;
  let TotalPoints = 0;
  for (let i = 0; i < users.length; i++) {
    // Αυξηση των μηνιαίων token κατα 100
    ApothematikoTokens += (StartingTokens + users[i].tokens["monthly"])*80/100;
    if (users[i].points["monthly"] < 0) { users[i].points["monthly"] = 0;}
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
  cache.del('users');
}

// Χρήστης 5) α) i. και ii. και iii. και iv.
async function calculatePoints(product,newprice){
  let productID = product.item_id;

  const collection = await connectToDatabase('stock');
  
  // Find all documents in the stock collection with the given product ID and in stock
  const ItemsInStockToday = await collection.find({
    'item_id': productID,
    'in_stock': true,
    'discount.date': { $lt: getCurrentDate() }
  }).toArray();
  const ItemsInStockThisWeek = await collection.find({
    'item_id': productID,
    'in_stock': true,
    'discount.date': { $lt: getOneWeekAgoDate() }
  }).toArray();

  mesh_timi_today = 0
  for (item in ItemsInStockToday){
    if (item.on_discount){
      mesh_timi_today+=ItemsInStockToday[item].discount.discount_price;
    } else {
      mesh_timi_today+=ItemsInStockToday[item].price;
    }
  }

  mesh_timi_weekly = 0
  for (item in ItemsInStockThisWeek){
    if (item.on_discount){
      mesh_timi_weekly+=ItemsInStockThisWeek[item].discount.discount_price;
    } else {
      mesh_timi_weekly+=ItemsInStockThisWeek[item].price;
    }
  }
  if ( twenty_percent_smaller(newprice,mesh_timi_today) ){
    return 50;
  }
  if ( twenty_percent_smaller(newprice,mesh_timi_weekly) ){
    return 20;
  }

  return false;
}
async function getPointsforSubmission(userId,pointsToAdd){
  const collection = await connectToDatabase("users");
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) }, // Convert userId to ObjectId
      { $inc: { "points.monthly" : pointsToAdd } } // Increment the points field by the specified value
    );

    if (result.matchedCount === 1) {
      console.log(`Points updated successfully for user with _id: ${userId}`);
      cache.del('users');
    } else {
      console.log(`User with _id: ${userId} not found.`);
    }
  } catch (error) {
    console.error(`Error updating points for user with _id: ${userId}`);
    console.error(error);
  }
}

// Χρήστης 5) β) i. και i.. Σκορ Αξιολόγισης με βάση τις αξιολογίσεις των χρηστών
async function updateLikeDislikePoints(points){
  try {
    const collection = await connectToDatabase('users');
    const users = await collection.find({}).toArray();

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
    cache.del('users');
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

    cache.del(collectionName);
    // reset cache
    getData(collectionName);
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
    cache.del(collectionName);
  } catch (error) {
    console.error(`Error deleting ${collectionName}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Διαχειριστής : 4) Απεικόνιση Leaderboard
async function getLeaderboard() {
  const users = await getData('users');
  let leaderboard = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].points && users[i].tokens) {
      leaderboard.push({
        username: users[i].username,
        // Αν το τρεχον σκορ (μηνιαιο) του χρηστη ειναι αρνητικο , δειξε στο leaderboard
        // μονο το συνολικο (παλιο) score
        // Αν ειναι θετικο , δειξε στο leaderboard το αθροισμα του μηνιαιου και του συνολιου
        points :
          (users[i].points["monthly"] >= 0) ? users[i].points["total"] + users[i].points["monthly"] : users[i].points["total"]
        ,
        tokens: users[i].tokens
      });
    }
  }
  leaderboard.sort((a,b) => b.points - a.points);
  return leaderboard;
}

// GET request for fetching users
app.get('/users', async (req, res) => {
  try {
    const users = await getData('users');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET request for fetching items
app.get('/getItems', async (req, res) => {
  try {
    const products = await getData('items');
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

app.post('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
      if (err) {
          console.error('Error destroying session:', err);
          res.status(500).send('Logout failed');
      } else {
          // Clear the session cookie
          res.clearCookie('sessionid');
          res.clearCookie('connect.sid');
          // Redirect or send a success message
          res.sendStatus(200);
      }
  });
});

app.get('/check-admin-auth', (req, res) => {
  if (req.session){
    if (req.session.user || req.sessionStore.sessions[req.cookies.sessionid]) {
      if (req.session.user.isAdmin || (req.sessionStore.sessions[req.cookies.sessionid].user && req.sessionStore.sessions[req.cookies.sessionid].user.isAdmin)){
        // User is authenticated as admin
        res.json({ isAdmin: true });
        return;
      }
    }
  }
  res.json({ isAdmin: false });
});

app.get('/check-user-auth', (req, res) => {
  if (req.session){
    if (req.session.user || (req.sessionStore.sessions[req.cookies.sessionid] && req.sessionStore.sessions[req.cookies.sessionid].user )) {
      // User is logged in
      res.json({ loggedIn: true });
      return;
    }
  }
  res.json({ loggedIn: false });
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
    const stores = await getData('stores');
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
      const cachedCollection = await cache.get("discounted_all");
      if (cachedCollection) { return res.status(200).json(cachedCollection); }
      // else
      const collection = await connectToDatabase("stock");
      const discountedItems = await collection.find({"on_discount" : true}).toArray();
      cache.set("discounted_all", discountedItems, TTLS);
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
    const categories = await getData("categories");
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
    const users = await collection.find({ username : username }).toArray();
    let user = users[0];
    delete user.password_hashed;
    delete user.isAdmin;
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST request for updating db with likes / dislikes and stock by users
app.post('/assessment', handleLikesDislikesUpdate);

// POST request for submitting new price on a product
app.post('/submitDiscount', handleDiscountSubmission);

// POST request for uploading files to a collection by admin
app.post('/upload', handleJSONUpload);

// POST requst for deleting a collection by admin
app.post('/delete', handleDeletion);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});