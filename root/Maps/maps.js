// Initialize the map 
var map = L.map('map')

// Add the tile layer (OpenStreetMap as an example)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Function to get the user's location and update the map view
function getUserLocation() {
  if ('geolocation' in navigator) {
    // Get the user's current position
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 15); // Set the view to user's location with zoom level 15
        L.marker([latitude, longitude] , { icon: CurrectLocationIcon })
          .addTo(map)
          .bindPopup('You are here!') // Custom popup message for the user's location
          .openPopup();
      },
      function(error) {
        console.error('Error getting user location:', error.message);
      }
    );
  } else {
    console.error('Geolocation is not available in this browser.');
  }
}

async function getAllStores() {
  const response = await fetch('http://localhost:3000/stores');
  const stores = await response.json();
  return stores;
}

async function displayAllStores(){
  const stores = await getAllStores();
  stores.forEach(store => {
    const { id, lat, lon } = store;
    const name = store.tags.name;
    L.marker([lat, lon])
      .addTo(map)
      .bindPopup(`<b>${name}</b>`)
      .openPopup();
  });
  // Current Location
  getUserLocation();
  // Patra
  //map.setView([38.24511060644045, 21.7364112438391], 15); // Set the provided coordinates and zoom level 15
}

const CurrentLocationColor = "#40e0d0";

function markerHtmlStyles(color) { return `
  background-color: ${color};
  width: 3rem;
  height: 3rem;
  display: block;
  left: -1.5rem;
  top: -1.5rem;
  position: relative;
  border-radius: 3rem 3rem 0;
  transform: rotate(45deg);
  border: 1px solid #FFFFFF`;
}

const CurrectLocationIcon = L.divIcon({
  className: "current-location-pin",
  iconAnchor: [0, 24],
  labelAnchor: [-6, 0],
  popupAnchor: [0, -36],
  html: `<span style="${markerHtmlStyles(CurrentLocationColor)}" />`
});

// Initially display all stores
displayAllStores();

// Ο χαρτης εστιαζει αρχικα στην τοποθεσια του χρηστη
getUserLocation();