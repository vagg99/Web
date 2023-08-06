// Sample data for categories, subcategories, and products
const subcategoriesData = {
  1: [
    { id: 11, name: "Subcategory 1-1" },
    { id: 12, name: "Subcategory 1-2" },
    { id: 13, name: "Subcategory 1-3" }
  ],
  2: [
    { id: 21, name: "Subcategory 2-1" },
    { id: 22, name: "Subcategory 2-2" },
    { id: 23, name: "Subcategory 2-3" }
  ],
  3: [
    { id: 31, name: "Subcategory 3-1" },
    { id: 32, name: "Subcategory 3-2" },
    { id: 33, name: "Subcategory 3-3" }
  ]
};

const productsData = {
  11: [
    { id: 111, name: "Product 1-1-1" },
    { id: 112, name: "Product 1-1-2" },
    { id: 113, name: "Product 1-1-3" }
  ],
  12: [
    { id: 121, name: "Product 1-2-1" },
    { id: 122, name: "Product 1-2-2" },
    { id: 123, name: "Product 1-2-3" }
  ],
  // ... Add more products for other subcategories here ...
};

function populateSubcategories() {
  const categorySelect = document.getElementById("category");
  const subcategorySelect = document.getElementById("subcategory");
  const selectedCategoryId = categorySelect.value;

  // Clear existing options
  subcategorySelect.innerHTML = '<option value="0">Choose a subcategory</option>';

  // Populate subcategories based on the selected category
  if (selectedCategoryId in subcategoriesData) {
    const subcategories = subcategoriesData[selectedCategoryId];
    for (const subcategory of subcategories) {
      const option = document.createElement("option");
      option.value = subcategory.id;
      option.textContent = subcategory.name;
      subcategorySelect.appendChild(option);
    }
  }
}

function populateProducts() {
  const subcategorySelect = document.getElementById("subcategory");
  const productSelect = document.getElementById("product");
  const selectedSubcategoryId = subcategorySelect.value;

  // Clear existing options
  productSelect.innerHTML = '<option value="0">Choose a product</option>';

  // Populate products based on the selected subcategory
  if (selectedSubcategoryId in productsData) {
    const products = productsData[selectedSubcategoryId];
    for (const product of products) {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent = product.name;
      productSelect.appendChild(option);
    }
  }
}


// Example data - replace this with your actual data
const players = [
  { name: 'Player 1', score: 100 },
  { name: 'Player 2', score: 90 },
  { name: 'Player 3', score: 85 },
  { name: 'Player 4', score: 80 },
  { name: 'Player 5', score: 70 },
  { name: 'Player 6', score: 60 },
  { name: 'Player 7', score: 50 },
  { name: 'Player 8', score: 40 },
  { name: 'Player 9', score: 30 },
  { name: 'Player 10', score: 20 },
  { name: 'Player 11', score: 10 },
  { name: 'Player 12', score: 5 }
];

const playersPerPage = 10;

function displayPlayers(page) {
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';

  const startIndex = (page - 1) * playersPerPage;
  const endIndex = startIndex + playersPerPage;
  const playersToShow = players.slice(startIndex, endIndex);

  playersToShow.forEach((player, index) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<span>${startIndex + index + 1}. ${player.name}</span><span>${player.score} points</span>`;
      leaderboardList.appendChild(listItem);
  });
}

function displayPagination() {
  const totalPages = Math.ceil(players.length / playersPerPage);
  const paginationContainer = document.querySelector('.pagination');
  paginationContainer.innerHTML = '';

  for (let page = 1; page <= totalPages; page++) {
      const pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.textContent = page;

      pageLink.addEventListener('click', () => {
          displayPlayers(page);
      });

      paginationContainer.appendChild(pageLink);
  }
}

// Initially display the first page of players
displayPlayers(1);
// Display pagination links
displayPagination();
