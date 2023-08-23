// Assuming you're using the Fetch API for AJAX requests
fetch('http://localhost:3000/check-admin-auth', {
  method: 'GET',
  credentials: 'include', // Send cookies
})
.then(response => response.json())
.then(data => {
  if (!data.isAdmin) {
    // User is not authenticated as admin, redirect or show an error
    console.log('Access denied. You are not an admin.');
    window.location.href = "../index.html";
  }
})
.catch(error => {
  console.error('Error:', error);
});