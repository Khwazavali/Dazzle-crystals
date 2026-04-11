let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartDisplay = document.getElementById("cart-count");

// Update count
function updateCartCount() {
    cartDisplay.textContent = cart.length;
}

updateCartCount();

// Select buttons
const buttons = document.querySelectorAll(".product-card button");

buttons.forEach(button => {
    button.addEventListener("click", () => {

        const name = button.getAttribute("data-name");
        const price = button.getAttribute("data-price");

        const image = button.getAttribute("data-image");

        const item = {
            name: name,
            price: price,
            image: image
        };

        cart.push(item);

        localStorage.setItem("cart", JSON.stringify(cart));

        updateCartCount();
    });
});