// Διαχειριστής : 5) Ο Διαχειριστής έχει την δυνατότητα να διαγράψει μια προσφορά

const { connectToDatabase } = require('../utils/connectToDB.js');
const { ObjectId } = require('mongodb');
const cache = require('../utils/cache.js');

async function handleIndividualDiscountDeletion(req, res) {
    try {
      const discountId = req.query.discountId;
      const collection = await connectToDatabase("stock");
      const objectIdDiscountId = new ObjectId(discountId);
      const result = await collection.updateOne({ _id: objectIdDiscountId }, { $set: { "discount": {}, "on_discount": false } });
      cache.flushAll();
      res.status(200).json(result);
    } catch (error) {
      console.error('Error deleting discount:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = handleIndividualDiscountDeletion;