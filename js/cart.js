document.addEventListener("DOMContentLoaded", function () {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const cartContainer = document.getElementById("cart-items");
    const totalDisplay = document.getElementById("total");
    const subtotalDisplay = document.getElementById("subtotal");

    let total = 0;

    cart.forEach((item, index) => {

        const div = document.createElement("div");
        div.classList.add("product-card");

        div.innerHTML = `
            <div class="cart-item-content">
                <img src="${item.image}" alt="${item.name}">

                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>$${item.price}</p>

                    <button class="remove-btn" onclick="removeItem(${index})">
                        Remove
                    </button>
                </div>
            </div>
        `;

        cartContainer.appendChild(div);

        total += parseInt(item.price);
    });

    subtotalDisplay.textContent = "Subtotal: $" + total;
    totalDisplay.textContent = "Total: $" + total;

});


function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
}