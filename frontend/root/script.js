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


  const profileLink = document.getElementById('profileLink');

  try {
    const response = await fetch('http://localhost:3000/check-user-auth', {
      method: 'GET',
      credentials: 'include', // Send cookies
    });
    const data = await response.json();

    if (data.loggedIn) {
      profileLink.style.display = 'block';
    } else {
      profileLink.style.display = 'none';
    }
  } catch (error) {
    console.error('Error:', error);
  }

});

window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");
  
  loader.classList.add("loader--hidden");

  loader.addEventListener("transitionend", () => {
    document.body.removeChild(loader);
  });
});