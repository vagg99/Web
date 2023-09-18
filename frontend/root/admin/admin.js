document.addEventListener('DOMContentLoaded', async () => {

  // hamburger menu
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const loader = document.querySelector(".loader");

  // hamburger menu functionality
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

  // Upload data to the database

  const fileInput = document.getElementById('jsonFileInput');
  const uploadItemsButton = document.getElementById('uploadItemsButton');
  const uploadStoresButton = document.getElementById('uploadStoresButton');
  const uploadStockButton = document.getElementById('uploadStockButton');
  const deleteItemsButton = document.getElementById('deleteItemsButton');
  const deleteStoresButton = document.getElementById('deleteStoresButton');
  const deleteStockButton = document.getElementById('deleteStockButton');
  const messageDiv = document.getElementById('uploadMessage');

  // Inside your event listener for the file input
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const fileName = file.name;
        document.getElementById('selectedFileName').textContent = `Selected File: ${fileName}`;
    } else {
        document.getElementById('selectedFileName').textContent = ''; // Clear the filename if no file is selected
    }
  });

  // filename appears on the input
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      const fileName = file.name;
      fileInput.nextElementSibling.innerText = fileName;
    }
  });

  uploadItemsButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      sayPopup('Παρακαλώ διαλέξτε ένα αρχείο για ανέβασμα.');
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
      sayPopup('Παρακαλώ διαλέξτε ένα αρχείο για ανέβασμα.');
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
      sayPopup('Παρακαλώ διαλέξτε ένα αρχείο για ανέβασμα.');
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
        sayPopup('An error occurred.');
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

let currentPage = 1; // Add a variable to keep track of the current page

async function refreshLeaderboard() {
  try {
      const players = await fetchPlayersData();
      displayPlayers(currentPage, players); // Display the current page
      displayPagination(players.length, players);
  } catch (error) {
      console.error('Error refreshing leaderboard:', error);
  }
}

function displayPlayers(page, players) {
  currentPage = page; // Update the current page
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

function displayPagination(length, players) {
  const totalPages = Math.ceil(length / playersPerPage);
  const paginationContainer = document.querySelector('.pagination');
  paginationContainer.innerHTML = '';

  // previous arrow
  const prevArrow = document.createElement('span');
  prevArrow.id = 'prevPage';
  prevArrow.className = 'arrow';
  prevArrow.innerHTML = '&#9664;';
  prevArrow.addEventListener('click', () => {
      if (currentPage > 1) {
          displayPlayers(currentPage - 1, players); // Display the previous page
      }
  });
  paginationContainer.appendChild(prevArrow);

  for (let page = 1; page <= totalPages; page++) {
      const pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.textContent = page;

      pageLink.addEventListener('click', (event) => {
        event.preventDefault();
        displayPlayers(page, players); // Display the clicked page
        window.scrollTo(0, document.body.scrollHeight);
      });

      paginationContainer.appendChild(pageLink);
  }

  //next arrow
  const nextArrow = document.createElement('span');
  nextArrow.id = 'nextPage';
  nextArrow.className = 'arrow';
  nextArrow.innerHTML = '&#9654;';
  nextArrow.addEventListener('click', () => {
      if (currentPage < totalPages) {
          displayPlayers(currentPage + 1, players); // Display the next page
      }
  });
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

  const daysInMonth = new Date(year, month, 0).getDate();

  const response = await fetch(`http://localhost:3000/getChart1Data?year=${year.toString()}&month=${month.toString()}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include'
  });

  const discountCounts = await response.json();

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
let AverageDiscounts = {data:[]};
async function generateGraph2() {
  const category = document.getElementById('category').value;
  const subcategory = document.getElementById('subcategory').value;

  if (category == "0" ){
    sayPopup("Παρακαλώ επιλέξτε κατηγορία");
    return;
  }

  // Clear the existing chart if it exists
  if (Chart2) {
    Chart2.destroy();
  }

  const response = await fetch(`http://localhost:3000/getChart2Data?category=${category.toString()}&subcategory=${subcategory.toString()}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include'
  });

  AverageDiscounts = await response.json();

  console.log(AverageDiscounts);

  const ctx = document.getElementById('discountGraph2').getContext('2d');
  Chart2 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: AverageDiscounts.labels[0],
      datasets: [{
        label: 'Average Discount Percentage',
        data: AverageDiscounts.data[0],
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

document.getElementById('previousWeekButton').addEventListener('click', showPreviousWeek);
document.getElementById('nextWeekButton').addEventListener('click', showNextWeek);

let currentWeekIndex = 0;

function showPreviousWeek() {
  if (Math.abs(currentWeekIndex) - 1 < AverageDiscounts.data.length - 1) {
    currentWeekIndex--;
    updateChart(currentWeekIndex);
  }
}

function showNextWeek() {
  if (currentWeekIndex < AverageDiscounts.data.length - 1) {
    currentWeekIndex++;
    updateChart(currentWeekIndex);
  }
}

function updateChart(weekIndex) {
  const weekChangeData = AverageDiscounts.data[weekIndex];
  const weekChangeLabels = AverageDiscounts.labels[weekIndex];
  console.log(weekChangeData);
  console.log(AverageDiscounts.data);
  Chart2.data.datasets[0].data = weekChangeData;
  Chart2.data.labels = weekChangeLabels;
  Chart2.update();
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

// use sweetalert2 for popup messages
function sayPopup(message) {
  Swal.fire({
    title: message,
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#0E3DC0'
  });
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