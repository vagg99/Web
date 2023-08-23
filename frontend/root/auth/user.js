fetch('http://localhost:3000/check-user-auth', {
  method: 'GET',
  credentials: 'include', // Send cookies
})
.then(response => response.json())
.then(data => {
  if (!data.loggedIn) {
    // User is not authenticated as admin, redirect or show an error
    console.log('Access denied. You are not logged In');
    window.location.href = "../index.html";
  }
})
.catch(error => {
  console.error('Error:', error);
});