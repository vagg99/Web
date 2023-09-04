// Χρήστης : 1) Εγγραφή Χρήστη

const { getData } = require('../utils/connectToDB.js');

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
          isAdmin: user.isAdmin
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

module.exports = handleLogin;