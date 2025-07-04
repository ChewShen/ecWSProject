
let isFirstCharacter = true;
let timer;
// Function to handle the password input behavior
function handlePasswordInput(event) {
    const passwordInput = document.getElementById("inputPassword");

    // Check if it's the first character
    if (isFirstCharacter) {
        togglePasswordVisibility(passwordInput);
    }

    // Reset the timer on every keypress to start the delay again
    clearTimeout(timer);
    timer = setTimeout(() => {
        revertPasswordVisibility(passwordInput); // Change back to password after delay
    }, 1000); // Adjust the delay as needed (1000ms = 1 second)
}

// Function to toggle password visibility (show as plain text for the first character)
function togglePasswordVisibility(passwordInput) {
    passwordInput.type = "text"; // Change input type to 'text' to show the typed character
}

// Function to revert to password visibility (dots after delay)
function revertPasswordVisibility(passwordInput) {
    passwordInput.type = "password"; // Change back to 'password' after 1 second of inactivity
}

const passwordInput = document.getElementById("inputPassword");
passwordInput.addEventListener("input", handlePasswordInput);