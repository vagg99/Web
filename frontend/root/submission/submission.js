const loaderContainer = document.getElementById('loader-container');
const loadingText = document.getElementById('loading-text');

document.addEventListener('DOMContentLoaded', async () => {

  // hamburger menu
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  const searchInput = document.getElementById('searchInput');
  const params = new URLSearchParams(window.location.search);
  const shopId = params.get('shopId');

  const shopTitle = document.getElementById("shopTitle");

  const categorySelect = document.getElementById("category");
  const subcategoryContainer = document.getElementById("subcategory-container");
  const subcategorySelect = document.getElementById("subcategory");
  const productContainer = document.getElementById("product-container");
  const productSelect = document.getElementById("product");

  // Function to clear placeholder text on focus "Αναζήτηση προϊόντος..."
  searchInput.addEventListener('focus', () => {
    searchInput.placeholder = '';
  });

  // Function to restore placeholder text on blur (when focus is lost)
  searchInput.addEventListener('blur', () => {
    searchInput.placeholder = 'Αναζήτηση προϊόντος...';
  });

  // Event listener for category selection
  categorySelect.addEventListener("change", () => {
    const selectedCategoryId = categorySelect.value;

    if (selectedCategoryId !== "0") {
      // Show the subcategory container and populate subcategories
      subcategoryContainer.style.display = "block";
      populateSubcategories(selectedCategoryId);
    } else {
      // Hide the subcategory and product containers
      subcategoryContainer.style.display = "none";
      productContainer.style.display = "none";
    }
  });

  // Event listener for subcategory selection
  subcategorySelect.addEventListener("change", () => {
    const selectedSubcategoryId = subcategorySelect.value;

    if (selectedSubcategoryId !== "0") {
      // Show the product container and populate products
      productContainer.style.display = "block";
      populateProducts(selectedSubcategoryId);
    } else {
      // Hide the product container
      productContainer.style.display = "none";
    }
  });

  items = { products : [{id:"1337",name:"no product"}], categories : [] };

  items.categories = await getCategories();

  populateCategories();

  shopTitle.innerHTML = `Στο κατάστημα ${shopId}`;

  try {
    items.products = await getItemsInStock(shopId);
    shopTitle.innerHTML = `${items.products[0].store.tags.name}`;
  } catch (error){
    alert("Αυτο το κατάστημα δεν εχει αντικείμενα στο stock του");
    shopTitle.innerHTML = "Αυτο το κατάστημα δεν εχει αντικείμενα στο stock του\n Shop Id : " + shopId;
  }

  console.log(items.products);

  // Hide the loader by fading it out
  loaderContainer.style.opacity = 0;
  loaderContainer.style['z-index'] = -1;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  }));

  // if you scroll down the hamburger menu will disappear
  window.addEventListener("scroll", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });


});

function showLoader() {
  loaderContainer.style.opacity = 1;
  loaderContainer.style.zIndex = 9998;
  loadingText.style.display = 'block';
  loadingText.style['z-index'] = 9999;
}
function hideLoader() {
  loaderContainer.style.opacity = 0;
  loaderContainer.style.zIndex = -1;
  loadingText.style.display = 'none';
  loadingText.style['z-index'] = -1;
}

// Sample data for categories, subcategories, and products
let items = {};

function populateCategories() {
  const categorySelect = document.getElementById("category");

  // Clear existing options
  categorySelect.innerHTML = '<option value="0">Επιλέξτε κατηγορία</option>';
    
  // Populate categories
  for (const category of items.categories) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  }
}

function populateSubcategories() {
  const categorySelect = document.getElementById("category");
  const subcategorySelect = document.getElementById("subcategory");
  const selectedCategoryId = categorySelect.value;

  // Clear existing options
  subcategorySelect.innerHTML = '<option value="0">Επιλέξτε υποκατηγορία</option>';

  // Populate subcategories based on the selected category
  if (selectedCategoryId) {
    const selectedCategory = items.categories.find(category => category.id === selectedCategoryId);
    for (const subcategory of selectedCategory.subcategories) {
      const option = document.createElement("option");
      option.value = subcategory.uuid;
      option.textContent = subcategory.name;
      subcategorySelect.appendChild(option);
    }
  }
}

function populateProducts() {
  const subcategorySelect = document.getElementById("subcategory");
  const productSelect = document.getElementById("product");
  const selectedSubcategoryUuid = subcategorySelect.value;

  // Clear existing options
  productSelect.innerHTML = '<option value="0">Επιλέξτε προϊόν</option>';

  // Populate products based on the selected subcategory
  if (selectedSubcategoryUuid) {
    for (const product of items.products) {
      if (product.item.subcategory == selectedSubcategoryUuid) {
        const option = document.createElement("option");
        option.value = product.item.id;
        option.textContent = product.item.name;
        productSelect.appendChild(option);
      }
    }
  }
}

const searchInput = document.getElementById('searchInput');
const productResults = document.getElementById('productResults');

// Function to filter products based on search input
function filterProducts(query) {
    const filteredProducts = items.products.filter(product => {
        return product.item.name.toLowerCase().includes(query.toLowerCase());
    });
    return filteredProducts;
}

// Event listener for search input
searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    const filteredProducts = filterProducts(query);
    productResults.innerHTML = '';
    filteredProducts.forEach(product => {
      displaySelectedProduct(product);
    });
});

//Same functionality as above, but with the dropdown list
const productDropdown = document.getElementById('product');

productDropdown.addEventListener('change', () => {
  const selectedProductId = productDropdown.value;
  const selectedProduct = items.products.find(product => product.item.id === selectedProductId);
  productResults.innerHTML = '';
  displaySelectedProduct(selectedProduct);
});

function displaySelectedProduct(product) {
  const productDiv = document.createElement('div');
 
  productDiv.classList.add('product-item');
  productDiv.innerHTML = `
        <div class="product-container">
          <div class="product" id="product-${product.item.id}">
            <img src="${product.item.img}" alt="${product.item.name}" width="100">
            <p>${product.item.name}</p>
            ${product.on_discount ? "<p>Σε προσφορά</p>" : ""}
            <p id="product-${product.item.id}-price">${product.on_discount ? ("Απο <s>"+product.price+"</s> - μοοονο : "+product.discount.discount_price) : product.price}€ !</p>
            <p>Στο κατάστημα ${product.store.tags.name}</p>
            <p>Διαθέσιμο : ${product.in_stock ? "ναι" : "οχι"}</p>
            <input type="number" placeholder="Εισάγετε τιμή προσφοράς">
            <button class="submit-button">Υποβολή</button>
          </div>
          <div class="message-container" id="message-container-${product.item.id}">
            <div class="message" id="message-${product.item.id}"></div>
          </div>
        </div>
  `;

    // Assuming you have a reference to your input field
    const priceInput = productDiv.querySelector('input[type="number"]');

    // Add a focus event listener to clear the placeholder text
    priceInput.addEventListener('focus', () => {
      priceInput.placeholder = ''; // Clear the placeholder text
    });
  
    // Add a blur event listener to restore the placeholder text if the input is empty
    priceInput.addEventListener('blur', () => {
      if (!priceInput.value) {
        priceInput.placeholder = 'Εισάγετε τιμή προσφοράς';
      }
    });
  
  productDiv.querySelector('.submit-button').addEventListener('click', () => {
    const priceInput = productDiv.querySelector('input[type="number"]');
    const price = priceInput.value;
    if (price !== '') {
      if (price < 0) {
        say(product.item.id, "Η τιμή πρέπει να είναι θετική");
        return;
      }

      if (price >= product.price) {
        say(product.item.id, "Η τιμή πρέπει να είναι μικρότερη απο την τιμή του προϊόντος");
        return;
      }

      if (product.on_discount && price >= product.discount.discount_price) {
        say(product.item.id, "Η τιμή πρέπει να είναι μικρότερη απο την τιμή της προσφοράς");
        return;
      }

      if (product.on_discount && !twenty_percent_smaller(price,product.discount.discount_price)) {
        say(product.item.id, "Η τιμή πρέπει να είναι τουλάχιστον 20% μικρότερη απο την τιμή της προσφοράς");
        return;
      }

      submitDiscount(product, price);
      showLoader();
    }
  });
  productResults.appendChild(productDiv);
}

// search form code here (outside any function)
const icon = document.querySelector(".icon");
const search = document.querySelector(".search");

icon.onclick = function () {
  search.classList.toggle("active");
};

const clearButton = document.querySelector(".clear");

clearButton.onclick = function () {
  document.getElementById('mysearch').value = '';
};

function twenty_percent_smaller(newprice, oldprice) {
  const twentyPercentOfOldPrice = 0.2 * oldprice;
  return (newprice <= oldprice - twentyPercentOfOldPrice)
}

async function getCategories() {
  const response = await fetch('http://localhost:3000/getSubcategories');
  const categories = await response.json();
  return categories;
}
async function getItemsInStock(shopId) {
  const response = await fetch(`http://localhost:3000/getStock?shopId=${shopId}`);
  const discounts = await response.json();
  return discounts;
}

function say(id, message) {
  const messageContainer = document.getElementById(`message-container-${id}`);
  messageContainer.style.display = 'block';
  const element = document.getElementById(`message-${id}`)
  element.innerHTML = message;
  element.style.display = 'block';
  setTimeout(() => {
    element.innerHTML = '';
    element.style.display = 'none';
    messageContainer.style.display = 'none';
  }, 3000);
}

async function submitDiscount(product, newprice) {
  const productId = product._id;
  const idForMessage = product.item.id;
  console.log(JSON.stringify({ productId, newprice }));

  let userId = "64ccdd565a5bb46dd07e5148"; // default, you can replace this with your user's ID

  try {
    const response = await fetch(`http://localhost:3000/submitDiscount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ productId, newprice, userId }),
    });

    const result = await response.json();

    if (response.ok) {
      // Show a SweetAlert2 success popup
      Swal.fire({
        icon: 'success',
        title: 'Επιτυχής υποβολή!',
        text: 'Η τιμή προσφοράς ανανεώθηκε με επιτυχία.',
        confirmButtonText: 'Εντάξει',
      });

      // Update the price displayed on the page
      const priceElement = document.getElementById(`product-${idForMessage}-price`);
      if (product.discount) {
        priceElement.innerHTML = `Απο <s>${product.price}</s> - <s>μοοονο : ${product.discount.discount_price}€ !</s> - μοοονο : ${newprice}€ !`;
      } else {
        priceElement.innerHTML = `Απο <s>${product.price}</s> - μοοονο : ${newprice}€ !`;
      }
    } else {
      // Show a SweetAlert2 error popup
      Swal.fire({
        icon: 'error',
        title: 'Αποτυχία υποβολής',
        text: `Αποτυχία υποβολής. ${result.error}`,
        confirmButtonText: 'Εντάξει',
        confirmButtonColor: '#6886ff'
      });
    }

    hideLoader();
  } catch (error) {
    console.error('Error uploading data:', error);
  }
}

