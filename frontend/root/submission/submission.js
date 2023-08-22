const { getAllItems } = require('../functions/Getters.js');

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