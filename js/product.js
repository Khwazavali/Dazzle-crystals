document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);

  const productId = urlParams.get("id");

  fetch("products.json")
    .then((response) => response.json())

    .then((products) => {
      const product = products.find((p) => p.id === productId);

      if (!product) return;

      // =========================
      // MAIN PRODUCT INFO
      // =========================

      document.getElementById("product-name").textContent = product.name;

      document.getElementById("product-price").textContent =
        "$" + product.price;

      document.getElementById("product-description").textContent =
        product.description;

      document.getElementById("product-dimensions").textContent =
        product.dimensions;

      document.getElementById("product-weight").textContent = product.weight;

      document.getElementById("product-material").textContent =
        product.material;

      // =========================
      // MAIN IMAGE
      // =========================

      const mainImage = document.getElementById("main-product-image");

      mainImage.src = product.image;

      // =========================
      // THUMBNAILS
      // =========================

      const thumbnailRow = document.getElementById("thumbnail-row");

      product.gallery.forEach((image, index) => {
        const thumb = document.createElement("img");

        thumb.src = image;

        if (index === 0) {
          thumb.classList.add("active-thumb");
        }

        thumb.addEventListener("click", () => {
          mainImage.src = image;

          document.querySelectorAll(".thumbnail-row img").forEach((img) => {
            img.classList.remove("active-thumb");
          });

          thumb.classList.add("active-thumb");
        });

        thumbnailRow.appendChild(thumb);
      });

      // =========================
      // ADD TO CART
      // =========================

      const addCartBtn = document.getElementById("detail-add-cart");

      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      const cartKey = currentUser ? `cart_${currentUser.email}` : "cart_guest";

      let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

      const exists = cart.some((item) => item.id === product.id);

      if (exists) {
        addCartBtn.textContent = "✔ Added";
      }

      addCartBtn.addEventListener("click", () => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));

        const cartKey = currentUser
          ? `cart_${currentUser.email}`
          : "cart_guest";

        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

        const exists = cart.some((item) => item.id === product.id);

        if (exists) {
          addCartBtn.textContent = "✔ Added";

          return;
        }

        const item = {
          id: product.id,

          name: product.name,

          price: product.price,

          image: product.image,

          link: `product.html?id=${product.id}`,
        };

        cart.push(item);

        localStorage.setItem(cartKey, JSON.stringify(cart));

        addCartBtn.textContent = "✔ Added to Cart";

        document.getElementById("cart-count").textContent = cart.length;
      });

      // =========================
      // CART COUNT
      // =========================

      document.getElementById("cart-count").textContent = cart.length;

      // =========================
      // RELATED PRODUCTS
      // =========================

      const relatedContainer = document.getElementById(
        "related-products-container",
      );

      const nextBtn = document.getElementById("related-next-btn");

      const prevBtn = document.getElementById("related-prev-btn");

      const relatedProducts = products.filter((p) => p.id !== product.id);

      let currentPage = 0;

      const itemsPerPage = window.innerWidth <= 600 ? 1 : 4;

      const totalPages = Math.ceil(relatedProducts.length / itemsPerPage);

      function renderRelatedProducts() {
        const start = currentPage * itemsPerPage;

        const end = start + itemsPerPage;

        const visibleProducts = relatedProducts.slice(start, end);

        relatedContainer.innerHTML = "";

        visibleProducts.forEach((item) => {
          const card = document.createElement("div");

          card.classList.add("product-card");

          card.innerHTML = `

      <div class="wishlist-icon">
        <i class="fa-regular fa-heart"></i>
      </div>

      <a href="product.html?id=${item.id}">
          <img src="${item.image}" alt="${item.name}">
      </a>

      <a href="product.html?id=${item.id}" class="product-link">
          <h3>${item.name}</h3>
      </a>

      <p class="price">$${item.price}</p>

      <button class="related-add-cart">
          Add to Cart
      </button>

    `;

          relatedContainer.appendChild(card);

          const wishlistBtn = card.querySelector(".wishlist-icon");

          const currentUser = JSON.parse(localStorage.getItem("currentUser"));

          const wishlistKey = currentUser
            ? `wishlist_${currentUser.email}`
            : "wishlist_guest";

          let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];

          const inWishlist = wishlist.some(
            (wishlistItem) => wishlistItem.id === item.id,
          );

          if (inWishlist) {
            wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
          }

          wishlistBtn.addEventListener("click", () => {
            let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];

            const exists = wishlist.some(
              (wishlistItem) => wishlistItem.id === item.id,
            );

            if (exists) {
              wishlist = wishlist.filter(
                (wishlistItem) => wishlistItem.id !== item.id,
              );

              wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
            } else {
              wishlist.push(item);

              wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
            }

            localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
          });

          const relatedAddBtn = card.querySelector(".related-add-cart");

          const cartUser = JSON.parse(localStorage.getItem("currentUser"));

          const cartKey = cartUser
            ? `cart_${cartUser.email}`
            : "cart_guest";

          let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

          const exists = cart.some((cartItem) => cartItem.id === item.id);

          if (exists) {
            relatedAddBtn.textContent = "✔ Added";
          }

          relatedAddBtn.addEventListener("click", () => {
            const currentUser = JSON.parse(localStorage.getItem("currentUser"));

            const cartKey = currentUser
              ? `cart_${currentUser.email}`
              : "cart_guest";

            let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

            const exists = cart.some((cartItem) => cartItem.id === item.id);

            if (exists) {
              relatedAddBtn.textContent = "✔ Added";

              return;
            }

            const cartItem = {
              id: item.id,

              name: item.name,

              price: item.price,

              image: item.image,

              link: `product.html?id=${item.id}`,
            };

            cart.push(cartItem);

            localStorage.setItem(cartKey, JSON.stringify(cart));

            relatedAddBtn.textContent = "✔ Added";

            document.getElementById("cart-count").textContent = cart.length;
          });
        });

        prevBtn.disabled = currentPage === 0;

        nextBtn.disabled = currentPage === totalPages - 1;
      }

      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages - 1) {
          currentPage++;

          renderRelatedProducts();
        }
      });

      prevBtn.addEventListener("click", () => {
        if (currentPage > 0) {
          currentPage--;

          renderRelatedProducts();
        }
      });

      renderRelatedProducts();
    });
});
