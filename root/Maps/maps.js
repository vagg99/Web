// Initialize the map with a default view at the specific location
var map = L.map('map').setView([38.24511060644045, 21.7364112438391], 15); // Set the provided coordinates and zoom level 15

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
        L.marker([latitude, longitude])
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
