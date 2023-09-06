var passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
    const passwordField1 = document.getElementById("input-password");   //password
    const passwordField2 = document.getElementById("input-password2");  //password confirmation
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

    // Function to toggle the "Επεξεργασία" , "Αποθήκευση", "Ακύρωση" buttons
    function toggleButtons(editMode) {
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
    saveButton.textContent = "Αποθήκευση";
    saveButton.classList.add("btn", "btn-sm", "btn-success");
    saveButton.style.display = "inline-block"; // Initially hidden

    // save button visuals by default without mousover
    saveButton.style.backgroundColor = "#2dce89";
    saveButton.style.color = "#fff";

    // Cancel
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Ακύρωση";
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
        toggleButtons(false); // Toggle buttons to their original state
        restoreOriginalFieldValues(userData); // Restore original field values
    });

    // Add event listener to the save button
    saveButton.addEventListener("click", async () => {
        if (passwordField1.value || passwordField2.value) {
            if (passwordField1.value != passwordField2.value) {
                alert("Passwords don't match");
                return;
            }
            if (!passwordRegex.test(passwordField1.value)) {
                alert("Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 number and 1 special character");
                return;
            }
            userData.newpassword = passwordField1.value;
            passwordField1.value = "";
            passwordField2.value = "";
        }
        inputFields.forEach(input => {
            input.readOnly = true; // Set input fields back to read-only
        });
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
        passwordField1.value = "";
        passwordField2.value = "";
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

        const history = document.getElementById("history");

        // user's posted discounts
        if (userPostedItems.length > 0) {
            // Create the container for the submitted discounts section
            const submittedDiscountsContainer = document.createElement("div");
            submittedDiscountsContainer.innerHTML = `<label for="discounts-submited">Προσφορές που έχεις υποβάλει εσύ</label><ul id="discounts-submited"></ul>`;
            history.appendChild(submittedDiscountsContainer);

            const discountsSubmitedList = document.getElementById("discounts-submited");
            let output = "";
            for (product of userPostedItems) {
                let name = product.name;
                let discount_price = product.discount.discount_price;
                let date = product.discount.date;
                let image = product.img;
                let in_stock = product.in_stock;

                output += `
                    <li class="submitted-product-item">
                    <div class="submitted-product-image">
                        <img src="${image}" alt="${name}" class="product-img">
                    </div>
                        <div class="submitted-product-details">
                            <span class="submitted-product-name">${name}</span>
                            <span class="submitted-product-price">${discount_price}€</span>
                            <span class="submitted-product-date">posted on ${date}</span>
                        </div>
                    </li>
                `;
            }
            discountsSubmitedList.innerHTML = output;
        }

        // likes and dislikes that the user has made
        if (userLikedItems > 0 || userDislikedItems > 0) {
            // Create the container for the likes/dislikes section
            const likesDislikesContainer = document.createElement("div");
            likesDislikesContainer.innerHTML = `<label for="discounts-liked-disliked">Likes και Dislikes που έχεις κάνει</label><ul id="discounts-liked-disliked"></ul>`;
            history.appendChild(likesDislikesContainer);

            const likedDislikedDiscountsList = document.getElementById("discounts-liked-disliked");
            for (d in userLikedItems) {
                userLikedItems[d].liked = true;
                userLikedItems[d].disliked = false;
            }
            for (d in userDislikedItems) {
                userDislikedItems[d].liked = false;
                userDislikedItems[d].disliked = true;
            }
            
            const likedDislikedDiscounts = userLikedItems.concat(userDislikedItems);
            output = "";
            for (product of likedDislikedDiscounts) {
                let name = product.name;
                let discount_price = product.discount.discount_price;
                let date = product.discount.date;
                let image = product.img;
                let in_stock = product.in_stock;
                let liked = product.liked;
                let disliked = product.disliked;
                let op = product.username; // op = Original Poster , reddit slang

                output += `
                    <li class="product-item">
                        <div class="product-image">
                            <img src="${image}" alt="${name}" class="product-img">
                        </div>
                        <div class="product-details">
                            <span class="product-name">${name}</span>
                            <span class="product-price">${discount_price}€</span>
                            <span class="product-date">posted on ${date}</span>
                            <span class="product-op">προσφορά by ${op}</span>
                        </div>
                        <div class="product-actions">
                            <span class="product-liked">${liked ? "Liked" : "Disliked"}</span>
                        </div>
                    </li>
                `;
            }
            likedDislikedDiscountsList.innerHTML = output;
        }

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