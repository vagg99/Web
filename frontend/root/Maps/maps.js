// Initialize the map 
var map = L.map('map')

// Add the tile layer (OpenStreetMap as an example)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let userLoggedIn = false;
fetch('http://localhost:3000/check-user-auth', {
  method: 'GET',
  credentials: 'include', // Send cookies
})
.then(response => response.json())
.then(data => {
  if (data.loggedIn) {
    userLoggedIn = true;
  } else {
    userLoggedIn = false;
  }
})
.catch(error => {
  console.error('Fetch error:', error);
});

let userIsAdmin = false;
fetch('http://localhost:3000/check-admin-auth', {
  method: 'GET',
  credentials: 'include', // Send cookies
})
.then(response => response.json())
.then(data => {
  if (data.isAdmin) {
    userIsAdmin = true;
  } else {
    userIsAdmin = false;
  }
})
.catch(error => {
  console.error('Error:', error);
});

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

  // Add a CSS animation for the bouncing effect
  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(`
    @keyframes bounce {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(-10px); /* Adjust the bounce height */
      }
    }
  `, styleSheet.cssRules.length);


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
  let distance = null;
  try {
    // Υπολογισμος Απόστασης χρηστη (απο τοτε που ανοιξε την ιστοσελίδα αρα cached location)
    // με το το μαγαζι που κλικαρε
    const clickedLatLng = e.latlng;
    const userLatLng = userLocationMarker.getLatLng();
    distance = calculateHaversineDistance(userLatLng, clickedLatLng);
    //if (distance <= 0.05) {// 0.05 represents 50 meters in degrees (approximate) , The clicked marker is less than 50 meters away from the user's location marker
      if (userLoggedIn) {
        popupContent += `<button id="submit-discount-button" class="clickable-btn" onclick="location.href='../Submission/submission.html?shopId=${encodeURIComponent(id)}'">Υποβολή Προσφοράς</button>`;
      } else {
        popupContent += `<button id="submit-discount-button" class="clickable-btn logged-out" disabled>Υποβολή Προσφοράς</button>`;
      }
    //}
    marker.bindPopup(popupContent,{className: 'custom-popup',maxWidth: 300}).openPopup();
  } catch (error) {
    console.error('Error calculating distance:', error);
  }
  try {
    const response = await fetch(`http://localhost:3000/getDiscountedItems?shopId=${id}`);
    const discountedItems = await response.json();

    console.log(discountedItems);
    
    if (discountedItems.length) {
      popupContent += createPopupContent(discountedItems,shopName,distance,marker.storeId);
      await marker.bindPopup(popupContent,{className: 'custom-popup',maxWidth: 300}).openPopup();
    }

    if (userIsAdmin) {
      for (let i = 0 ; i < discountedItems.length ; i++) {
        const deleteDiscountButton = document.querySelector(`#delete-discount-${discountedItems[i]._id}`);
        deleteDiscountButton.addEventListener('click', async () => {
          const discountContainer = document.querySelector(`#discount_${discountedItems[i]._id}`);
          if (discountContainer) {
            discountContainer.style.display = 'none';
            console.log('sending delete request...')
          }
          try {
            const response = await fetch(`http://localhost:3000/deleteDiscount?discountId=${encodeURIComponent(discountedItems[i]._id)}`, {
              method: 'DELETE',
              credentials: 'include', // Send cookies
            });
            if (response.ok) {
              console.log(`Delete successful for discount ${discountedItems[i]._id}`)
            } else {
              console.error('Delete failed');
            }
          } catch (error) {
            console.error('Error during delete:', error);
          }
        });
      }
    }

  } catch (error) {
    console.error('Error fetching discounted items:', error);
  }
}

function createPopupContent(data, shopName, distance, shopId) {
  // Εδω θα πρεπει να φτιαξουμε το html που θα εμφανιζεται στο popup
  let output = `<div class="discount">`;
  output += "<div class='popup-title'>Λίστα προσφορών!</div>";

  output += `<div class="popup-item-scroll-list">`;

  for (let i = 0; i < data.length; i++) {
    let product = data[i].item.name;
    let price = data[i].discount.discount_price;
    let date = data[i].discount.date;
    let likes = data[i].discount.likes;
    let dislikes = data[i].discount.dislikes;
    let apothema = data.in_stock ? "ναι" : "οχι";
    let achievements = data[i].discount.achievements;
    
    output += `
          <div class="popup-item-container discount-item" id="discount_${data[i]._id}">
          <div class="discount-enumeration">${i + 1}</div>
          <div class="product-name">${product}</div>
          <div class="price">Τιμή ${price}€</div>
          <div class="stock-status">Βρίσκεται σε απόθεμα: ${apothema}</div>
          <div class="date">Καταχωρήθηκε: ${date}</div>
          <div class="likes">Likes: ${likes}</div>
          <div class="dislikes">Dislikes: ${dislikes}</div>`
    ;
    if (achievements["5_a_i"]) {
      output += `<div class="achievement"><img src="../images/5_a_i.ico" alt="5_a_i_complete" class="icon"></div>`;
    }
    if (achievements["5_a_ii"]) {
      output += `<div class="achievement"><img src="../images/5_a_ii.ico" alt="5_a_ii_complete" class="icon"></div>`;
    }
    if (userIsAdmin) {
      output += `<button class="delete-discount-button" id="delete-discount-${data[i]._id}">
        <img src="../images/trash_32.png" alt="Delete Offer">
      </button>`;
    }
    output += "</div>";
  }
  

  output += `</div>`; // Close popup-item-scroll-list div

  output += `<div class="button-container shop-container" data-shop-id="${encodeURIComponent(shopId)}">`;
  if (userLoggedIn) {
    output += `<button id="assessment-button" class="clickable-btn" onclick="location.href='../assessment/assessment.html?shopId=${encodeURIComponent(
      shopId
    )}'">Αξιολόγιση Προσφορών</button>`;
  } else {
    output += `<button id="assessment-button" class="clickable-btn logged-out" disabled>Αξιολόγιση Προσφορών</button>`;
  }
  output += `</div>`;
  output += "</div>";
  return output;
  
}

// Marker icons
// visuals here

function markerHtmlStyles(color) { return `
  background-color: ${color};
  width: 3rem;
  height: 3rem;
  display: block;
  left: -1.5rem;
  top: -1.5rem;
  position: relative;
  border-radius: 3rem 3rem 0;
  transform: rotate(0deg);
  border: 1px solid #FFFFFF;
  animation: bounce 0.8s infinite alternate;
`;
}



function divIconSettings(color) {
  return {
    className: "shop-pin",
    iconAnchor: [0, 24],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -46],
    html: `<span style="${markerHtmlStyles(color)}" />`
  }
}

const CurrentLocationColor = "#40e0d0";
const ShopColor = "#5A5A5A";
const DiscountShopColor = "#FF0000";

const CurrectLocationIcon = L.divIcon(divIconSettings(CurrentLocationColor));
const ShopIcon = L.divIcon(divIconSettings(ShopColor));
const DiscountShopIcon = L.divIcon(divIconSettings(DiscountShopColor));