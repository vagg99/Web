/*
// Description: Server for the backend of the project
// Libraries used :
// EXPRESS , MONGODB , NODE-CRON , JSSHA , CORS , EXPRESS-SESSION , COOKIE-PARSER , NODE-CACHE
// 'express' , 'mongodb' , 'node-cron' , 'jssha' , 'cors' , 'express-session' , 'cookie-parser' , 'node-cache'
*/

const express = require('express');
const cron = require("node-cron"); // EVERY MONTH UPDATE SERVER TOKENS AND DISTRIBUTE THEM TO USERS
const cors = require('cors');// USED FOR HTTPS CONNECTIONS
const session = require('express-session'); // USED FOR SESSIONS
const cookieParser = require('cookie-parser');// USED FOR COOKIES

const { TTLS , port , secret , frontend } = require('./utils/constants.js'); // CONSTANTS FROM CONFIG FILE

const app = express();

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

app.use(session({
  secret: secret, // Change this to a secure random string
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set secure to true in production with HTTPS
}));

app.use(cors({
  origin: frontend,
  credentials: true, // Allow credentials (cookies)
}));

app.use(express.static('public'));

const distributeTokens = require('./user4/tokens.js'); // DISTRIBUTE TOKENS TO USERS
cron.schedule("0 0 0 1 * *", distributeTokens); // DISTRIBUTES TOKENS EVERY MONTH
const { deleteOldDiscounts } = require('./user3/submission.js'); // DELETE OLD DISCOUNTS
cron.schedule("0 0 * * *", deleteOldDiscounts); // CHECK EVERYDAY FOR DISCOUNT THAT ARE A WEEK OLD AND DELETE THEM


const { connectToDatabase , getData } = require('./utils/connectToDB.js'); // DATABASE
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

const handleRegistration = require('./user1/register.js'); // REGISTRATION

// POST request for registration
app.post('/register', handleRegistration);

const handleLogin = require('./user1/login.js'); // LOGIN

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

const getLeaderboard = require('./admin4/leaderboard.js'); // LEADERBOARD

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

const cache = require('./utils/cache.js');
const getItemsInStockFromDatabase = require('./user2d/map.js');
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

const { getUserInfo , handleProfileUpdate } = require('./user6/profile.js'); // PROFILE

// GET request for fetching user info for displaying in profile
app.get('/getUserInfo', getUserInfo);

// POST request for updating user profile in profile
app.post('/updateUserInfo', handleProfileUpdate);

const handleLikesDislikesUpdate = require('./user2e/assessment.js'); // ASSESSMENT

// POST request for updating db with likes / dislikes and stock by users
app.post('/assessment', handleLikesDislikesUpdate);

const { handleDiscountSubmission } = require('./user3/submission.js'); // SUBMISSION

// POST request for submitting new price on a product
app.post('/submitDiscount', handleDiscountSubmission);

const { handleJSONUpload , handleDeletion } = require('./admin1/uploadJSON.js'); // UPLOAD JSON

// POST request for uploading files to a collection by admin
app.post('/upload', handleJSONUpload);

// POST requst for deleting a collection by admin
app.post('/delete', handleDeletion);

const handleIndividualDiscountDeletion = require('./admin5/deleteDiscount.js'); // DELETE DISCOUNT

// DELETE request for deleting a discount by admin
app.delete('/deleteDiscount', handleIndividualDiscountDeletion);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});