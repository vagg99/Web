// Χρήστης : 2) d) Εμφάνιση Προσφορών

const { connectToDatabase } = require('../utils/connectToDB.js');
const cache = require('../utils/cache.js');
const { TTLS } = require('../utils/constants.js');

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
          store_id_int: { $toDouble: "$store_id" }
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
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true // Preserve items even if user is not found
          }
        },
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

module.exports = { getItemsInStockFromDatabase };