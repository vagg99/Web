// Διαχειριστής : 3) Απεικόνιση Στατιστικών

const { connectToDatabase } = require('../utils/connectToDB.js');
const { TTLS } = require('../utils/constants.js');
const cache = require('../utils/cache.js');

let stock = {}

async function handleAverageDiscounts(req, res) {
    try {

        const { category, subcategory } = req.query;

        stock = await getAllDiscounts();

        const today = new Date(stock[0].discount.date);

        const labels = [];
        const data = [];

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(currentDate.getDate() - i);
            const averageDiscountPercentage = calculateAverageDiscountPercentage(category, subcategory, currentDate);
            // Format date to 'day/month' and add it to labels
            const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
            labels.unshift(formattedDate);
            
            // Add average discount percentage to data
            data.unshift(averageDiscountPercentage);
        }

        const AverageDiscounts = {
            labels : labels,
            data : data
        }

        res.status(200).json(AverageDiscounts);
    } catch (error){
        console.error('Error fetching chart2 data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

function calculateAverageDiscountPercentage(category, subcategory, date) {
    const currentWeekStart = new Date(date);
    currentWeekStart.setHours(0, 0, 0, 0 - currentWeekStart.getDay() * 24 * 60 * 60 * 1000);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
  
    const relevantItems = stock.filter((item) => {
      return (
        (item.category === category) &&
        (subcategory === "0" || item.subcategory === subcategory) &&
        new Date(item.discount.date) >= currentWeekStart &&
        new Date(item.discount.date) <= currentWeekEnd
      );
    });
  
    const totalDiscountPercentage = relevantItems.reduce((sum, item) => {
      const previousPrice = item.price + item.discount.discount_price;
      const currentPrice = item.price;
      const discountPercentage = ((previousPrice - currentPrice) / previousPrice) * 100;
      return sum + discountPercentage;
    }, 0);
  
    return totalDiscountPercentage / relevantItems.length;
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

module.exports = { handleAverageDiscounts }