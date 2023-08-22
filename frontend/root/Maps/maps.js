// Initialize the map 
var map = L.map('map')

// Add the tile layer (OpenStreetMap as an example)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Test View
const view = [38.24511060644045, 21.7364112438391];

let userLocationMarker = null;

document.addEventListener('DOMContentLoaded', async () => {

  let stores = await getAllStores();
  let discounts = await getAllDiscounts();


  // Search box functionality
  const searchBox = document.getElementById('search-box');
  const searchButton = document.getElementById('search-btn');
  const searchType = document.getElementById('search-type');
  const subcategorySelect = document.getElementById('subcategory');
  //searchBox.addEventListener('input', () => { filterShops(searchBox.value.toLowerCase()); });
  searchButton.addEventListener('click', () => {filterShops(searchBox.value.toLowerCase());});
  searchBox.addEventListener('keypress', (event) => { if (event.key === 'Enter') filterShops(searchBox.value.toLowerCase()) });

  searchType.addEventListener('change', () => {
    if (searchType.value === 'category') {
      filterShops('');
      subcategorySelect.style.display = 'inline-block';
    } else {
      subcategorySelect.style.display = 'none';
    }
  });
  subcategorySelect.addEventListener('change', () => {
    filterShops('');
  });

  function filterShops(query){
    displayAllStores(stores);
    displayAllStoresWithDiscounts(stores,discounts);
    switch (searchType.value) {
      case 'shop':
        markers.forEach(marker => {
          const shopName = marker.getPopup().getContent().toLowerCase();
          
          if (shopName.includes(query)) {
            marker.addTo(map);
          } else {
            marker.removeFrom(map);
          }
        });
      break;
      case 'category':
        markers.forEach(marker => {
          const shopName = marker.getPopup().getContent().toLowerCase();
          const shopId = marker.storeId;
          if ( shopName.includes(query) && StoresWithDiscounts[shopId] && StoresWithDiscounts[shopId].category === subcategorySelect.value  ) {
            marker.addTo(map);
          } else {
            marker.removeFrom(map);
          }
        });
      break;
    }
  }



  // populate subcategory filter on page load
  populateSubcategories(subcategorySelect);

  // Initially display only the stores that have discounts
  displayAllStoresWithDiscounts(stores,discounts);

  // Ο χαρτης εστιαζει αρχικα στην τοποθεσια του χρηστη
  getUserLocation();
});

// Function to get the user's location and update the map view
function getUserLocation() {
  if ('geolocation' in navigator) {
    // Get the user's current position
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 15); // Set the view to user's location with zoom level 15
        userLocationMarker = L.marker([latitude, longitude] , { icon: CurrectLocationIcon })
          .addTo(map)
          .bindPopup('You are here!') // Custom popup message for the user's location
          .openPopup();
        map.setView(view, 12);
      },
      function(error) {
        console.error('Error getting user location:', error.message);
      }
    );
  } else {
    console.error('Geolocation is not available in this browser.');
  }
}

// Function to calculate the Haversine distance between two points
function calculateHaversineDistance(point1, point2) {
  const R = 6371000; // Earth's radius in meters
  
  const lat1 = point1.lat * (Math.PI / 180);
  const lon1 = point1.lng * (Math.PI / 180);
  const lat2 = point2.lat * (Math.PI / 180);
  const lon2 = point2.lng * (Math.PI / 180);
  
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c;
  return distance;
}

async function getAllDiscounts(){
  const response = await fetch('http://localhost:3000/getDiscountedItems?shopId=all');
  const discounts = await response.json();
  return discounts;
}

async function getAllStores() {
  const response = await fetch('http://localhost:3000/stores');
  const stores = await response.json();
  return stores;
}

let markers = []
async function displayAllStores(stores){
  //stores = await getAllStores();
  stores.forEach(store => {
    const { id, lat, lon } = store;
    const name = store.tags.name;
    const marker = L.marker([lat, lon] , { icon: ShopIcon })
      .addTo(map)
      .bindPopup(`<b>${name}</b>`)
      .on('click', (e) => { onMarkerClick(marker,e,id,name) })
      .openPopup();
    markers.push(marker);
  });
}

async function populateSubcategories(subcategorySelect) {
  const response = await fetch('http://localhost:3000/getSubcategories');
  const subcategories = await response.json();

  subcategorySelect.innerHTML = ''; // Clear existing options
  
  subcategories.forEach(subcategory => {
    const option = document.createElement('option');
    option.value = subcategory.id;
    option.textContent = subcategory.name;
    subcategorySelect.appendChild(option);
  });
}

let StoresWithDiscounts = {};
async function displayAllStoresWithDiscounts(stores,discounts){
  //stores = await getAllStores();
  //discounts = await getAllDiscounts();

  discounts.forEach(discount => {
    StoresWithDiscounts[discount.store_id] = discount;
  });

  stores.forEach(store => {
    const { id, lat, lon } = store;
    const name = store.tags.name;
    if (StoresWithDiscounts[id]) {
      const marker = L.marker([lat, lon] , { icon: DiscountShopIcon })
        .addTo(map)
        .bindPopup(`<b>${name}</b>`)
        .on('click', (e) => { onMarkerClick(marker,e,id,name) })
        .openPopup();
      marker.storeId = id;
      markers.push(marker);
    }
  });
  map.setView(view, 12);
}


// marker click functionality
async function onMarkerClick(marker,e,id,shopName){
  let popupContent = `<div><b>${shopName}</b></div>`;
  // Υπολογισμος Απόστασης χρηστη (απο τοτε που ανοιξε την ιστοσελίδα αρα cached location)
  // με το το μαγαζι που κλικαρε
  const clickedLatLng = e.latlng;
  const userLatLng = userLocationMarker.getLatLng();
  const distance = calculateHaversineDistance(userLatLng, clickedLatLng);
  //if (distance <= 0.05) {// 0.05 represents 50 meters in degrees (approximate)
  // The clicked marker is less than 50 meters away from the user's location marker
    popupContent += `<button id="submit-discount-button" onclick="location.href='../Submission/submission.html'">Υποβολή Προσφοράς</button>`;
  //}

  marker.bindPopup(popupContent,{className: 'custom-popup',maxWidth: 300}).openPopup();

  try {
    const response = await fetch(`http://localhost:3000/getDiscountedItems?shopId=${id}`);
    const data = await response.json();
    const {discountedItems,shopName} = data;
    
    if (discountedItems.length) {
      popupContent += createPopupContent(discountedItems,shopName,distance,marker.storeId);
      marker.bindPopup(popupContent,{className: 'custom-popup',maxWidth: 300}).openPopup();
    }

  } catch (error) {
    console.error('Error fetching discounted items:', error);
  }
}

function createPopupContent(data,shopName,distance,shopId) {
  // θελουμε κατι πιο δημιουργικο εδω
  // Εγω βαζω αυτο το απλο και αλλαξτε το

  // Εδω θα πρεπει να φτιαξουμε το html που θα εμφανιζεται στο popup
  let output = `<div class="discount">`;
  output += "<div>Βρέθηκε Προσφορά !</div>";

  for (let i = 0 ; i < data.length ; i++){
    let product = data[i].item.name;
    let price = data[i].discount_price;
    let date = data[i].date;
    let likes = data[i].likes;
    let dislikes = data[i].dislikes;
    let apothema = data.in_stock?"ναι":"οχι";
    let achievements = data[i].achievements;
    output += `<div>${i+1}. ${product} - ${price}€ - σε-αποθεμα:${apothema} - date:${date} - likes/dislikes:${likes}/${dislikes}`;

    if (achievements['5_a_i']) { output += ` - 5_a_i : <img src="../images/5_a_i.ico" alt="5_a_i_complete" class="icon">`; }
    if (achievements['5_a_ii']) { output += ` - 5_a_ii : <img src="../images/5_a_ii.ico" alt="5_a_ii_complete" class="icon">`; }

    output += "</div>";

  }
  
  //if (distance <= 0.05) { // 0.05 represents 50 meters in degrees (approximate)
    // The clicked marker is less than 50 meters away from the user's location marker
   output+=`<button id="assessment-button" onclick="location.href='../assessment/assessment.html?shopId=${encodeURIComponent(shopId)}'">Αξιολόγιση Προσφορών</button>`;
  //}

  output+="</div>";
  return output;
}

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
function divIconSettings(color) {
  return {
    className: "shop-pin",
    iconAnchor: [0, 24],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -36],
    html: `<span style="${markerHtmlStyles(color)}" />`
  }
}


const CurrentLocationColor = "#40e0d0";
const ShopColor = "#5A5A5A";
const DiscountShopColor = "#FF0000";

const CurrectLocationIcon = L.divIcon(divIconSettings(CurrentLocationColor));
const ShopIcon = L.divIcon(divIconSettings(ShopColor));
const DiscountShopIcon = L.divIcon(divIconSettings(DiscountShopColor));