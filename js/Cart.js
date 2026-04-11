let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartContainer = document.getElementById("cart-items");
const totalDisplay = document.getElementById("total");
const subtotalDisplay = document.getElementById("subtotal");
const cartCountDisplay = document.getElementById("cart-count");

// ✅ Set cart count in navbar
cartCountDisplay.textContent = cart.length;

// Initialize total
let total = 0;

// Render items
cart.forEach((item, index) => {

    const div = document.createElement("div");
    div.classList.add("product-card");

    div.innerHTML = `
    <div class="cart-item-content">
        <img src="${item.image}" alt="${item.name}">
        
        <div class="cart-item-info">
            <h3>${item.name}</h3>
            <p>$${item.price}</p>
            <button onclick="removeItem(${index})">Remove</button>
        </div>
    </div>
`;

    cartContainer.appendChild(div);

    total += parseInt(item.price);
});

// ✅ Update totals AFTER calculation
subtotalDisplay.textContent = "Subtotal: $" + total;
totalDisplay.textContent = "Total: $" + total;


// ✅ Remove item
function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
}