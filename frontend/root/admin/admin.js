document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('jsonFileInput');
  const uploadItemsButton = document.getElementById('uploadItemsButton');
  const uploadStoresButton = document.getElementById('uploadStoresButton');
  const uploadStockButton = document.getElementById('uploadStockButton');
  const deleteItemsButton = document.getElementById('deleteItemsButton');
  const deleteStoresButton = document.getElementById('deleteStoresButton');
  const deleteStockButton = document.getElementById('deleteStockButton');
  const messageDiv = document.getElementById('uploadMessage');
  populateCategories();

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
        <span class="item">${player.username}</span>
        <span class="item">${player.tokens["monthly"]}</span>
        <span class="item">${player.tokens["total"]}</span>
        <span class="item">${player.points}</span>
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

document.getElementById('refresh-button').addEventListener('click', refreshLeaderboard);

// Initially load the leaderboard
refreshLeaderboard();


//GRAPH 1
async function generateGraph() {
  const year = parseInt(document.getElementById('year').value);
  const month = parseInt(document.getElementById('month').value);

  // Clear the existing chart if it exists
  const existingChart = Chart.getChart('discountGraph');
  if (existingChart) {
      existingChart.destroy();
  }

  const stock = [
  {
    "store_id": "354449389",
    "item_id": "3",
    "in_stock": true,
    "price": 4.56,
    "on_discount": true, 
    "discount" : {
        "discount_price": 3.25,
        "date": "2023-08-23",
        "likes": 9,
        "dislikes": 2,
        "achievements": {}
    },
    "user_id": "64ccdd565a5bb46dd07e5148",
    "category": "8016e637b54241f8ad242ed1699bf2da"
  },       
  {
    "store_id": "360217468",
    "item_id": "4",
    "in_stock": true,
    "price": 4.22,
    "on_discount": true, 
    "discount" : {
        "discount_price": 3.15,
        "date": "2023-08-23",
        "likes": 14,
        "dislikes": 3,
        "achievements": {}
    },
    "user_id": "64ccdd565a5bb46dd07e5148",
    "category": "8016e637b54241f8ad242ed1699bf2da"
  },    
  {
    "store_id": "354449389",
    "item_id": "4",
    "in_stock": true,
    "price": 4.89,
    "on_discount": true, 
    "discount" : {
        "discount_price": 3.45,
        "date": "2023-08-23",
        "likes": 18,
        "dislikes": 1,
        "achievements": {}
    },
    "user_id": "64ccdd565a5bb46dd07e5148",
    "category": "8016e637b54241f8ad242ed1699bf2da"
  }
  ];

  const filteredStock = stock.filter(item => {
      const itemDate = new Date(item.discount.date);
      return itemDate.getFullYear() === year && itemDate.getMonth() === (month - 1);
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const discountCounts = new Array(daysInMonth).fill(0);

  filteredStock.forEach(item => {
      const itemDate = new Date(item.discount.date);
      const day = itemDate.getDate();
      discountCounts[day - 1]++;
  });

  const ctx = document.getElementById('discountGraph').getContext('2d');
  const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
          datasets: [{
              label: 'Discount Counts',
              data: discountCounts,
              backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)'],
              borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
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