// Initialize the map
var map = L.map('map').setView([38.24888, 21.7373], 15); // Updated zoom level to 15 (change accordingly)

// Add the tile layer (OpenStreetMap as an example)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Function to perform geocoding and set the view based on the address
async function geocodeAndSetView(address) {
  try {
    const nominatimBaseURL = 'https://nominatim.openstreetmap.org/search?q=';
    const response = await fetch(`${nominatimBaseURL}${encodeURIComponent(address)}&format=json`);
    const data = await response.json();

    if (data.length > 0) {
      const { lat, lon } = data[0]; // Extract latitude and longitude from the response
      map.setView([lat, lon], 15); // Set the view to the geocoded location with zoom level 15
      L.marker([lat, lon]).addTo(map).bindPopup('Εδώ καρναβαλίζουμε! 😁').openPopup();
    } else {
      console.log('No results found for the address.');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Example usage:
geocodeAndSetView('Πλατεία Ναυαρίνου, Πάτρα');
