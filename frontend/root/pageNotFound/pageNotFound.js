window.addEventListener("load", async () => {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

  
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
  
});

