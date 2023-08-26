document.addEventListener('DOMContentLoaded', async () => {
    // Fetch the user's information from the server
    const userResponse = await fetch(`http://localhost:3000/getUserInfo`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include'
    });
    const userData = await userResponse.json();

    console.log(userData);

    const firstnameField2 = document.getElementById("input-first-name2");
    const lastnameField2 = document.getElementById("input-last-name2");
    const cityField2 = document.getElementById("input-city2");
    const countryField2 = document.getElementById("input-country2");

    // Display username in the form
    const usernameField = document.getElementById("input-username");
    const emailField = document.getElementById("input-email");
    const firstnameField = document.getElementById("input-first-name");
    const lastnameField = document.getElementById("input-last-name");
    const addressField = document.getElementById("input-address");
    const cityField = document.getElementById("input-city");
    const countryField = document.getElementById("input-country");
    const countrycodeField = document.getElementById("input-postal-code");

    if (userData) {

        // Populate the form fields using the userData object
        if (userData.firstname) firstnameField2.textContent = userData.firstname;
        if (userData.lastname) lastnameField2.textContent = userData.lastname;
        if (userData.address.city) cityField2.textContent = userData.address.city;
        if (userData.address.country) countryField2.textContent = userData.address.country;

        // Populate the form fields with editable values
        if (userData.username) usernameField.value = userData.username;
        if (userData.email) emailField.value = userData.email;
        if (userData.firstname) firstnameField.value = userData.firstname;
        if (userData.lastname) lastnameField.value = userData.lastname;
        if (userData.address.name) addressField.value = userData.address.name;
        if (userData.address.city) cityField.value = userData.address.city;
        if (userData.address.country) countryField.value = userData.address.country;
        if (userData.address.countryCode) countrycodeField.value = userData.address.countryCode;

    } else {
        console.error("User not found");
    }
});
