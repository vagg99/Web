// Χρήστης : 1) Εγγραφή Χρήστη

const { connectToDatabase , getData } = require('../utils/connectToDB.js');
const hash = require('../utils/hash.js');
const cache = require('../utils/cache.js');
const { StartingTokens } = require('../utils/constants.js');

async function registerUser(username, email, password) {
    const collection = await connectToDatabase('users');
    let password_hashed = hash(username,password);
    let tokens = { "total" : StartingTokens , "monthly" : StartingTokens};
    let points = { "total" : 0 , "monthly" : 0};
    let isAdmin = false;
    let firstname = "";
    let lastname = "";
    let address = { "name" : "" , "city" : "" , "country" : "" , "countryCode" : ""};
    let likesDislikes = {likedDiscounts : [] , dislikedDiscounts : []};
    const userData = { username, tokens, points, email, password_hashed, isAdmin , firstname , lastname , address , likesDislikes };
    const result = await collection.insertOne(userData);
    cache.del('users');
    if (result.insertedId) {
      return 'Ο Χρήστης Εγγράφηκε με επιτυχία !';
    } else {
      throw new Error('Failed to register user.');
    }
}
async function handleRegistration(req, res) {
    if (req.method === 'POST' && req.url === '/register') {
      try {
        const { username, email, password } = req.body;
  
        const users = await getData('users');
  
        for (user in users) {
          if (users[user].username === username) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Το συγκεκριμένο όνομα χρησιμοποιείται από άλλο λογαριασμό.' }));
            return;
          }
          if (users[user].email === email) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Το συγκεκριμένο e-mail χρησιμοποιείται από άλλο λογαριασμό.' }));
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

module.exports = { handleRegistration };