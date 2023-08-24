document.addEventListener('DOMContentLoaded', async () => {
    // Assuming you have the user's username
    const loggedInUsername = 'test1708235'; // Replace with the actual username

    // Fetch the user's information from the server
    const userResponse = await fetch(`http://localhost:3000/getUserInfo?username=${loggedInUsername}`);
    const userData = await userResponse.json();

    // Display username in the form
    const usernameField = document.getElementById("username");

    if (userData) {
        // Populate the form field with the user's username
        usernameField.value = loggedInUsername;
    } else {
        console.error("User not found");
    }
});
