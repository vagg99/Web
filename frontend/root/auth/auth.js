const profileLink = document.getElementById('profileLink');
const logoutBtn = document.getElementById('logoutBtn');
fetch('http://localhost:3000/check-user-auth', {
  method: 'GET',
  credentials: 'include', // Send cookies
})
.then(response => response.json())
.then(data => {
  if (data.loggedIn) {
    profileLink.style.display = 'block';
    logoutBtn.style.display = 'block';
  } else {
    profileLink.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
})
.catch(error => {
  console.error('Fetch error:', error);
});

logoutBtn.addEventListener('click', async function() {
  try {
      const response = await fetch('http://localhost:3000/logout', {
          method: 'POST', // You can use POST for logout
          credentials: 'include'
      });

      if (response.ok) {
          // Redirect to the login page
          window.location.href = 'http://localhost:5500/frontend/root/index.html';
          profileLink.style.display = 'none';
          logoutBtn.style.display = 'none';
          adminLink.style.display = 'none';
      } else {
          console.error('Logout failed');
      }
  } catch (error) {
      console.error('Error during logout:', error);
  }
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