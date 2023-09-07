document.addEventListener('DOMContentLoaded', async () => {

  const searchInput = document.getElementById('searchInput');
  const params = new URLSearchParams(window.location.search);
  const shopId = params.get('shopId');

  const shopTitle = document.getElementById("shopTitle");
  //shopTitle.innerHTML = `Στο μαγαζί  ${shopId}`;

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

  shopTitle.innerHTML = `Στο μαγαζί loading.....`;

  items.products = await getItemsInStock(shopId);

  shopTitle.innerHTML = `Στο μαγαζί  ${items.products[0].store.tags.name}`;

  console.log(items.products);

  // Hide the loader by fading it out
  //loaderContainer.style.opacity = 0;

});

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
    <img src="${product.item.img}" alt="${product.item.name}" width="100">
    <p class="product-name">${product.item.name}</p>
    ${product.on_discount ? "<p class='discount-label'>Σε προσφορά</p>" : ""}
    <p class="product-price">${product.on_discount ? ("Απο <s>"+product.price+"</s> - μόνο : "+product.discount.discount_price) : product.price}€ !</p>
    <p class="store-name">Στο Μαγαζί ${product.store.tags.name}</p>
    <p class="availability">Διαθέσιμο : ${product.in_stock ? "ναι" : "οχι"}</p>
    <input class="price-input" type="text" placeholder="Εισάγετε τιμή προσφοράς">
    <button class="submit-button">Υποβολή</button>
  `;
  productDiv.querySelector('.submit-button').addEventListener('click', () => {
      const priceInput = productDiv.querySelector('input[type="number"]');
      const price = priceInput.value;
      if (price !== '') {
        submitDiscount(product._id, price);
      }
  });
  productResults.appendChild(productDiv);
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

async function submitDiscount(productId, newprice) {
  console.log(JSON.stringify({ productId, newprice }))

  let userId = "64ccdd565a5bb46dd07e5148"; // default , toy vaggeli nomizo

  try {
    const response = await fetch(`http://localhost:3000/submitDiscount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ productId, newprice , userId })
    });

    const result = await response.text();

    if (response.ok) {
        console.log("success!",result);
    } else {
        console.log("rip",result);
    }
  } catch (error) {
      console.error('Error uploading data:', error);
      say(messageDiv, 'An error occurred.');
  }
}