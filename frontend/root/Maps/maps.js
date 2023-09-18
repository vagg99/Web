// Initialize the map 
var map = L.map('map')

// Add the tile layer (OpenStreetMap as an example)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Distance needed to be considered "near" a shop
let distanceThreshold = 0.0005; // 0.0005 represents 50 meters in degrees (approximate)

// User's location :
let userLatitude = null;
let userLongitude = null;

// Ellipse and diameters for the user's location
let ellipse = null;
let diameter1 = null;
let diameter2 = null;

// Μηνυμα για οταν ενα μαγαζι δεν εχει ονομα
const unNamedShop = "Ανώνυμο Μαγαζί";

// Check if the user is logged in
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

let stores = null;
let discounts = null;

document.addEventListener('DOMContentLoaded', async () => {
  
  stores = await getAllStores();
  discounts = await getAllDiscounts();

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

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
    displayAllStores();
    displayAllStoresWithDiscounts();
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

  // Hamburger menu functionality
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  }));

  // if you scroll down the hamburger menu will disappear
  window.addEventListener("scroll", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });


  const scaleControl = document.getElementById('ellipseScale');
  scaleControl.addEventListener('input', updateEllipse);

  // populate subcategory filter on page load
  populateSubcategories(subcategorySelect);

  // Initially display only the stores that have discounts
  displayAllStoresWithDiscounts();

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
        userLatitude = latitude;
        userLongitude = longitude;
        map.setView([latitude, longitude], 17); // Set the view to user's location with zoom level 17 (next smaller scale is 16)
        updateEllipse();
        userLocationMarker = L.marker([latitude, longitude] , { icon: CurrectLocationIcon })
          .addTo(map)
          .bindPopup('Βρίσκεσαι εδώ!') // Custom popup message for the user's location
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

// Function to update the ellipse and diameters
// This function is called when the user changes the distance threshold
function updateEllipse() {
  map.closePopup();
  
  distanceThreshold = parseFloat(document.getElementById('ellipseScale').value);

  const rotationDegrees = 0;
  const numberOfSegments = 360;
  const semiMajorAxisMeters = distanceThreshold;
  const semiMinorAxisMeters = distanceThreshold;

  if (ellipse) {
    map.removeLayer(ellipse);
  }
  if (diameter1) {
    map.removeLayer(diameter1);
  }
  if (diameter2) {
    map.removeLayer(diameter2);
  }

  const latlngs = [];

  for (let i = 0; i <= 360; i += 360 / numberOfSegments) {
    const angleRadians = (i + rotationDegrees) * (Math.PI / 180);
    const x = userLatitude + (semiMajorAxisMeters * Math.cos(angleRadians));
    const y = userLongitude + (semiMinorAxisMeters * Math.sin(angleRadians));
    latlngs.push([x, y]);
  }

  ellipse = L.polyline(latlngs, { color: CurrentLocationColor }).addTo(map);

  // Calculate coordinates for the endpoints of the diameters
  const latLngs = [
    [userLatitude, userLongitude - semiMinorAxisMeters], // Adjust the longitude difference to control the length of the diameters
    [userLatitude, userLongitude + semiMinorAxisMeters],
    [userLatitude - semiMajorAxisMeters, userLongitude], // Adjust the latitude difference to control the length of the diameters
    [userLatitude + semiMajorAxisMeters, userLongitude],
  ];

  // Create polyline segments for the diameters with dashed lines
  diameter1 = L.polyline(latLngs.slice(0, 2), {
    color: CurrentLocationColor, // Color of the first diameter
    dashArray: '10, 10', // Dashed line style (10px dash, 10px gap)
  }).addTo(map);

  diameter2 = L.polyline(latLngs.slice(2), {
    color: CurrentLocationColor, // Color of the second diameter
    dashArray: '10, 10', // Dashed line style (10px dash, 10px gap)
  }).addTo(map);

  // Update the label text to show the current radius in meters rounded to 2 decimal points
  const radiusLabel = document.getElementById('radius-label');
  const roundedRadius = (distanceThreshold * 100000).toFixed(2); // Round to 2 decimal points
  radiusLabel.textContent = `Ακτίνα: ${roundedRadius} μέτρα`;

}


// Function to calculate the Haversine distance between two points
function calculateHaversineDistance(point1, point2) {
  const lat1 = point1.lat;
  const lon1 = point1.lng;
  const lat2 = point2.lat;
  const lon2 = point2.lng;

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  // Use the Pythagorean theorem to calculate the distance in degrees
  const distance = Math.sqrt(dLat * dLat + dLon * dLon);

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
async function displayAllStores(){
  //stores = await getAllStores();
  stores.forEach(store => {
    const { id, lat, lon } = store;
    const name = store.tags.name ? store.tags.name : unNamedShop;
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
async function displayAllStoresWithDiscounts(){

  StoresWithDiscounts = {};

  discounts.forEach(discount => {
    StoresWithDiscounts[discount.store_id] = discount;
  });

  stores.forEach(store => {
    const { id, lat, lon } = store;
    const name = store.tags.name ? store.tags.name : unNamedShop;
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
  let popupContent = `<div class="shop-name"><b>${shopName}</b></div>`;
  let distance = null;
  try {
    // Υπολογισμος Απόστασης χρηστη (απο τοτε που ανοιξε την ιστοσελίδα αρα cached location)
    // με το το μαγαζι που κλικαρε
    const clickedLatLng = e.latlng;
    const userLatLng = userLocationMarker.getLatLng();
    distance = calculateHaversineDistance(userLatLng, clickedLatLng);
    // Υποβολή Προσφοράς
    if (distance <= distanceThreshold && userLoggedIn) {
      popupContent += `<button id="submit-discount-button" class="button-container shop-container" onclick="location.href='../Submission/submission.html?shopId=${encodeURIComponent(id)}'">Υποβολή Προσφοράς</button>`;
    } else {
      popupContent += `<button id="submit-discount-button" class="clickable-btn logged-out" disabled>Υποβολή Προσφοράς</button>`;
    }
    marker.bindPopup(popupContent,{className: 'custom-popup',maxWidth: 300}).openPopup();
  } catch (error) {
    console.error('Error calculating distance:', error);
  }
  try {
    const response = await fetch(`http://localhost:3000/getDiscountedItems?shopId=${id}`);
    const discountedItems = await response.json();
    
    if (discountedItems.length) {
      console.log(discountedItems);
      popupContent += createPopupContent(discountedItems,shopName,distance,marker.storeId);
      await marker.bindPopup(popupContent,{className: 'custom-popup',maxWidth: 300}).openPopup();
    }
    
    if (userIsAdmin) {
      let length = discountedItems.length;
      for (let i = 0 ; i < discountedItems.length ; i++) {
        const deleteDiscountButton = document.querySelector(`#delete-discount-${discountedItems[i]._id}`);
        deleteDiscountButton.addEventListener('click', async () => {
          const discountContainer = document.querySelector(`#discount_${discountedItems[i]._id}`);
          const title = document.querySelector('.popup-title');
          if (discountContainer) {
            discountContainer.style.display = 'none';
            console.log('sending delete request...');
            length--;
            title.innerHTML = `
              Βρέθηκ${length>1?"αν":"ε"} ${length} Προσφορ${length>1?"ές":"ά"}!
            `;
            if (length === 0) {
              marker.closePopup();
              marker.removeFrom(map);
            }
          }
          try {
            const response = await fetch(`http://localhost:3000/deleteDiscount?discountId=${encodeURIComponent(discountedItems[i]._id)}`, {
              method: 'DELETE',
              credentials: 'include', // Send cookies
            });
            const message = await response.json();
            if (response.ok) {
              console.log(`Delete successful for discount ${discountedItems[i]._id}`)
              console.log(message)
            } else {
              console.error('Delete failed');
            }
          } catch (error) {
            console.error('Error during delete:', error);
          }
          if (length === 0) {
            console.log("that was the last discount , resetting cache ...");
            stores = await getAllStores();
            discounts = await getAllDiscounts();
            console.log("cache reset.");
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
  // Βρέθηκαν 2 Προσφορές / Βρέθηκε 1 Προσφορά
  output += `<div class='popup-title'>
    Βρέθηκ${data.length>1?"αν":"ε"} ${data.length} Προσφορ${data.length>1?"ές":"ά"}!
  </div>`;

  output += `<div class="popup-item-scroll-list">`;

  for (let i = 0; i < data.length; i++) {
    let product = data[i].item.name;
    let price = data[i].discount.discount_price;
    let date = data[i].discount.date;
    let likes = data[i].discount.likes;
    let dislikes = data[i].discount.dislikes;
    let apothema = data[i].in_stock ? "Ναι" : "Όχι"; // Determine if it's in stock
    let achievements = data[i].discount.achievements;

    // Add "out-of-stock" class if the product is out of stock
    let containerClass = "popup-item-container discount-item";
    if (apothema === "Όχι") {
      containerClass += " out-of-stock";
    }

    output += `
    <div class="${containerClass}" id="discount_${data[i]._id}">
        <div class="discount-enumeration">${i + 1}</div>
        <div class="product-name">${product}</div>
        <div class="price">💰 Τιμή ${price}€</div>
        <div class="stock-status">🏢 Βρίσκεται σε απόθεμα: ${apothema}</div>
        <div class="date">📅 Καταχωρήθηκε: ${date}</div>
        <div class="likes-dislikes-container">
            <div class="likes">👍 ${likes}</div>
            <div class="dislikes">👎 ${dislikes}</div>
        </div>
    `;

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

  // Αξιολόγηση Προσφορών
  output += `<div class="button-container shop-container assessment-button" data-shop-id="${encodeURIComponent(shopId)}">`;
  if (distance <= distanceThreshold && userLoggedIn) {
    output += `<button id="assessment-button" class="clickable-btn" onclick="location.href='../assessment/assessment.html?shopId=${encodeURIComponent(
      shopId
    )}'">Αξιολόγιση Προσφορών</button>`;
  } else {
    output += `<button id="assessment-button" class="clickable-btn logged-out" disabled>Αξιολόγιση Προσφορών</button>`;
  }
  output += `</div>`; // close button-container div
  output += "</div>"; // close discount div
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
  transform: rotate(45deg);
  border: 1px solid #FFFFFF;
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


