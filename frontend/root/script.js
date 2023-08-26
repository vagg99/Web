window.addEventListener("DOMContentLoaded", async () => {
  const loader = document.querySelector(".loader");

  await LoadDataInTheBeginning();

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

window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");
  
  loader.classList.add("loader--hidden");

  loader.addEventListener("transitionend", () => {
    document.body.removeChild(loader);
  });
});

async function LoadDataInTheBeginning() {
  await getAllStores();
  await getAllDiscounts();

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

}