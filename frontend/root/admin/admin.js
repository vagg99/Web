document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('jsonFileInput');
  const uploadItemsButton = document.getElementById('uploadItemsButton');
  const uploadStoresButton = document.getElementById('uploadStoresButton');
  const deleteItemsButton = document.getElementById('deleteItemsButton');
  const deleteStoresButton = document.getElementById('deleteStoresButton');
  const messageDiv = document.getElementById('uploadMessage');

  // Create a chart in the graphs-container
  const graphsContainer = document.querySelector('.graphs-container');
  const chartCanvas = document.createElement('canvas');
  chartCanvas.id = 'myChart'; // Make sure this matches the canvas id in your HTML
  graphsContainer.appendChild(chartCanvas);

  // Create the chart using Chart.js
  // εδώ θα έχει στατιστική απεικόνιση στο chart

  var ctx = chartCanvas.getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Category 1', 'Category 2', 'Category 3'], // Customize your labels
      datasets: [
        {
          label: 'Sales',
          data: [10, 20, 30], // Customize your data
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)'], // Customize your colors
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'], // Customize your border colors
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });


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