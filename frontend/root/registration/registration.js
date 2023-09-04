document.getElementById('registrationForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent form submission

  // Show loading spinner
  var spinner = this.querySelector('.spinner');
  spinner.style.display = 'inline-block';

  // Get form input values
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var email = document.getElementById('email').value;

  // Password validation regex
  var passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Email validation regex
  var emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  // Perform password validation
  if (!passwordRegex.test(password)) {
    // clear the password field
    spinner.style.display = 'none';
    showPopup('Invalid password');  // error popup
    document.getElementById('password').value = '';
    return;
  }

  try {
    // Send the registration data to the server
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (response.status === 409){
      console.log(data.error); 
      showPopup(data.error);  // error popup
      // Hide the spinner after registration error
      spinner.style.display = 'none';
      return;
    }

    console.log(data.message); // This will display the success message from the server
    
    // Clear the form
    this.reset();

    // Hide the spinner after successful sign up
    setTimeout(() => {
      spinner.style.display = 'none';
      // Show a success message to the user
      showPopup(data.message);  // success popup
    }, 1337); // Delay of 1.337 seconds before showing success message

  } catch (error) {
    console.error('Error during registration:', error);
    // Handle errors and show an error message to the user, if needed
    showPopup('An error occurred during registration. Please try again later.');  // error popup
    // Hide the spinner after registration error
    spinner.style.display = 'none';
  }
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent form submission

  // Show loading spinner
  var spinner = this.querySelector('.spinner');
  spinner.style.display = 'inline-block';  // Show the spinner

  var username = document.getElementById('username2').value;
  var password = document.getElementById('password2').value;

  try {
    // Send the login data to the server
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials : 'include',
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.status === 403){
      console.log(data.error); 
      showPopup(data.error);  // error popup
      setTimeout(() => {
        spinner.style.display = 'none';}, 1337); 
      return;
    }

    console.log(data.message); // This will display the success message from the server
    if (!data.message) return;

    // Clear the form
    this.reset();

    // Hide the spinner after successful login
    setTimeout(() => {
      spinner.style.display = 'none';
      // Show a success message to the user
      showPopup(data.message); // success popup
    }, 1337); // Delay of 1.337 seconds before showing success message

    // cache user info
    fetch(`http://localhost:3000/getUserInfo`, { method: "GET", headers: { "Content-Type": "application/json", }, credentials: 'include' });

    // Show the profile button
    const profileLink = document.getElementById('profileLink');
    profileLink.style.display = 'block';
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.style.display = 'block';
    // Show the admin button
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

  } catch (error) {
    console.error('Error during login:', error);
    // Handle errors and show an error message to the user, if needed
    showPopup(error.message);  // error popup
    // Hide the spinner after login error
    spinner.style.display = 'none';
  }
});

// // Function to show success message
// function showSuccess(message) {
//   var successBox = document.createElement('div');
//   successBox.className = 'success-box';
//   successBox.textContent = message;
//   document.body.appendChild(successBox);

//   setTimeout(function() {
//     successBox.style.display = 'none';
//   }, 5000);
// }

// // Function to show error message
// function showError(message) {
//   var errorBox = document.createElement('div');
//   errorBox.className = 'error-box';
//   errorBox.textContent = message;
//   document.body.appendChild(errorBox);
  
//   setTimeout(function() {
//     errorBox.style.display = 'none';
//   }, 10000);
// }


// Popup function
// -> call by: showPopup(error.message / data.message);

function showPopup(message, duration = 1000) {
  const popupContainer = document.getElementById('popupContainer');
  const popupContent = document.getElementById('popupContent');
  popupContent.textContent = message;
  popupContainer.style.display = 'flex';

  setTimeout(() => {
    popupContainer.style.display = 'none';
  }, duration);
}

// Attach event listener to the password input for real-time validation
document.getElementById('password').addEventListener('input', validatePassword);

// Function to validate the password in real-time
function validatePassword() {
  var password = document.getElementById('password').value;
  var passwordWarning = document.getElementById('passwordWarning');
  var passwordRequirementsContainer = document.querySelector('.password-requirements-container');

  // Password requirements
  var lengthRequirement = /^(?=.{8,})/;
  var capitalLetterRequirement = /^(?=.*[A-Z])/;
  var numberRequirement = /^(?=.*\d)/;
  var specialCharRequirement = /^(?=.*[@$!%*?&])/;

  // Check password against each requirement
  var lengthCompleted = lengthRequirement.test(password);
  var capitalLetterCompleted = capitalLetterRequirement.test(password);
  var numberCompleted = numberRequirement.test(password);
  var specialCharCompleted = specialCharRequirement.test(password);

  // Show/hide the warning message and requirements container based on validation results
  if (lengthCompleted && capitalLetterCompleted && numberCompleted && specialCharCompleted) {
    passwordWarning.style.display = 'none';
    passwordRequirementsContainer.style.display = 'none';
  } else {
      passwordWarning.style.display = 'block';
      passwordRequirementsContainer.style.display = 'block';
  }

  // Update the class of each requirement element
  updateRequirementClass('lengthRequirement', lengthCompleted);
  updateRequirementClass('capitalLetterRequirement', capitalLetterCompleted);
  updateRequirementClass('numberRequirement', numberCompleted);
  updateRequirementClass('specialCharRequirement', specialCharCompleted);
}

document.getElementById('togglePassword').addEventListener('click', async function(event) {
  event.preventDefault();
  var field = document.getElementById('password');
  field.type = field.type === 'password' ? 'text' : 'password';
});
document.getElementById('togglePassword2').addEventListener('click', async function(event) {
  event.preventDefault();
  var field = document.getElementById('password2');
  field.type = field.type === 'password' ? 'text' : 'password';
});

// Function to update the class of a requirement element
function updateRequirementClass(requirementId, isCompleted) {
    var requirementElement = document.getElementById(requirementId);
    requirementElement.className = isCompleted ? 'completed' : 'missing';
}

function setupFormSwapping() {
  let wrapper = document.querySelector('.wrapper'),
      signUpLink = document.querySelector('.link .signup-link'),
      signInLink = document.querySelector('.link .signin-link');

  signUpLink.addEventListener('click', () => {
      wrapper.classList.add('animated-signin');
      wrapper.classList.remove('animated-signup');
  });

  signInLink.addEventListener('click', () => {
      wrapper.classList.add('animated-signup');
      wrapper.classList.remove('animated-signin');
  });
}

// Call the function to set up the form swapping functionality
setupFormSwapping();