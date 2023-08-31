document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const shopId = params.get('shopId');

    const response = await fetch(`http://localhost:3000/getDiscountedItems?shopId=${shopId}`);
    const discountedItems = await response.json();
    
    console.log(discountedItems);

    const productList = document.getElementById("productContainer");

    discountedItems.forEach(item => {
        addProduct(item, productList);
    });

    function handleLikeDislikeButtons() {
        const likeButtons = document.querySelectorAll('.like');
        const dislikeButtons = document.querySelectorAll('.dislike');

        likeButtons.forEach(button => {
            button.addEventListener('click', function () {
                if (button.classList.contains('active')) {
                    button.classList.remove('active');
                } else {
                    likeButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                }
            });
        });

        dislikeButtons.forEach(button => {
            button.addEventListener('click', function () {
                if (button.classList.contains('active')) {
                    button.classList.remove('active');
                } else {
                    dislikeButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                }
            });
        });
    }

    handleLikeDislikeButtons(); 
});

const userPoints = {}; 
let choiceTimeouts = {}; // Object to store choice timeouts for each product
const cooldownDuration = 2000; // 2 seconds in milliseconds

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
    const totalPoints = item.user.points.total;

    if (!userPoints[username]) { userPoints[username] = 0; }

    const newProductItem = document.createElement("li");
    newProductItem.classList.add("product-item");
    newProductItem.innerHTML = `
    <div class="product-header">
        <img src="${product_image_link}" alt="Product Image" class="product-image">
        <div class="product-details-container">
            <div class="product-details">
                <div class="info">
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
                <p>Likes: <span class="likes">${likes}</span></p>
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
            likes = updateLikeCount(likeButton, likeCountElement, likes, username);
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
        updateChoiceTimeout(productId, {likes : likes , dislikes : dislikes ,in_stock : in_stock});
    });
    
    dislikeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (dislikeButton.classList.contains("active")) {
            dislikes = updateDislikeCount(dislikeButton, dislikeCountElement, dislikes, username);
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
        updateChoiceTimeout(productId, {likes : likes , dislikes : dislikes , in_stock : in_stock});
    });

    newProductItem.addEventListener("click", () => {
        newProductItem.classList.toggle("expanded");
    });

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

function getDiscountOriginalPoster(productId) {

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
        points: userPoints
    };
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