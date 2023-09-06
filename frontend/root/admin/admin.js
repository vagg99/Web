document.addEventListener('DOMContentLoaded', async () => {


  // hamburger menu
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const loader = document.querySelector(".loader");


  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });
  // Upload data to the database

  const fileInput = document.getElementById('jsonFileInput');
  const uploadItemsButton = document.getElementById('uploadItemsButton');
  const uploadStoresButton = document.getElementById('uploadStoresButton');
  const uploadStockButton = document.getElementById('uploadStockButton');
  const deleteItemsButton = document.getElementById('deleteItemsButton');
  const deleteStoresButton = document.getElementById('deleteStoresButton');
  const deleteStockButton = document.getElementById('deleteStockButton');
  const messageDiv = document.getElementById('uploadMessage');

  uploadItemsButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      say(messageDiv, 'Please select a file.');
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = async function(event) {
        const jsonData = JSON.parse(event.target.result);
        // Upload the modified data to the "items" collection
        await uploadDataToCollection('items', jsonData.products);
        await uploadDataToCollection('categories', jsonData.categories);
    };
    fileReader.readAsText(file);
  });
  uploadStoresButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      say(messageDiv, 'Please select a file.');
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = async function(event) {
        const jsonData = JSON.parse(event.target.result);
        await uploadDataToCollection('stores', jsonData);
    };
    fileReader.readAsText(file);
  });
  uploadStockButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      say(messageDiv, 'Please select a file.');
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = async function(event) {
        const jsonData = JSON.parse(event.target.result);
        await uploadDataToCollection('stock', jsonData);
    };
    fileReader.readAsText(file);
  });

  async function uploadDataToCollection(collectionName, jsonData) {
    try {
      const response = await fetch(`http://localhost:3000/upload?collection=${collectionName}`, {
          method: 'POST',
          body: JSON.stringify(jsonData),
          headers: {
              'Content-Type': 'application/json'
          }
      });

      const result = await response.text();

      if (response.ok) {
          say(messageDiv, result);
      } else {
          say(messageDiv, result);
      }
    } catch (error) {
        console.error('Error uploading data:', error);
        say(messageDiv, 'An error occurred.');
    }
  }

  deleteItemsButton.addEventListener('click', async () => {
    deleteAlldataInCollection('items');
    deleteAlldataInCollection('categories');
  });
  deleteStoresButton.addEventListener('click', async () => deleteAlldataInCollection('stores'));
  deleteStockButton.addEventListener('click', async () => deleteAlldataInCollection('stock'));

  async function deleteAlldataInCollection(collectionName){
    const confirmDelete = confirm(`Σίγουρα θες να διαγράψεις όλα τα δεδομένα στην ΒΔ στο collection ονομα "${collectionName}" ?}`);
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:3000/delete?collection=${collectionName}`, {
            method: 'POST',
        });

        const result = await response.text();

        if (response.ok) {
          say(messageDiv, result);
        } else {
          say(messageDiv, result);
        }
      } catch (error) {
        console.error('Error deleting data:', error);
        say(messageDiv, 'An error occurred.');
      }
    }
  }

  // LEADERBOARD

  document.getElementById('refresh-button').addEventListener('click', refreshLeaderboard);
  // Initially load the leaderboard
  refreshLeaderboard();

  // CHARTS
  // chart 1 button
  document.getElementById('generate-graph-button').addEventListener('click', generateGraph);

  // chart 2 button
  document.getElementById('generate-graph-button2').addEventListener('click', generateGraph2);

  // Populate categories
  items.categories = await getCategories();
  populateCategories();

  stock = await getAllDiscounts();

  console.log(stock)

});

function say(messageDiv, message){
  messageDiv.innerText += message;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.innerText = '';
    messageDiv.style.display = 'none';
  }, 3000); // Clear admin message after 3 seconds
}

const m = ["Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου", "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου"];

const d = new Date();
let month = m[d.getMonth()];

const playersPerPage = 10;

async function fetchPlayersData() {
  try {
    const response = await fetch("http://localhost:3000/leaderboard");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching player data:', error);
    return [{username:"No Player",tokens:{total:1337,monthly:1337},points:1337}];
  }
}

async function refreshLeaderboard() {
  try {
      const players = await fetchPlayersData();
      displayPlayers(1, players);
      displayPagination(players.length);
  } catch (error) {
      console.error('Error refreshing leaderboard:', error);
  }
}

function displayPlayers(page, players) {
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';

  const startIndex = (page - 1) * playersPerPage;
  const endIndex = startIndex + playersPerPage;
  const playersToShow = players.slice(startIndex, endIndex);



  playersToShow.forEach((player, index) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <span class="item-user">${player.username}</span>
        <span class="item-month-tokens">${player.tokens["monthly"]}</span>
        <span class="item-tokens">${player.tokens["total"]}</span>
        <span class="item-points">${player.points}</span>
      `;
      leaderboardList.appendChild(listItem);
  });

  
}

function displayPagination(length) {
  const totalPages = Math.ceil(length / playersPerPage);
  const paginationContainer = document.querySelector('.pagination');
  paginationContainer.innerHTML = '';

  // previous arrow
  const prevArrow = document.createElement('span');
  prevArrow.id = 'prevPage';
  prevArrow.className = 'arrow';
  prevArrow.innerHTML = '&#9664;';
  paginationContainer.appendChild(prevArrow);

  for (let page = 1; page <= totalPages; page++) {
      const pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.textContent = page;

      pageLink.addEventListener('click', () => {
          displayPlayers(page);
      });

      paginationContainer.appendChild(pageLink);
  }

  //next arrow
  const nextArrow = document.createElement('span');
  nextArrow.id = 'nextPage';
  nextArrow.className = 'arrow';
  nextArrow.innerHTML = '&#9654;';
  paginationContainer.appendChild(nextArrow);

}

let stock = {};

//GRAPH 1
let Chart1 = null;


// Function to generate the graph for the first chart
async function generateGraph() {
  const selectedDate = document.getElementById('datePicker').value;
  
  if (!selectedDate) {
    alert("Παρακαλώ επιλέξτε μια ημερομηνία.");
    return;
  }

  // Clear the existing chart if it exists
  if (Chart1) {
    Chart1.destroy();
  }

  const year = selectedDate.split('-')[0];
  const month = selectedDate.split('-')[1];

  const filteredStock = stock.filter(item => {
    const itemDate = new Date(item.discount.date);
    return itemDate.getFullYear() === parseInt(year) && itemDate.getMonth() === parseInt(month) - 1;
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const discountCounts = new Array(daysInMonth).fill(0);

  filteredStock.forEach(item => {
    const itemDate = new Date(item.discount.date);
    const day = itemDate.getDate();
    discountCounts[day - 1]++;
  });

  const ctx = document.getElementById('discountGraph').getContext('2d');
  Chart1 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
      datasets: [{
        label: 'Discount Counts',
        data: discountCounts,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: function(value, index, values) {
              // Ensure that only integer values are displayed
              if (Number.isInteger(value)) {
                return value;
              }
            }
          }
        }
      }
    }
  });
}

//GRAPH 2
let Chart2 = null;
async function generateGraph2() {
  const category = document.getElementById('category').value;
  const subcategory = document.getElementById('subcategory').value;

  if (category == "0" ){
    alert("CHART2 : Παρακαλώ επιλέξτε κατηγορία");
    return;
  }

  // Clear the existing chart if it exists
  if (Chart2) {
    Chart2.destroy();
  }

  const today = new Date(stock[0].discount.date);
  const ctx = document.getElementById('discountGraph2').getContext('2d');

  const labels = [];
  const data = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - i);
    const averageDiscountPercentage = calculateAverageDiscountPercentage(category, subcategory, currentDate);
    
    // Format date to 'day/month' and add it to labels
    const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
    labels.unshift(formattedDate);
    
    // Add average discount percentage to data
    data.unshift(averageDiscountPercentage);
  }

  Chart2 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Average Discount Percentage',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: function (value, index, values) {
              // Ensure that only integer values are displayed
              if (Number.isInteger(value)) {
                return value;
              }
            }
          }
        }
      }
    }
  });
}

function calculateAverageDiscountPercentage(category, subcategory, date) {
  const currentWeekStart = new Date(date);
  currentWeekStart.setHours(0, 0, 0, 0 - currentWeekStart.getDay() * 24 * 60 * 60 * 1000);
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

  const relevantItems = stock.filter((item) => {
    return (
      (item.category === category) &&
      (subcategory === "0" || item.subcategory === subcategory) &&
      new Date(item.discount.date) >= currentWeekStart &&
      new Date(item.discount.date) <= currentWeekEnd
    );
  });

  const totalDiscountPercentage = relevantItems.reduce((sum, item) => {
    const previousPrice = item.price + item.discount.discount_price;
    const currentPrice = item.price;
    const discountPercentage = ((previousPrice - currentPrice) / previousPrice) * 100;
    return sum + discountPercentage;
  }, 0);

  return totalDiscountPercentage / relevantItems.length;
}


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
async function getCategories() {
  const response = await fetch('http://localhost:3000/getSubcategories');
  const categories = await response.json();
  return categories;
}
async function getAllDiscounts(){
  const response = await fetch('http://localhost:3000/getDiscountedItems?shopId=all');
  const discounts = await response.json();
  return discounts;
}