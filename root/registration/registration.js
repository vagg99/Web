document.getElementById('registrationForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent form submission

  // Get form input values
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var email = document.getElementById('email').value;
  var tokens = { "total" : 0 , "monthly" : 0};
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
      //dataType: 'jsonp',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, tokens, points, email, password, isAdmin })
    });

    const data = await response.json();
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
document.getElementById('togglePasswordVisibility').addEventListener('click', togglePasswordVisibility);

// Function to toggle password visibility
function togglePasswordVisibility() {
  var passwordInput = document.getElementById('password');
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
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
