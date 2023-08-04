document.getElementById('registrationForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent form submission

  // Get form input values
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var email = document.getElementById('email').value;
  var StartingTokens = 100;
  var tokens = { "total" : StartingTokens , "monthly" : StartingTokens};
  var points = { "total" : 0 , "monthly" : 0};
  var isAdmin = false;

  // Password validation regex
  var passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Email validation regex
  var emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  // Perform password validation
  if (!passwordRegex.test(password)) {
    showError('Password must be at least 8 characters long, contain at least one capital letter, one number, and one special character.');
    return;
  }

  // Perform email validation
  if (!emailRegex.test(email)) {
    showError("Please enter a valid email address.");
    return;
  }

  try {
    // Send the registration data to the server
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, tokens, points, email, password, isAdmin })
    });

    const data = await response.json();

    if (response.status === 409){
      console.log(data.error); 
      showError(data.error);
      return;
    }

    console.log(data.message); // This will display the success message from the server

    // Clear the form
    document.getElementById('registrationForm').reset();

    // Show a success message to the user (you can keep your existing success message code)
    showSuccess(data.message);
  } catch (error) {
    console.error('Error during registration:', error);
    // Handle errors and show an error message to the user, if needed
    showError('An error occurred during registration. Please try again later.');
  }
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent form submission
  var username = document.getElementById('username2').value;
  var password = document.getElementById('password2').value;

  try {
    // Send the login data to the server
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.status === 403){
      console.log(data.error); 
      showError(data.error);
      return;
    }
    console.log(data.message); // This will display the success message from the server

    // Clear the form
    document.getElementById('loginForm').reset();

    // Show a success message to the user (you can keep your existing success message code)
    showSuccess(data.message);
  } catch (error) {
    console.error('Error during login:', error);
    // Handle errors and show an error message to the user, if needed
    showError(error.message);
  }
});

// Function to show success message
function showSuccess(message) {
  var successBox = document.createElement('div');
  successBox.className = 'success-box';
  successBox.textContent = message;
  document.body.appendChild(successBox);

  setTimeout(function() {
    successBox.style.display = 'none';
  }, 5000);
}

// Function to show error message
function showError(message) {
  var errorBox = document.createElement('div');
  errorBox.className = 'error-box';
  errorBox.textContent = message;
  document.body.appendChild(errorBox);

  setTimeout(function() {
    errorBox.style.display = 'none';
  }, 10000);
}

// Attach event listener to the eye button to toggle password visibility
document.getElementById('togglePasswordVisibilityRegister').addEventListener('click', () => togglePasswordVisibility(true));
document.getElementById('togglePasswordVisibilityLogin').addEventListener('click', () => togglePasswordVisibility(false));

// Function to toggle password visibility
// If register is true, then the password input is the one in the registration form
// If register is false, then the password input is the one in the login form
function togglePasswordVisibility(register) {
  var p = register ? document.getElementById('password') : document.getElementById('password2');
  p.type = p.type === 'password' ? 'text' : 'password';
}

// Attach event listener to the password input for real-time validation
document.getElementById('password').addEventListener('input', validatePassword);

// Function to validate the password in real-time
function validatePassword() {
  var password = document.getElementById('password').value;

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

  // Update the message box with real-time results
  document.getElementById('lengthRequirement').className = lengthCompleted ? 'completed' : 'missing';
  document.getElementById('capitalLetterRequirement').className = capitalLetterCompleted ? 'completed' : 'missing';
  document.getElementById('numberRequirement').className = numberCompleted ? 'completed' : 'missing';
  document.getElementById('specialCharRequirement').className = specialCharCompleted ? 'completed' : 'missing';
}
