document.addEventListener("DOMContentLoaded", function () {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = document.getElementById("cart-count");
    cartCount.textContent = cart.length;

    const cartContainer = document.getElementById("cart-items");
    const totalDisplay = document.getElementById("total");
    const subtotalDisplay = document.getElementById("subtotal");

    // ✅ SHOW MESSAGE IF CART IS EMPTY
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-cart-shopping empty-icon"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven’t added any crystals yet ✨</p>
                <a href="index.html#collections" class="shop-btn">Shop Now</a>
            </div>
        `;
        subtotalDisplay.textContent = "Subtotal: $0.00";
        totalDisplay.textContent = "Total: $0.00";
        return;
    }

    let total = 0; /*for test*/

    cart.forEach((item, index) => {

        const div = document.createElement("div");
        div.classList.add("product-card");

        div.innerHTML = `
        <div class="cart-item-content">

            <img src="${item.image}" alt="${item.name}">

            <div class="cart-item-info">
                <a href="${item.link}" class="cart-title">${item.name}</a>
                <p class="cart-price">$${item.price}</p>
            </div>

            <div class="cart-delete">
                <button onclick="removeItem(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>

        </div>
`;

        cartContainer.appendChild(div);

        total += Number(item.price);
    });

    subtotalDisplay.textContent = "Subtotal: $" + total.toFixed(2);
    totalDisplay.textContent = "Total: $" + total.toFixed(2);

});


function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    const cartCount = document.getElementById("cart-count");
    cartCount.textContent = cart.length;

    location.reload();
}