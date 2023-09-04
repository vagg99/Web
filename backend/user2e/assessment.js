// Χρήστης : 2) e) Like / Dislike / in Stock σε Προσφορές

const { connectToDatabase } = require('../utils/connectToDB.js');
const { ObjectId } = require('mongodb');
const updateLikeDislikePoints = require('../user5b/addPoints.js');
const cache = require('../utils/cache.js');

async function handleLikesDislikesUpdate(req, res){
    try {
      if (req.session.user) {
        const { likes , dislikes , in_stock , action , points } = req.body;
        const discountId = req.query.discountId;
        const username = req.session.user.username;
  
        const stockCollection = await connectToDatabase("stock");
        const userCollection = await connectToDatabase("users");
        const user = await userCollection.findOne({ username });
        const userId = user ? user._id.toString() : null;
        if (!userId) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        // ADD LIKE OR DISLIKE TO DISCOUNT PRODUCT
        const objectIdDiscountId = new ObjectId(discountId);
        const result = await stockCollection.updateOne({ _id: discountId }, { $set: {'discount.likes' : likes, 'discount.dislikes' : dislikes , in_stock : in_stock} });
        
        // ALSO ADD LIKE OR DISLIKE (TO USER WHO CLICKED THE BUTTON) SO IT CAN BE SEEN ON PROFILE
        let updateObject = {};
        if (action === 'like') { updateObject = { $push: { 'likesDislikes.likedDiscounts': discountId } }; } else if (action === 'dislike') { updateObject = { $push: { 'likesDislikes.dislikedDiscounts': discountId } }; } else if (action === 'unlike') { updateObject = { $pull: { 'likesDislikes.likedDiscounts': discountId } }; } else if (action === 'undislike') { updateObject = { $pull: { 'likesDislikes.dislikedDiscounts': discountId } }; }
        if (updateObject.length) await userCollection.updateOne({ username: username }, updateObject);
  
        // ADD POINTS TO USER THAT POSTED THE DISCOUNT (NOT THE ONE THAT CLICKED THE BUTTON)
        await updateLikeDislikePoints(points);
  
        cache.flushAll();
        res.status(200).json(result);
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = handleLikesDislikesUpdate;