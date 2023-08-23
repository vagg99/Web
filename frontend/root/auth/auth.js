const profileLink = document.getElementById('profileLink');
fetch('http://localhost:3000/check-user-auth', {
  method: 'GET',
  credentials: 'include', // Send cookies
})
.then(response => response.json())
.then(data => {
  if (data.loggedIn) {
    profileLink.style.display = 'block';
  } else {
    profileLink.style.display = 'none';
  }
})
.catch(error => {
  console.error('Fetch error:', error);
});