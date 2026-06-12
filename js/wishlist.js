document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("wishlist-container");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const wishlistKey = currentUser
    ? `wishlist_${currentUser.email}`
    : "wishlist_guest";

  let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];

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

    card.querySelector(".remove-wishlist-btn").addEventListener("click", () => {
      wishlist = wishlist.filter((item) => item.id !== product.id);

      localStorage.setItem(wishlistKey, JSON.stringify(wishlist));

      location.reload();
    });

    // MOVE TO CART

    card.querySelector(".move-cart-btn").addEventListener("click", () => {
      const cartKey = currentUser ? `cart_${currentUser.email}` : "cart_guest";

      let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

      const exists = cart.some((item) => item.id === product.id);

      if (!exists) {
        cart.push(product);

        localStorage.setItem(cartKey, JSON.stringify(cart));
      }

      wishlist = wishlist.filter((item) => item.id !== product.id);

      localStorage.setItem(wishlistKey, JSON.stringify(wishlist));

      location.reload();
    });
  });
});
