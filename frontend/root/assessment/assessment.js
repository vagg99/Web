document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const shopId = params.get('shopId');

    const response = await fetch(`http://localhost:3000/getDiscountedItems?shopId=${shopId}`);
    const discountedItems = await response.json();

    let shopName = "this shop has no items";
    if (discountedItems) shopName = discountedItems[0].store.tags.name;
    const pageTitle = document.getElementById("page-title");
    pageTitle.innerHTML = shopName;


    console.log(discountedItems);

    const productList = document.getElementById("productContainer");

    discountedItems.forEach(item => {
        addProduct(item, productList);
    });

});

const userPoints = {}; 
let choiceTimeouts = {}; // Object to store choice timeouts for each product
const cooldownDuration = 4000; // 2 seconds in milliseconds

function addProduct(item, productList) {
    const DiscountId = item._id;
    const productName = item.item.name;
    const shopName = item.store.tags.name;
    const price = item.discount.discount_price;
    const date = item.discount.date;
    let likes = item.discount.likes;
    let dislikes = item.discount.dislikes;
    let in_stock = item.in_stock;
    const product_image_link = item.item.img;
    const achievements = item.discount.achievements;
    const username = item.user.username;
    const totalPoints = (item.user.points["monthly"] >= 0) ? item.user.points["total"] + item.user.points["monthly"] : item.user.points["total"];
    const stockClass = in_stock ? "in-stock" : "out-of-stock";

    if (!userPoints[username]) { userPoints[username] = 0; }

    const newProductItem = document.createElement("li");
    newProductItem.classList.add("product-item", stockClass); // Add the stock class here

    newProductItem.innerHTML = `
        <div class="product-header">
            <img src="${product_image_link}" alt="Product Image" class="product-image">
            <div class="product-details-container">
                <div class="product-details">
                    <div class="info">
                        <h3 class="product-name">${productName}</h3>
                        <p class="price">Τιμή: ${price}€</p>
                        <p class="date">Η προσφορά υποβλήθηκε στις ${date}</p>
                        <p>Η Προσφορά υποβλήθηκε απο το Χρήστη ${username} με ${totalPoints} συνολικούς Πόντους</p>
                        ${achievements['5_a_i'] ? `<p>Επίτευγμα 5_a_i : </p><img src="../images/5_a_i.ico" alt="5_a_i_complete" class="icon">` : ''}
                        ${achievements['5_a_ii'] ? `<p>Επίτευγμα 5_a_ii : </p><img src="../images/5_a_ii.ico" alt="5_a_ii_complete" class="icon">` : ''}
                    </div>
                </div>
                <button class="instock-button" data-product-id="${DiscountId}" >${in_stock ? 'In Stock' : 'Out of Stock'}</button>
            </div>
            <div class="likes-dislikes">
                <div class="rating">
                <!-- Thumbs up -->
                    <p>Likes: <span class="likes ">${likes}</span></p>
                    <p>Dislikes: <span class="dislikes">${dislikes}</span></p>
                        <button class="like-button ${!in_stock ? 'disabled inactive' : ''}" data-product-id="${DiscountId}">
                        <i class="fas fa-thumbs-up fa-3x like" aria-hidden="true"></i>
                        </button>
                        <button class="dislike-button ${!in_stock ? 'disabled inactive' : ''}" data-product-id="${DiscountId}">
                        <i class="fas fa-thumbs-down fa-3x like" aria-hidden="true"></i>
                        </button>
                </div>
            </div>
        </div>
    `;

    const likeButton = newProductItem.querySelector(".like-button");
    const dislikeButton = newProductItem.querySelector(".dislike-button");
    const instockButton = newProductItem.querySelector(".instock-button");

    const likeCountElement = newProductItem.querySelector(".likes");
    const dislikeCountElement = newProductItem.querySelector(".dislikes");

    instockButton.addEventListener("click", (event) => {
        event.stopPropagation();
        instockButton.classList.toggle("active");
        in_stock = !in_stock;
        const productId = event.currentTarget.dataset.productId;
        updateChoiceTimeout(productId, { likes: likes, dislikes: dislikes, in_stock: in_stock });
    
        if (in_stock) {
            // Swap from "Out of Stock" to "In Stock"
            instockButton.textContent = "In Stock";
            likeButton.style.display = "inline-block";
            dislikeButton.style.display = "inline-block";
            instockButton.style.transform = "none";
            newProductItem.classList.remove("out-of-stock");
            newProductItem.classList.add("product-item");
            likeButton.classList.remove("disabled");
            dislikeButton.classList.remove("disabled");
        } else {
            // Mark as "Out of Stock" using the common function
            markAsOutOfStock();
        }
    });
    

    likeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        let action = "like";
        if (likeButton.classList.contains("active")) {
            likes = updateLikeCount(likeButton, likeCountElement, likes, username);
            action = "unlike";
        } else if (dislikeButton.classList.contains("active")) {
            likes = updateLikeCount(likeButton, likeCountElement, likes, username);
            dislikes = updateDislikeCount(dislikeButton, dislikeCountElement, dislikes, username);
        } else {
            likes = updateLikeCount(likeButton, likeCountElement, likes, username);
            dislikeButton.classList.remove("active");
        }
        likeButton.classList.toggle("active");
        dislikeButton.classList.remove("active");
        const productId = event.currentTarget.dataset.productId;
        updateChoiceTimeout(productId, {likes : likes , dislikes : dislikes ,in_stock : in_stock, action: action});
    });
    
    dislikeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        let action = "dislike";
        if (dislikeButton.classList.contains("active")) {
            dislikes = updateDislikeCount(dislikeButton, dislikeCountElement, dislikes, username);
            action = "undislike";
        } else if (likeButton.classList.contains("active")) {
            dislikes = updateDislikeCount(dislikeButton, dislikeCountElement, dislikes, username);
            likes = updateLikeCount(likeButton, likeCountElement, likes, username);
        } else {
            dislikes = updateDislikeCount(dislikeButton, dislikeCountElement, dislikes, username);
            likeButton.classList.remove("active");
        }
        dislikeButton.classList.toggle("active");
        likeButton.classList.remove("active");
        const productId = event.currentTarget.dataset.productId;
        updateChoiceTimeout(productId, {likes : likes , dislikes : dislikes , in_stock : in_stock , action: action});
    });

    newProductItem.addEventListener("click", () => {
        newProductItem.classList.toggle("expanded");
    });

    if (!in_stock) {
        markAsOutOfStock();
    }

    // Function to update the UI when the product is marked as "Out of Stock"
    function markAsOutOfStock() {
        instockButton.textContent = "Out of Stock";
        instockButton.classList.add("out-of-stock-button");
        newProductItem.classList.add("out-of-stock");
        newProductItem.classList.remove("product-item");
        newProductItem.classList.remove("expanded");
        likeButton.classList.add("disabled");
        dislikeButton.classList.add("disabled");
    }

    productList.appendChild(newProductItem);
};

function updateLikeCount(button, countElement, count, username) {
    if (button.classList.contains("active")) {
        count--;
        userPoints[username] -= 5; // Remove 5 points for removing a like
    } else {
        count++;
        userPoints[username] += 5; // Add 5 points for getting a like
    }
    countElement.textContent = count;
    return count;
}

function updateDislikeCount(button, countElement, count, username) {
    if (button.classList.contains("active")) {
        count--;
        userPoints[username] += 1; // Add 1 point for removing a dislike
    } else {
        count++;
        userPoints[username] -= 1; // Remove 1 point for getting a dislike
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

async function sendChoiceToBackend(productId, likes_dislikes_in_stock) {
    // Send the choice for the specific product to the backend here
    console.log(`Sending data to backend for product ${productId}: ${JSON.stringify(likes_dislikes_in_stock)}`);
    console.log(`points : ${JSON.stringify(userPoints)}`);
    const data = {
        likes: likes_dislikes_in_stock.likes,
        dislikes: likes_dislikes_in_stock.dislikes,
        in_stock: likes_dislikes_in_stock.in_stock,
        action : likes_dislikes_in_stock.action ? likes_dislikes_in_stock.action : null,
        points: userPoints
    };
    try {
        const response = await fetch(`http://localhost:3000/assessment?discountId=${productId}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        const result = await response.text();
        console.log(`Sent to db : ${response.ok} , Result : ${result}`);
    } catch (error) {
        console.error('Error sending data to backend:', error);
    }
}