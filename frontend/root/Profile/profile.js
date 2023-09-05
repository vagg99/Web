document.addEventListener('DOMContentLoaded', async () => {
    // Get references to the loader elements
    const loaderContainer = document.getElementById('loader-container');
    const loader = document.getElementById('loader');

    // Fetch the user's information from the server
    const userResponse = await fetch(`http://localhost:3000/getUserInfo`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include'
    });
    const { user , userPostedItems, userLikedItems, userDislikedItems } = await userResponse.json();
    const userData = user;
    console.log(user , userPostedItems, userLikedItems, userDislikedItems);

    // Hide the loader by fading it out
    loaderContainer.style.opacity = 0;

    // Set a timeout to remove the loader element from the DOM after the fade-out animation completes
    setTimeout(() => {
        loaderContainer.style.display = 'none';
    }, 300); // Adjust the duration to match your CSS transition time

    const firstnameField2 = document.getElementById("input-first-name2");
    const lastnameField2 = document.getElementById("input-last-name2");
    const cityField2 = document.getElementById("input-city2");
    const countryField2 = document.getElementById("input-country2");

    // Display username in the form
    const usernameField = document.getElementById("input-username");    //username
    const emailField = document.getElementById("input-email");          //email
    const firstnameField = document.getElementById("input-first-name"); //firstname
    const lastnameField = document.getElementById("input-last-name");   //lastname
    const addressField = document.getElementById("input-address");      //address
    const cityField = document.getElementById("input-city");            //city
    const countryField = document.getElementById("input-country");      //country
    const countrycodeField = document.getElementById("input-postal-code");  //postal code

    const monthlyPoints = document.getElementById("monthly-points");    //monthly points
    const totalPoints = document.getElementById("total-points");        //total points
    const monthlyTokens = document.getElementById("monthly-tokens");    //monthly tokens
    const totalTokens = document.getElementById("total-tokens");        //total tokens

    // Get the button container and input fields
    const buttonContainer = document.getElementById("buttonContainer");
    const editButton = document.getElementById("editButton");
    const inputFields = document.querySelectorAll(".form-control-alternative");

    // Set the input fields to read-only initially
    inputFields.forEach(input => {
        input.readOnly = true;
    });

    // Function to toggle the buttons
    const toggleButtons = (editMode) => {
        if (editMode) {
            editButton.style.display = "none";
            saveButton.style.display = "inline-block";
            cancelButton.style.display = "inline-block";
        } else {
            editButton.style.display = "inline-block";
            saveButton.style.display = "none";
            cancelButton.style.display = "none";
        }
    }

    // Create the save and cancel buttons
    // after pressing the edit button

    // Save
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save changes";
    saveButton.classList.add("btn", "btn-sm", "btn-success");
    saveButton.style.display = "inline-block"; // Initially hidden

    // save button visuals by default without mousover
    saveButton.style.backgroundColor = "#2dce89";
    saveButton.style.color = "#fff";

    // Cancel
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.classList.add("btn", "btn-sm", "btn-danger");
    cancelButton.style.display = "inline-block"; // Initially hidden

    // cancel button visuals

    cancelButton.style.backgroundColor = "#f5365c";
    cancelButton.style.color = "#fff";

    // Add event listener to the edit button
    editButton.addEventListener("click", () => {
        inputFields.forEach(input => {
            if (!["monthly-points", "total-points", "monthly-tokens", "total-tokens"].includes(input.id)) {
                input.readOnly = !input.readOnly;
            }
        });
        toggleButtons(true);
    });

    // Add event listener to the cancel button
    cancelButton.addEventListener("click", () => {
        inputFields.forEach(input => {
            input.readOnly = true; // Set input fields back to read-only
        });
        editMode = false;
        toggleButtons(false); // Toggle buttons to their original state
        restoreOriginalFieldValues(userData); // Restore original field values
    });

    // Add event listener to the save button
    saveButton.addEventListener("click", async () => {
        inputFields.forEach(input => {
            input.readOnly = true; // Set input fields back to read-only
        });
        editMode = false;
        toggleButtons(false); // Toggle buttons to their original state
        updateUserDataWithFormValues(userData); // Update user data with form values
        // Send the updated user data to the server
        await updateUserInfo(userData);
        // refetch data so it doesn't load on page refresh
        fetch(`http://localhost:3000/getUserInfo`, { method: "GET", headers: { "Content-Type": "application/json", }, credentials: 'include' });
    });

    // Function to update user data with form values
    function updateUserDataWithFormValues(userData) {
        userData.username = usernameField.value;
        userData.email = emailField.value;
        userData.firstname = firstnameField.value;
        userData.lastname = lastnameField.value;
        if (!userData.address) userData.address = {};
        userData.address.name = addressField.value;
        userData.address.city = cityField.value;
        userData.address.country = countryField.value;
        userData.address.countryCode = countrycodeField.value;

        // Update the UI with the new values
        firstnameField2.textContent = userData.firstname;
        lastnameField2.textContent = userData.lastname;
        cityField2.textContent = userData.address.city;
        countryField2.textContent = userData.address.country;
    }


    // Function to restore original field values
    function restoreOriginalFieldValues(userData){

        // Populate the form fields using the userData object
        if (userData.firstname) firstnameField2.textContent = userData.firstname;
        if (userData.lastname) lastnameField2.textContent = userData.lastname;
        if (userData.address) {
            if (userData.address.city) cityField2.textContent = userData.address.city;
            if (userData.address.country) countryField2.textContent = userData.address.country;
        }

        // Populate the form fields with editable values
        if (userData.username) usernameField.value = userData.username;
        if (userData.email) emailField.value = userData.email;
        if (userData.firstname) firstnameField.value = userData.firstname;
        else firstnameField.placeholder = "Πληκτρολογήστε εδώ το όνομά σας...";
        if (userData.lastname) lastnameField.value = userData.lastname;
        else lastnameField.placeholder = "Πληκτρολογήστε εδώ το επίθετό σας...";
        if (userData.address) {
            if (userData.address.name) addressField.value = userData.address.name;
            if (userData.address.city) cityField.value = userData.address.city;
            if (userData.address.country) countryField.value = userData.address.country;
            if (userData.address.countryCode) countrycodeField.value = userData.address.countryCode;
        } else {
            addressField.value = '';
            cityField.value = '';
            countryField.value = '';
            countrycodeField.value = '';
        }
    }

    // Append buttons to the button container
    buttonContainer.appendChild(editButton);    // Επεξεργασία
    //
    buttonContainer.appendChild(saveButton);    //
    buttonContainer.appendChild(cancelButton);  //
    // initially toggle save and cancel off
    toggleButtons(false);

    if (userData) {
        // On First run populate the form fields with the user data
        restoreOriginalFieldValues(userData);      

        // user's posted discounts
        const discountsSubmitedList = document.getElementById("discounts-submited");
        discountsSubmitedList.innerHTML = userPostedItems.map(product => 
            `<li class="li-styled">${product.name} - ${product.discount.discount_price}€ - posted on ${product.discount.date}</li>`
        ).join("");

        const likedDislikedDiscountsList = document.getElementById("discounts-liked-disliked");
        for (d in userLikedItems) {
            userLikedItems[d].liked = true;
            userLikedItems[d].disliked = false;
        }
        for (d in userDislikedItems) {
            userDislikedItems[d].liked = false;
            userDislikedItems[d].disliked = true;
        }
        // likes and dislikes that the user has made
        const likedDislikedDiscounts = userLikedItems.concat(userDislikedItems);
        likedDislikedDiscountsList.innerHTML = likedDislikedDiscounts.map(product => 
            `<li class="li-styled">${product.name} - ${product.discount.discount_price}€ - posted on ${product.discount.date} - προσφορά by ${product.username} - user has : ${product.liked ? "liked" : "disliked"} this</li>`
        ).join("");

        if (userData.points) {
            monthlyPoints.value = userData.points.monthly;
            totalPoints.value = userData.points.total;
            monthlyTokens.value = userData.tokens.monthly;
            totalTokens.value = userData.tokens.total;
        } else {
            monthlyPoints.value = 0;
            totalPoints.value = 0;
            monthlyTokens.value = 0;
            totalTokens.value = 0;
        }
    } else {
        console.error("User not found");
    }
});

// Function to send the updated user data to the server
async function updateUserInfo(userData) {
    const response = await fetch(`http://localhost:3000/updateUserInfo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(userData)
    });
    const data = await response.json();
    console.log(data);
}