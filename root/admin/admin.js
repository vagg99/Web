document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('jsonFileInput');
  const uploadButton = document.getElementById('uploadButton');
  const messageDiv = document.getElementById('uploadMessage');

  uploadButton.addEventListener('click', async () => {
    const file = fileInput.files[0];

    if (!file) {
      say(messageDiv, 'Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('jsonFile', file);

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.text();

        if (response.ok) {
          say(messageDiv, result);
          fileInput.value = '';
        } else {
          say(messageDiv, result);
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        say(messageDiv, 'An error occurred.');
    }
  });
});

function say(messageDiv, message){
  messageDiv.innerText = message;
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
        <span class="item">${startIndex + index + 1}.${player.username}</span>
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

function displayheader() {
  const leaderboardHeader = document.getElementById('leaderboard-header');
  leaderboardHeader.innerHTML += `
    <span class="item">Χρήστης</span>
    <span class="item">Tokens ${month}</span>
    <span class="item">Συνολικά Tokens</span>
    <span class="item">Συνολικοί Πόντοι</span>
  `;
}

document.getElementById('refresh-button').addEventListener('click', refreshLeaderboard);

// add leaderboard header
displayheader();

// Initially load the leaderboard
refreshLeaderboard();