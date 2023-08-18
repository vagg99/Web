//Global variables to save loading time
let stores;
let discounts;
let StoresWithDiscounts = {};

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
  map.setView(view, 12);
}

async function populateSubcategories() {
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

async function displayAllStoresWithDiscounts(){
  stores = await getAllStores();
  discounts = await getAllDiscounts();

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
        .on('click', (e) => { onMarkerClick(marker,e,id) })
        .openPopup();
      marker.storeId = id;
      markers.push(marker);
    }
  });
  map.setView(view, 12);
}

// Search box functionality
const searchBox = document.getElementById('search-box');
const searchType = document.getElementById('search-type');
const subcategorySelect = document.getElementById('subcategory');
searchBox.addEventListener('input', () => { filterShops(searchBox.value.toLowerCase()); });

function filterShops(query){
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
      console.log(subcategorySelect.value);
      console.log(`StoresWithDiscounts : ${StoresWithDiscounts}`);
      markers.forEach(marker => {
        const shopName = marker.getPopup().getContent().toLowerCase();
        const shopId = marker.storeId;
        console.log(shopId);
        console.log(`StoresWithDiscounts[shopId] :`);
        console.log(StoresWithDiscounts[shopId]);
        if (StoresWithDiscounts[shopId]) {
          console.log(`StoresWithDiscounts[shopId].category : ${StoresWithDiscounts[shopId].category}`);
          console.log(`subcategorySelect.value : ${subcategorySelect.value}`);
        }
        if ( shopName.includes(query) && StoresWithDiscounts[shopId] && StoresWithDiscounts[shopId].category === subcategorySelect.value  ) {
          marker.addTo(map);
        } else {
          marker.removeFrom(map);
        }
      });
    break;
  }
}
searchType.addEventListener('change', function() {
  if (searchType.value === 'category') {
    subcategorySelect.style.display = 'inline-block';
  } else {
    subcategorySelect.style.display = 'none';
  }
});

// marker click functionality
async function onMarkerClick(marker,e,id){
  try {
    console.log("CLICK")
    const response = await fetch(`http://localhost:3000/getDiscountedItems?shopId=${id}`);
    const data = await response.json();
    const {discountedItems,shopName} = data;
    console.log(discountedItems);
    if (discountedItems.length) {
      const popupContent = createPopupContent(discountedItems,shopName);
      marker.bindPopup(popupContent).openPopup();
    }
  } catch (error) {
    console.error('Error fetching discounted items:', error);
  }
}

function createPopupContent(data,shopName) {
  // θελουμε κατι πιο δημιουργικο εδω
  // Εγω βαζω αυτο το απλο και αλλαξτε το

  console.log(data);
  // Εδω θα πρεπει να φτιαξουμε το html που θα εμφανιζεται στο popup
  let output = `<div><b>${shopName}</b></div>`;
  output += "<div>Βρέθηκε Προσφορά !</div>";

  for (let i = 0 ; i < data.length ; i++){
    let product = data[i].item.name;
    let price = data[i].discount_price;
    let date = data[i].date;
    let likes = data[i].likes;
    let apothema = data.in_stock?"ναι":"οχι";
    output += `<div>${i+1}. ${product} - ${price}€ - σε-αποθεμα:${apothema} - date:${date} - likes:${likes}</div>`;
  }

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

// populate subcategory filter on page load
populateSubcategories();


// Initially display only the stores that have discounts
displayAllStores();
displayAllStoresWithDiscounts();

// Ο χαρτης εστιαζει αρχικα στην τοποθεσια του χρηστη
//getUserLocation();