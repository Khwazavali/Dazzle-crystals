import { loadCart, removeFromCart } from "./cart-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  let cart = [];
  const cartCount = document.getElementById("cart-count");
  cartCount.textContent = cart.length;

  const cartContainer = document.getElementById("cart-items");
  const continueShopping = document.getElementById("continue-shopping-link");
  const totalDisplay = document.getElementById("total");
  const subtotalDisplay = document.getElementById("subtotal");
  const subtotalPrice = document.getElementById("subtotal-price");

  function renderCart(cart) {
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
      continueShopping.style.display = "none";
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
                <button onclick="removeItem('${item.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>

        </div>
`;

      cartContainer.appendChild(div);

      total += Number(item.price);
    });

    const itemText = cart.length === 1 ? "item" : "items";

    subtotalDisplay.textContent = `Subtotal (${cart.length} ${itemText})`;

    subtotalPrice.textContent = "$" + total.toFixed(2);

    totalDisplay.textContent = "$" + total.toFixed(2);
  }
  if (currentUser?.uid) {
    loadCart(currentUser.uid).then((cartItems) => {
      renderCart(cartItems);
    });

    return;
  }
});

  async function removeItem(productId) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser?.uid) {
      await removeFromCart(currentUser.uid, productId);

      location.reload();

      return;
    }

    const cartKey = currentUser ? `cart_${currentUser.email}` : "cart_guest";

    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    cart = cart.filter((item) => item.id !== productId);

    localStorage.setItem(cartKey, JSON.stringify(cart));

    location.reload();
  }
  window.removeItem = removeItem;
