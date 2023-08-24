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

window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");
  
  loader.classList.add("loader--hidden");

  loader.addEventListener("transitionend", () => {
    document.body.removeChild(loader);
  });
});