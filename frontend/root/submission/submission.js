document.addEventListener('DOMContentLoaded', async () => {
  // Get references to the loader elements
  const loaderContainer = document.getElementById('loader-container');
  const loader = document.getElementById('loader');

  const params = new URLSearchParams(window.location.search);
  const shopId = params.get('shopId');

  const shopTitle = document.getElementById("shopTitle");
  //shopTitle.innerHTML = `Στο μαγαζί  ${shopId}`;

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
  productDiv.innerHTML = `
          <img src="${product.item.img}" alt="${product.item.name}" width="100">
          <p>${product.item.name}</p>
          ${product.on_discount ? "<p>Σε προσφορά</p>" : ""}
          <p>${product.on_discount ? ("Απο <s>"+product.price+"</s> - μοοονο : "+product.discount.discount_price) : product.price}€ !</p>
          <p>Στο Μαγαζί ${product.store.tags.name}</p>
          <p>Διαθέσιμο : ${product.in_stock ? "ναι" : "οχι"}</p>
          <input type="number" placeholder="Εισάγετε τιμή προσφοράς">
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