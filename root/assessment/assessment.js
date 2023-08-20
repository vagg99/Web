document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const shopId = params.get('shopId');

    const response = await fetch(`http://localhost:3000/getDiscountedItems?shopId=${shopId}`);
    const data = await response.json();
    const {discountedItems,shopName} = data;

    const productList = document.getElementById("productContainer");

    discountedItems.forEach(item => {
        addProduct(item, shopName , productList);
    });

});

let choiceTimeouts = {}; // Object to store choice timeouts for each product
const cooldownDuration = 3000; // 5 seconds in milliseconds

function addProduct(item, shopName, productList) {
    const DiscountId = item._id; // <- Το χρησιμοποιοώ ~Νεκτάριος
    const productName = item.item.name;
    const price = item.discount_price;
    const date = item.date;
    let likes = item.likes;
    let dislikes = item.dislikes;
    let in_stock = item.in_stock;
    const product_image_link = item.item.img;
    const username = item.user.username;
    const totalPoints = item.user.points.total;

    const newProductItem = document.createElement("li");
    newProductItem.classList.add("product-item");
    newProductItem.innerHTML = `
        <div class="product-header">
            <p class="offer-text">${shopName} ΠΡΟΣΦΟΡΑ!</p>
            <img src="${product_image_link}" alt="Product Image" class="product-image">
            <h2>${productName}</h2>
        </div>
        <div class="product-details">
            <p class="price">Τιμή: ${price}€</p>
            <p class="date">Η προσφορά υποβλήθηκε στις ${date}</p>
            <p>Η Προσφορά υποβλήθη απο το Χρήστη ${username} με ${totalPoints} συνολικούς Πόντους</p>
            <div class="buttons">
                <p>Likes: </p><p class="likes">${likes}</p>
                <p>Dislikes: </p><p class="dislikes">${dislikes}</p>
                <button class="like-button ${!in_stock ? 'disabled inactive' : ''}" data-product-id="${DiscountId}">Like</button>
                <button class="dislike-button ${!in_stock ? 'disabled inactive' : ''}" data-product-id="${DiscountId}">Dislike</button>
                <button class="instock-button" data-product-id="${DiscountId}" >In Stock</button>
            </div>
        </div>
    `;

    const likeButton = newProductItem.querySelector(".like-button");
    const dislikeButton = newProductItem.querySelector(".dislike-button");
    const instockButton = newProductItem.querySelector(".instock-button");

    const likeCountElement = newProductItem.querySelector(".likes");
    const dislikeCountElement = newProductItem.querySelector(".dislikes");

    instockButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent event from propagating to parent
        instockButton.classList.toggle("active");
        in_stock = !in_stock;
        const productId = event.currentTarget.dataset.productId;
        updateChoiceTimeout(productId, {likes : likes , dislikes : dislikes ,in_stock : in_stock});
        if (in_stock) {
            likeButton.classList.remove("disabled");
            dislikeButton.classList.remove("disabled");
            likeButton.classList.remove("inactive");
            dislikeButton.classList.remove("inactive");
        } else {
            likeButton.classList.add("disabled");
            dislikeButton.classList.add("disabled");
            likeButton.classList.add("inactive");
            dislikeButton.classList.add("inactive");
        }
    });

    likeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (likeButton.classList.contains("active")) {
            likes = updateLikeCount(likeButton, likeCountElement, likes);
        } else if (dislikeButton.classList.contains("active")) {
            likes = updateLikeCount(likeButton, likeCountElement, likes);
            dislikes = updateDislikeCount(dislikeButton, dislikeCountElement, dislikes);
        } else {
            likes = updateLikeCount(likeButton, likeCountElement, likes);
            dislikeButton.classList.remove("active");
        }
        likeButton.classList.toggle("active");
        dislikeButton.classList.remove("active");
        const productId = event.currentTarget.dataset.productId;
        updateChoiceTimeout(productId, {likes : likes , dislikes : dislikes ,in_stock : in_stock});
    });
    
    dislikeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (dislikeButton.classList.contains("active")) {
            dislikes = updateDislikeCount(dislikeButton, dislikeCountElement, dislikes);
        } else if (likeButton.classList.contains("active")) {
            dislikes = updateDislikeCount(dislikeButton, dislikeCountElement, dislikes);
            likes = updateLikeCount(likeButton, likeCountElement, likes);
        } else {
            dislikes = updateDislikeCount(dislikeButton, dislikeCountElement, dislikes);
            likeButton.classList.remove("active");
        }
        dislikeButton.classList.toggle("active");
        likeButton.classList.remove("active");
        const productId = event.currentTarget.dataset.productId;
        updateChoiceTimeout(productId, {likes : likes , dislikes : dislikes , in_stock : in_stock});
    });

    newProductItem.addEventListener("click", () => {
        newProductItem.classList.toggle("expanded");
    });

    productList.appendChild(newProductItem);
};

function updateLikeCount(button, countElement, count) {
    if (button.classList.contains("active")) {
        count--;
    } else {
        count++;
    }
    countElement.textContent = count;
    return count;
}

function updateDislikeCount(button, countElement, count) {
    if (button.classList.contains("active")) {
        count--;
    } else {
        count++;
    }
    countElement.textContent = count;
    return count;
}

function updateChoiceTimeout(productId, data) {
    clearTimeout(choiceTimeouts[productId]);
    choiceTimeouts[productId] = setTimeout(() => {
        sendChoiceToBackend(productId, data);
    }, cooldownDuration);
}

async function sendChoiceToBackend(productId, data) {
    // Send the choice for the specific product to the backend here
    console.log(`Sending data to backend for product ${productId}: ${JSON.stringify(data)}`);

    try {
        const response = await fetch(`http://localhost:3000/assessment?discountId=${productId}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.text();
        console.log(`Sent to db : ${response.ok} , Result : ${result}`);
    } catch (error) {
        console.error('Error sending data to backend:', error);
    }
}