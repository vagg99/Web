document.addEventListener('DOMContentLoaded', async () => {

  items = await getAllItems();

  populateCategories();
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
      if (product.subcategory == selectedSubcategoryUuid) {
        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = product.name;
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
        return product.name.toLowerCase().includes(query.toLowerCase());
    });
    return filteredProducts;
}

// Function to display search results
function displayResults(results) {
    productResults.innerHTML = '';
    results.forEach(product => {
    const productDiv = document.createElement('div');
        productDiv.innerHTML = `
            <img src="${product.img}" alt="${product.name}" width="100">
            <p>${product.name}</p>
            <input type="number" placeholder="Εισάγετε τιμή προσφοράς">
            <button class="submit-button">Υποβολή</button>
            `;
            productDiv.querySelector('.submit-button').addEventListener('click', () => {
                const priceInput = productDiv.querySelector('input[type="number"]');
                const price = priceInput.value;
                if (price !== '') {
                    // Τροποποίηση για να περαστούν στη βάση δεδομένων
                    console.log(`Submitted price for ${product.name}: ${price}`);
                }
            });
            productResults.appendChild(productDiv);
    });
}

// Event listener for search input
searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    const filteredProducts = filterProducts(query);
    displayResults(filteredProducts);
});

//Same functionality as above, but with the dropdown list
const productDropdown = document.getElementById('product');

productDropdown.addEventListener('change', () => {
  const selectedProductId = productDropdown.value;
  if (selectedProductId !== '0') {
      const selectedProduct = items.products.find(product => product.id === selectedProductId);
      displaySelectedProduct(selectedProduct);
  }
});

function displaySelectedProduct(product) {
  productResults.innerHTML = '';
  const productDiv = document.createElement('div');
  productDiv.innerHTML = `
      <img src="${product.img}" alt="${product.name}" width="100">
      <p>${product.name}</p>
      <input type="number" placeholder="Εισάγετε τιμή προσφοράς">
      <button class="submit-button">Υποβολή</button>
      `;
      productDiv.querySelector('.submit-button').addEventListener('click', () => {
          const priceInput = productDiv.querySelector('input[type="number"]');
          const price = priceInput.value;
          if (price !== '') {
              // Τροποποίηση για να περαστούν στη βάση δεδομένων
              console.log(`Submitted price for ${product.name}: ${price}`);
          }
      });
      productResults.appendChild(productDiv);
}

async function getAllItems() {
  const response = await fetch('http://localhost:3000/items');
  const items = await response.json();
  return items;
}