// Διαχειριστής : 1) Ανέβασμα JSON object

const { connectToDatabase , getData } = require('../utils/connectToDB.js');
const cache = require('../utils/cache.js');

async function handleJSONUpload(req, res) {
    const collectionName = req.query.collection;
    const jsonData = req.body; // This will be the parsed JSON data from the request body
    
    if (!jsonData) {
      return res.status(400).send('No JSON data uploaded.');
    }
  
    try {
      let updateOperations;
      if (collectionName == 'stock') {
        // Prepare an array of update operations based on store_id and item_id
        updateOperations = jsonData.map(item => ({
          updateOne: {
            filter: {
              store_id: item.store_id,
              item_id: item.item_id
            },
            update: { $set: item }, // Update the entire document with the new data
            upsert: true // Create a new document if it doesn't exist
          }
        }));
      } else {
        // Prepare an array of update operations based on id
        updateOperations = jsonData.map(item => ({
          updateOne: {
            filter: {
              id: item.id,
            },
            update: { $set: item }, // Update the entire document with the new data
            upsert: true // Create a new document if it doesn't exist
          }
        }));
      }
  
      // Connect to MongoDB
      const collection = await connectToDatabase(collectionName);
  
      // Perform bulkWrite to insert multiple documents at once
      const result = await collection.bulkWrite(updateOperations);
  
      // Send a response indicating success
      res.send(`JSON data uploaded and processed successfully to collection "${collectionName}". Inserted ${result.insertedCount} items.`);
  
      cache.flushAll();
      // reset cache
      getData(collectionName);
    } catch (error) {
      console.error('Error processing JSON:', error);
      res.status(400).send('Error processing JSON data.');
    }
}

async function handleDeletion(req, res) {
    try {
      const collectionName = req.query.collection;
      const collection = await connectToDatabase(collectionName);
      const result = await collection.deleteMany({});
      res.status(200).json(`Deleted ${result.deletedCount} ${collectionName}.`);
      cache.flushAll();
    } catch (error) {
      console.error(`Error deleting a database idk which one:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    handleJSONUpload,
    handleDeletion
};