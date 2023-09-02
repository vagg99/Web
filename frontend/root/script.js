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

});

async function LoadDataInTheBeginning() {
  await getAllStores();
  await getAllDiscounts();
  await getAllUsers();

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

  async function getAllUsers(){
    const response = await fetch('http://localhost:3000/users');
    const users = await response.json();
    return users;
  }

}