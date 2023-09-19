// Διαχειριστής : 3) Απεικόνιση Στατιστικών

const { connectToDatabase } = require('../utils/connectToDB.js');
const { TTLS } = require('../utils/constants.js');
const cache = require('../utils/cache.js');

let stock = {}

async function handleAverageDiscounts(req, res) {
    try {
        const { category, subcategory } = req.query;

        console.debug('Handling request to calculate average discounts:');
        console.debug('Category: ' + category);
        console.debug('Subcategory: ' + subcategory);

        stock = await getAllDiscounts();

        // Find the oldest and newest discount dates in the stock
        const oldestDate = new Date(stock.reduce((min, item) => (new Date(item.discount.date) < new Date(min) ? item.discount.date : min), stock[0].discount.date));
        const newestDate = new Date(stock.reduce((max, item) => (new Date(item.discount.date) > new Date(max) ? item.discount.date : max), stock[0].discount.date));

        console.debug('Oldest Date: ' + oldestDate.toDateString());
        console.debug('Newest Date: ' + newestDate.toDateString());

        const labels = [];
        const data = [];

        let currentDate = new Date();

        while (currentDate >= oldestDate) {
            const weekLabels = [];
            const weekData = [];

            console.debug('Calculating data for the week starting from: ' + currentDate.toDateString());

            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(currentDate);
                dayDate.setDate(currentDate.getDate() - i);

                console.debug('Calculating data for the day: ' + dayDate.toDateString());

                const averageDiscountPercentage = calculateAverageDiscountPercentage(
                    category,
                    subcategory,
                    dayDate,
                    i
                );

                weekLabels.unshift(dayDate.toDateString());
                weekData.unshift(averageDiscountPercentage);
            }

            // Add the labels and data for the week
            labels.push(weekLabels);
            data.push(weekData);

            // Move to the previous week
            currentDate.setDate(currentDate.getDate() - 7);
        }

        const AverageDiscounts = {
            labels: labels,
            data: data
        }

        console.debug(AverageDiscounts);

        res.status(200).json(AverageDiscounts);

    } catch (error){
        console.error('Error fetching chart2 data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

function calculateAverageDiscountPercentage(category, subcategory, currentDate, i) {
    console.debug('Calculating average discount percentage for the day: ' + currentDate.toDateString());
    console.debug('Category: ' + category);
    console.debug('Subcategory: ' + subcategory);
    console.debug('Day of the week: ' + i);

    const relevantItems = stock.filter((item) => {
        return (
            (item.category === category) &&
            (subcategory === "0" || item.subcategory === subcategory) &&
            new Date(item.discount.date).toDateString() === currentDate.toDateString()
        );
    });

    if (relevantItems.length === 0) {
        console.debug('No relevant items found for the day.');
        return 0;
    }

    const totalDiscountPercentage = relevantItems.reduce((sum, item) => {
        const previousPrice = item.price + item.discount.discount_price;
        const currentPrice = item.price;
        const discountPercentage = ((previousPrice - currentPrice) / previousPrice) * 100;
        return sum + discountPercentage;
    }, 0);

    const averagePercentage = totalDiscountPercentage / relevantItems.length;

    console.debug('Average discount percentage for the day: ' + averagePercentage);

    return averagePercentage;
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