const inputs = document.querySelectorAll(".input");
const registerButton = document.querySelector(".btn.register");

function addcl() {
    let parent = this.parentNode.parentNode;
    parent.classList.add("focus");
}

function remcl() {
    let parent = this.parentNode.parentNode;
    if (this.value == "") {
        parent.classList.remove("focus");
    }
}

// Add event listeners to input fields
inputs.forEach(input => {
    input.addEventListener("focus", addcl);
    input.addEventListener("blur", remcl);
});

// Prevent default behavior when the register button is clicked
registerButton.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default action of the button
    // You can add further functionality here if needed
});
