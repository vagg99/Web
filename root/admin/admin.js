const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const messageDiv = document.getElementById("message");

uploadButton.addEventListener("click", () => {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append("file", file);

        // You can send the formData to your server using fetch or another method
        // Replace 'upload_url' with the actual URL to handle file uploads on your server.
        // Example using fetch:
        fetch("upload_url", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            messageDiv.textContent = data.message; // Display a message returned from the server
        })
        .catch(error => {
            console.error("Error uploading file:", error);
            messageDiv.textContent = "An error occurred while uploading the file.";
        });
    } else {
        messageDiv.textContent = "Please select a file to upload.";
    }
});


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
      listItem.innerHTML = `<span>${startIndex + index + 1}. ${player.username}</span><span></span><span>${player.tokens["monthly"]} tokens ${month}</span><span>${player.tokens["total"]} Συνολικά tokens</span><span>${player.points} Συνολικοί Πόντοι</span>`;
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

document.getElementById('refresh-button').addEventListener('click', refreshLeaderboard);

// Initially load the leaderboard
refreshLeaderboard();