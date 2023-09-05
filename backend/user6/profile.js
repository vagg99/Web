// Χρήστης : 6) Προφίλ Χρήστη

const { connectToDatabase } = require('../utils/connectToDB.js');
const { ObjectId } = require('mongodb');
const cache = require('../utils/cache.js');
const { TTLS } = require('../utils/constants.js');
const hash = require('../utils/hash.js');

async function getUserInfo(req, res) {
    try {
      // IF USER IS LOGGED IN
      if (req.session.user) {
        // CACHE FOR SPEED IMPROVEMENT
        const cachedUserInfo = await cache.get(req.session.user.username);
        if (cachedUserInfo) {
          return res.status(200).json(cachedUserInfo);
        }
  
        const username = req.session.user.username;
        const userCollection = await connectToDatabase("users");
        const stockCollection = await connectToDatabase("stock");
        
        // GET USER FROM LOG IN INFO
        const users = await userCollection.find({ username: username }).toArray();
        const user = users[0];
        delete user.password_hashed;
        delete user.isAdmin;
        
        // RETURN ALL THE DISCOUNTS THIS USER HAS POSTED
        const userPostedItems = await stockCollection.aggregate([
          {
            $match: { user_id: user._id.toString() , on_discount : true }
          },
          {
            $lookup: {
              from: "items",
              localField: "item_id",
              foreignField: "id",
              as: "item"
            }
          },
          {
            $unwind: "$item"
          },
          {
            $project: {
              _id: 1,
              user_id: 1,
              item_id: 1,
              price: 1,
              discount: 1,
              in_stock : 1,
              img: "$item.img",
              name: "$item.name"
            }
          }
        ]).toArray();
        
  
        // Convert string IDs to ObjectIDs for liked and disliked products
        let likedDiscountsObjectIDs = []
        let dislikedDiscountsObjectIDs = [];
        if (user.likesDislikes && Object.keys(user.likesDislikes).length) {
          likedDiscountsObjectIDs = user.likesDislikes.likedDiscounts;//.map(id => new ObjectId(id)); // uncomment if i fuck it up again
          dislikedDiscountsObjectIDs = user.likesDislikes.dislikedDiscounts;//.map(id => new ObjectId(id)); // and restore it as object
        }
  
        // RETURN ALL THE DISCOUNTS THIS USER HAS LIKED OR DISLIKED
        const userLikedItems = await stockCollection.aggregate([
          {
            $match: {
              '_id': { $in: likedDiscountsObjectIDs }
            }
          },
          {
            $lookup: {
              from: "items",
              localField: "item_id",
              foreignField: "id",
              as: "item"
            }
          },
          {
            $unwind: "$item"
          },
          { $lookup: { from: "users", let: { user_id_str: "$user_id" }, pipeline: [ { $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$user_id_str" }] } } }, { $project: { username: 1 } } ], as: "user" } },
          {
            $unwind: "$user"
          },
          {
            $project: {
              _id: 1,
              user_id: 1,
              item_id: 1,
              price: 1,
              discount: 1,
              in_stock : 1,
              img: "$item.img",
              name: "$item.name",
              username : "$user.username"
            }
          }
        ]).toArray();
        const userDislikedItems = await stockCollection.aggregate([
          {
            $match: {
              '_id': { $in: dislikedDiscountsObjectIDs }
            }
          },
          {
            $lookup: {
              from: "items",
              localField: "item_id",
              foreignField: "id",
              as: "item"
            }
          },
          {
            $unwind: "$item"
          },
          { $lookup: { from: "users", let: { user_id_str: "$user_id" }, pipeline: [ { $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$user_id_str" }] } } }, { $project: { username: 1 } } ], as: "user" } },
          {
            $project: {
              _id: 1,
              user_id: 1,
              item_id: 1,
              price: 1,
              discount: 1,
              in_stock : 1,
              img: "$item.img",
              name: "$item.name",
              username : "$user.username"
            }
          }
        ]).toArray();
        
        const userInfo = {
          user,
          userPostedItems,
          userLikedItems,
          userDislikedItems
        };
  
        cache.set(username, userInfo, TTLS);
        res.status(200).json(userInfo);
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleProfileUpdate(req, res) {
    try {
      if (req.session.user) {
        const username = req.session.user.username;
        const userCollection = await connectToDatabase("users");
        const users = await userCollection.find({ username: username }).toArray();
        const user = users[0];
        const userId = user._id; // Use the original _id
        let password_hashed = user.password_hashed;
        let isAdmin = user.isAdmin;
        const updateObject = req.body;
        delete updateObject._id; // Remove the _id field from the updateObject
        if (updateObject.newpassword) {
          updateObject.password_hashed = hash(updateObject.username, updateObject.newpassword);
        } else {
          updateObject.password_hashed = password_hashed;
        }
        updateObject.isAdmin = isAdmin;
        delete updateObject.newpassword;
        const result = await userCollection.updateOne(
          { _id: userId }, // Use the original _id here
          { $set: updateObject }
        );
        req.session.user.username = updateObject.username;
        cache.del(username);
        cache.del('users');
        res.status(200).json(result);
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getUserInfo,
    handleProfileUpdate
};