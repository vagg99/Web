// Χρήστης : 5) β) i. και i.. Σκορ Αξιολόγισης με βάση τις αξιολογίσεις των χρηστών

const { connectToDatabase } = require('../utils/connectToDB.js');
const cache = require('../utils/cache.js');

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

module.exports = { updateLikeDislikePoints };