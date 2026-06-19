import { loadProducts } from "./products-firestore.js";
import { loadCart, addToCart, removeFromCart } from "./cart-firestore.js";
import {
  loadWishlist,
  addToWishlist,
  removeFromWishlist,
} from "./wishlist-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);

  const productId = urlParams.get("id");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  let cart = [];
  let wishlist = [];

  function startProductPage() {
    loadProducts().then((products) => {
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

      const galleryImages =
        product.gallery && product.gallery.length > 0
          ? product.gallery
          : [product.image];

      galleryImages.forEach((image, index) => {
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

      const exists = cart.some((item) => item.id === product.id);

      if (exists) {
        addCartBtn.textContent = "✔ Added";
      }
      addCartBtn.addEventListener("click", () => {
        const exists = cart.some((item) => item.id === product.id);

        if (exists) {
          cart = cart.filter((item) => item.id !== product.id);

          if (currentUser?.uid) {
            removeFromCart(currentUser.uid, product.id);
          }

          addCartBtn.textContent = "Add To Cart";

          document.getElementById("cart-count").textContent = cart.length;

          const mobileCartCount = document.getElementById("mobile-cart-count");

          if (mobileCartCount) {
            mobileCartCount.textContent = cart.length;
          }

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

        if (currentUser?.uid) {
          addToCart(currentUser.uid, item);
        }

        addCartBtn.textContent = "✔ Added to Cart";

        document.getElementById("cart-count").textContent = cart.length;

        const mobileCartCount = document.getElementById("mobile-cart-count");

        if (mobileCartCount) {
          mobileCartCount.textContent = cart.length;
        }
      });

      // =========================
      // CART COUNT
      // =========================

      document.getElementById("cart-count").textContent = cart.length;

      const mobileCartCount = document.getElementById("mobile-cart-count");

      if (mobileCartCount) {
        mobileCartCount.textContent = cart.length;
      }

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

          const inWishlist = wishlist.some(
            (wishlistItem) => wishlistItem.id === item.id,
          );

          if (inWishlist) {
            wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
          }

          wishlistBtn.addEventListener("click", () => {
            const exists = wishlist.some(
              (wishlistItem) => wishlistItem.id === item.id,
            );

            if (exists) {
              wishlist = wishlist.filter(
                (wishlistItem) => wishlistItem.id !== item.id,
              );

              if (currentUser?.uid) {
                removeFromWishlist(currentUser.uid, item.id);
              }

              wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
            } else {
              wishlist.push(item);

              if (currentUser?.uid) {
                addToWishlist(currentUser.uid, item);
              }

              wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
            }
          });

          const relatedAddBtn = card.querySelector(".related-add-cart");
          console.log("RELATED CHECK", item.name, cart.length);

          const exists = cart.some((cartItem) => cartItem.id === item.id);

          if (exists) {
            relatedAddBtn.textContent = "✔ Added";
          }

          relatedAddBtn.addEventListener("click", () => {
            const exists = cart.some((cartItem) => cartItem.id === item.id);

            if (exists) {
              cart = cart.filter((cartItem) => cartItem.id !== item.id);

              if (currentUser?.uid) {
                removeFromCart(currentUser.uid, item.id);
              }

              relatedAddBtn.textContent = "Add To Cart";

              document.getElementById("cart-count").textContent = cart.length;

              const mobileCartCount =
                document.getElementById("mobile-cart-count");

              if (mobileCartCount) {
                mobileCartCount.textContent = cart.length;
              }

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

            if (currentUser?.uid) {
              addToCart(currentUser.uid, cartItem);
            }

            relatedAddBtn.textContent = "✔ Added";

            document.getElementById("cart-count").textContent = cart.length;

            const mobileCartCount =
              document.getElementById("mobile-cart-count");

            if (mobileCartCount) {
              mobileCartCount.textContent = cart.length;
            }
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
  }
  if (currentUser?.uid) {
    loadCart(currentUser.uid).then((cartItems) => {
      cart = cartItems;

      loadWishlist(currentUser.uid).then((wishlistItems) => {
        wishlist = wishlistItems;

        startProductPage();
      });
    });
  } else {
    startProductPage();
  }
});
