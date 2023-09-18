// Διαχειριστής : 3) Απεικόνιση Στατιστικών

const { getData } = require('../utils/connectToDB.js');
const cache = require('../utils/cache.js');

async function handleDiscountCounts(req, res) {
    try {
        const { year, month , daysInMonth } = req.query;

        const stock = await getData('stock');

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

module.exports = { handleDiscountCounts };