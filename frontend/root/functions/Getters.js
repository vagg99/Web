const config = require('../../config.json');
module.exports = {
    getAllItems : async function () {
        const response = await fetch(`${config.backend.url}:${config.backend.port}/items`);
        const items = await response.json();
        return items;
    },
    getAllDiscounts : async function (){
        const response = await fetch(`${config.backend.url}:${config.backend.port}/getDiscountedItems?shopId=all`);
        const discounts = await response.json();
        return discounts;
    },
    getAllStores : async function () {
        const response = await fetch(`${config.backend.url}:${config.backend.port}/stores`);
        const stores = await response.json();
        return stores;
    }
}