// Χρήστης : 4) Σύστημα Tokens

const { connectToDatabase } = require('../utils/connectToDB.js');
const { StartingTokens } = require('../utils/constants.js');
const cache = require('../utils/cache.js');

async function distributeTokens() {
    const collection = await connectToDatabase('users');
    const users = await collection.find({}).toArray();
    console.log(`Monthly Token Distribution ! Distributing tokens to ${users.length} users...`);
    // Υπολογισμός νέων tokens για κάθε χρήστη και μηδενισμός πόντων
    let ApothematikoTokens = 0;
    let TotalPoints = 0;
    for (let i = 0; i < users.length; i++) {
      if (!users[i].points || !users[i].tokens) { continue; }
      // Αυξηση των μηνιαίων token κατα 100
      ApothematikoTokens += (StartingTokens + users[i].tokens["monthly"])*80/100;
      if (users[i].points["monthly"] < 0) { users[i].points["monthly"] = 0;}
      TotalPoints += users[i].points["monthly"];
    }
    for (let i = 0; i < users.length; i++) {
      if (!users[i].points || !users[i].tokens) { continue; }
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

module.exports = { distributeTokens };