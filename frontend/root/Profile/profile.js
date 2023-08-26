document.addEventListener('DOMContentLoaded', async () => {
    // Assuming you have the user's username
    const loggedInUsername = 'nikos'; // Replace with the actual username

    // Fetch the user's information from the server
    const userResponse = await fetch(`http://localhost:3000/getUserInfo?username=${loggedInUsername}`);
    const userData = await userResponse.json();

    // Display username in the form
    const usernameField = document.getElementById("input-username");
    const emailField = document.getElementById("input-email");
    const firstnameField = document.getElementById("input-firstname");
    const lastnameField = document.getElementById("input-lastname");
    const addressField = document.getElementById("input-address");
    const cityField = document.getElementById("input-city");
    const countryField = document.getElementById("input-country");
    const countrycodeField = document.getElementById("input-country-code");

    if (userData) {
        // Populate the form field with the user's username
        usernameField.value = userData.username;
        emailField.value = userData.email;
        firstnameField.value = userData.firstname;
        lastnameField.value = userData.lastname;
        addressField.value = userData.address.name;
        cityField.value = userData.address.city;
        countryField.value = userData.address.country;
        countrycodeField.value = userData.address.countryCode;
    } else {
        console.error("User not found");
    }
});
