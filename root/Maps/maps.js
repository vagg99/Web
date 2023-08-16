// Initialize the map 
var map = L.map('map')

// Add the tile layer (OpenStreetMap as an example)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Test View
const view = [38.24511060644045, 21.7364112438391];

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

let markers = []
async function displayAllStores(){
  const stores = await getAllStores();
  stores.forEach(store => {
    const { id, lat, lon } = store;
    const name = store.tags.name;
    const marker = L.marker([lat, lon] , { icon: ShopIcon })
      .addTo(map)
      .bindPopup(`<b>${name}</b>`)
      .on('click', (e) => { onMarkerClick(marker,e,id) })
      .openPopup();
    markers.push(marker);
  });
  
  // Current Location
  //getUserLocation();
  // Patra
  map.setView(view, 15);
}

// Search box functionality
const searchBox = document.getElementById('search-box');
searchBox.addEventListener('input', () => { filterShops(searchBox.value.toLowerCase()); });

function filterShops(query){
  markers.forEach(marker => {
    const shopName = marker.getPopup().getContent().toLowerCase();
    
    if (shopName.includes(query)) {
      marker.addTo(map);
    } else {
      marker.removeFrom(map);
    }
  });
}

// marker click functionality
async function onMarkerClick(marker,e,id){
  try {
    const response = await fetch(`http://localhost:3000/getDiscountedItems?shopId=${id}`);
    const data = await response.json();
    if (data.length) {
      let shopName = marker.getPopup().getContent()
      const popupContent = createPopupContent(data,shopName);
      marker.bindPopup(popupContent).openPopup();
    }
  } catch (error) {
    console.error('Error fetching discounted items:', error);
  }
}

function createPopupContent(data,shopName) {
  // θελουμε κατι πιο δημιουργικο εδω
  // Εγω βαζω αυτο το απλο και αλλαξτε το.


  let output = shopName;
  output += "<div>Αυτο το μαγαζί έχει αντικείμενα με προσφορά !</div>";

  for (let i = 0 ; i < data.length ; i++){
    output += `<div>${i+1}. ${data[i].item.name} - ${data[i].discount_price}€</div>`;
  }

  return output;
}

const CurrentLocationColor = "#40e0d0";
const ShopColor = "#ff0000";

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

const ShopIcon = L.divIcon({
  className: "shop-pin",
  iconAnchor: [0, 24],
  labelAnchor: [-6, 0],
  popupAnchor: [0, -36],
  html: `<span style="${markerHtmlStyles(ShopColor)}" />`
});

// Initially display all stores
displayAllStores();

// Ο χαρτης εστιαζει αρχικα στην τοποθεσια του χρηστη
//getUserLocation();