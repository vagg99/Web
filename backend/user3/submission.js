// Χρήστης : 3) Υποβολή Προσφορών

const { connectToDatabase , getData } = require('../utils/connectToDB.js');
const { ObjectId } = require('mongodb');
const { getCurrentDate , getOneWeekAgoDate } = require('../utils/date.js');
const cache = require('../utils/cache.js');
const { calculatePoints , getPointsforSubmission , twenty_percent_smaller } = require('../user5a/addPoints.js');

async function handleDiscountSubmission(req, res) {
    try {
      if (req.session.user) {
        let { productId, newprice , userId } = req.body;
        const users = getData('users');
        for (user in users) {
          if (users[user].username === req.session.user.username) {
            userId = users[user]._id;
            break;
          }
        }
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
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
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

module.exports = {
    handleDiscountSubmission,
    deleteOldDiscounts
};