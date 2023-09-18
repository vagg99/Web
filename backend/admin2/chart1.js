// Διαχειριστής : 3) Απεικόνιση Στατιστικών

const { connectToDatabase } = require('../utils/connectToDB.js');
const { TTLS } = require('../utils/constants.js');
const cache = require('../utils/cache.js');

async function handleDiscountCounts(req, res) {
    try {
        const { year, month } = req.query;

        const daysInMonth = new Date(year, month, 0).getDate();

        const stock = await getAllDiscounts();

        const discountCounts = new Array(daysInMonth).fill(0);
        
        const filteredStock = stock.filter(item => {
            const itemDate = new Date(item.discount.date);
            return itemDate.getFullYear() === parseInt(year) && itemDate.getMonth() === parseInt(month) - 1;
        });

        filteredStock.forEach(item => {
            const itemDate = new Date(item.discount.date);
            const day = itemDate.getDate();
            discountCounts[day - 1]++;
        });

        res.status(200).json(discountCounts);
    } catch (error) {
        console.error('Error fetching chart1 data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAllDiscounts(){
    const cachedCollection = await cache.get("discounted_all");
    if (cachedCollection) { return cachedCollection; }
    // else
    const collection = await connectToDatabase("stock");
    const discountedItems = await collection.find({"on_discount" : true}).toArray();
    cache.set("discounted_all", discountedItems, TTLS);
    return discountedItems;
}

module.exports = { handleDiscountCounts };