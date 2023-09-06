// Χρήστης : 5) α) i. και ii. και iii. και iv.

const { connectToDatabase } = require('../utils/connectToDB.js');
const { getCurrentDate , getOneWeekAgoDate } = require('../utils/date.js');
const { ObjectId } = require('mongodb');
const cache = require('../utils/cache.js');

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

// 5_a_i and 5_a_ii rules
function twenty_percent_smaller(newprice, oldprice) {
  const twentyPercentOfOldPrice = 0.2 * oldprice;
  return (newprice <= oldprice - twentyPercentOfOldPrice)
}

module.exports = {
    calculatePoints,
    getPointsforSubmission,
    twenty_percent_smaller
};