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

      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const exists = cart.some((item) => item.id === product.id);

      if (exists) {
        addCartBtn.textContent = "✔ Added";
      }

      addCartBtn.addEventListener("click", () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

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

        localStorage.setItem("cart", JSON.stringify(cart));

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

      const itemsPerPage = 4;

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

          const relatedAddBtn = card.querySelector(".related-add-cart");

          let cart = JSON.parse(localStorage.getItem("cart")) || [];

          const exists = cart.some((cartItem) => cartItem.id === item.id);

          if (exists) {
            relatedAddBtn.textContent = "✔ Added";
          }

          relatedAddBtn.addEventListener("click", () => {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];

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

            localStorage.setItem("cart", JSON.stringify(cart));

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
