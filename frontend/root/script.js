window.addEventListener("load", async () => {
  
  // by adding "await" to the function, we make sure that the data is loaded before the page is rendered
  // without adding "await" the data loads in the background
  await LoadDataInTheBeginning();

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const loader = document.querySelector(".loader");
  
  loader.classList.add("loader--hidden");

  window.addEventListener("DOMContentLoaded", async () => {
    const loader = document.querySelector(".loader");
  
    loader.addEventListener("transitionend", () => {
      document.body.removeChild(loader);
    });
  
    // If the loader is visible on the initial page load, hide it after a delay
    setTimeout(() => {
      if (!document.body.classList.contains("loader--hidden")) {
        loader.classList.add("loader--hidden");
      }
    }, 1500); // Adjust the delay as needed
  
  });

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  $(document).ready(function(){
    $('.slider').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2000, // Adjust the speed as needed
      dots: true, // Show navigation dots
    });
  });

});

async function LoadDataInTheBeginning() {
  let StoresWithDiscounts = {};
  const stores = await getAllStores();
  const discounts = await getAllDiscounts();
  await displayAllStoresWithDiscounts(stores,discounts);
  await getUserData();

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
  
  async function getAllDiscountsInShop(id){
    const response = await fetch(`http://localhost:3000/getDiscountedItems?shopId=${id}`);
    const discounts = await response.json();
    return discounts;
  }

  async function displayAllStoresWithDiscounts(stores,discounts){

    discounts.forEach(discount => {
      StoresWithDiscounts[discount.store_id] = discount;
    });
  
    stores.forEach(async store => {
      const { id } = store;
      if (StoresWithDiscounts[id]) {
        await getAllDiscountsInShop(id);
      }
    });
  }

  async function getUserData(){
    await fetch("http://localhost:3000/leaderboard");
  }
}

