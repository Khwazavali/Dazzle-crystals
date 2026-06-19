import { loadWishlist, removeFromWishlist } from "./wishlist-firestore.js";
import { addToCart } from "./cart-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("wishlist-container");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  let wishlist = [];

  if (currentUser?.uid) {
    loadWishlist(currentUser.uid).then((wishlistItems) => {
      wishlist = wishlistItems;

      renderWishlist();
    });
  } else {
    renderWishlist();
  }

  function renderWishlist() {
    if (wishlist.length === 0) {
      container.innerHTML = `
            <div class="empty-wishlist">
    <i class="fa-regular fa-heart"></i>

    <h2>Your Wishlist Is Empty</h2>

    <a href="shop.html" class="shop-btn">
        Browse Crystals
    </a>
</div>
        `;

      return;
    }

    wishlist.forEach((product) => {
      const card = document.createElement("div");

      card.classList.add("product-card");

      card.innerHTML = `

<a href="product.html?id=${product.id}">
    <img src="${product.image}" alt="${product.name}">
</a>

<a href="product.html?id=${product.id}" class="product-link">
    <h3>${product.name}</h3>
</a>

<p class="price">$${product.price}</p>

<button class="move-cart-btn">
    Move To Cart
</button>

<button class="remove-wishlist-btn">
    Remove
</button>

`;

      container.appendChild(card);

      // REMOVE

      card
        .querySelector(".remove-wishlist-btn")
        .addEventListener("click", async () => {
          wishlist = wishlist.filter((item) => item.id !== product.id);

          if (currentUser?.uid) {
            await removeFromWishlist(currentUser.uid, product.id);
          }

          location.reload();
        });

      // MOVE TO CART
      card
        .querySelector(".move-cart-btn")
        .addEventListener("click", async () => {
          if (currentUser?.uid) {
            await addToCart(currentUser.uid, product);

            await removeFromWishlist(currentUser.uid, product.id);
          }

          location.reload();
        });
    });
  }
});
