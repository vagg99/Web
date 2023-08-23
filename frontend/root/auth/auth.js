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
const adminLink = document.getElementById('adminDashboardBtn');
fetch('http://localhost:3000/check-admin-auth', {
  method: 'GET',
  credentials: 'include', // Send cookies
})
.then(response => response.json())
.then(data => {
  if (data.isAdmin) {
    adminLink.style.display = 'block';
  } else {
    adminLink.style.display = 'none';
  }
})
.catch(error => {
  console.error('Error:', error);
});