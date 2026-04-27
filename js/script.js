document.addEventListener("DOMContentLoaded", function () {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  function isItemInCart(id) {
    return cart.some((item) => item.id === id);
  }

  const cartDisplay = document.getElementById("cart-count");
  const resultCount = document.getElementById("result-count");
  const priceCheckboxes = document.querySelectorAll(".price-filter");
  const noResults = document.getElementById("no-results");

  // GET COLLECTION FROM URL
  const params = new URLSearchParams(window.location.search);
  const selectedCollection = params.get("collection");

  // Update count
  function updateCartCount() {
    if (cartDisplay) {
      cartDisplay.textContent = cart.length;
    }
  }

  updateCartCount();

  // COLLECTION FILTER LOGIC

  const checkboxes = document.querySelectorAll(".collection-filter");

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", filterProducts);
  });

  priceCheckboxes.forEach((cb) => {
    cb.addEventListener("change", filterProducts);
  });

  const clearBtn = document.getElementById("clear-filters");

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      checkboxes.forEach((cb) => (cb.checked = false));
      priceCheckboxes.forEach((cb) => (cb.checked = false));

      filterProducts();

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function filterProducts() {
    let selectedCollections = [];
    let selectedPrices = [];
    let visibleCount = 0;

    checkboxes.forEach((cb) => {
      if (cb.checked) {
        selectedCollections.push(cb.value);
      }
    });

    priceCheckboxes.forEach((cb) => {
      if (cb.checked) {
        selectedPrices.push(cb.value);
      }
    });

    const products = document.querySelectorAll(".product-card");
    products.forEach((product) => {
      const category = product.getAttribute("data-collection");
      const price = Number(
        product.querySelector(".price").textContent.replace("$", ""),
      );

      let matchCollection = false;
      let matchPrice = false;

      if (selectedCollections.length > 0) {
        matchCollection = selectedCollections.includes(category);
      }

      if (selectedPrices.length > 0) {
        selectedPrices.forEach((range) => {
          const [min, max] = range.split("-").map(Number);

          if (price >= min && price <= max) {
            matchPrice = true;
          }
        });
      }

      let show = true;

      if (selectedCollections.length > 0) {
        show = show && matchCollection;
      }

      if (selectedPrices.length > 0) {
        show = show && matchPrice;
      }

      if (selectedCollections.length === 0 && selectedPrices.length === 0) {
        product.style.display = "block";
        visibleCount++;
      } else if (show) {
        product.style.display = "block";
        visibleCount++;
      } else {
        product.style.display = "none";
      }
    });

    if (resultCount) {
      resultCount.textContent = visibleCount + " Results";
    }

    if (noResults) {
      if (visibleCount === 0) {
        noResults.textContent = "No crystals match your filters ✨";
        noResults.style.display = "block";
      } else {
        noResults.style.display = "none";
      }
    }
  }

  const sortDropdown = document.getElementById("sort");

  if (sortDropdown) {
    sortDropdown.addEventListener("change", sortProducts);
  }

  function sortProducts() {
    const value = sortDropdown.value;
    const grid = document.querySelector(".product-grid");
    const items = Array.from(document.querySelectorAll(".product-card"));

    let sortedItems;

    if (value === "low-high") {
      sortedItems = items.sort((a, b) => {
        return (
          a.querySelector(".price").textContent.replace("$", "") -
          b.querySelector(".price").textContent.replace("$", "")
        );
      });
    } else if (value === "high-low") {
      sortedItems = items.sort((a, b) => {
        return (
          b.querySelector(".price").textContent.replace("$", "") -
          a.querySelector(".price").textContent.replace("$", "")
        );
      });
    } else {
      return;
    }

    grid.innerHTML = "";
    sortedItems.forEach((item) => grid.appendChild(item));
  }

  // LOAD PRODUCTS
  fetch("products.json")
    .then((response) => response.json())
    .then((products) => {
      let currentPage = 0;
      const itemsPerPage = 4;
      let totalPages = 0;

      const isHomePage =
        window.location.pathname.includes("index.html") ||
        window.location.pathname === "/" ||
        window.location.pathname.endsWith("/dazzle-crystals/") || // ✅ your repo name
        window.location.pathname.endsWith("/"); // ✅ any subfolder root

      const container = document.getElementById("product-container");
      const nextBtn = document.getElementById("next-btn");
      const prevBtn = document.getElementById("prev-btn");

      if (!container) return;

      function renderProducts(products) {
        const featuredProducts = products.filter((p) => p.featured);
        totalPages = Math.ceil(featuredProducts.length / itemsPerPage);

        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;

        const visibleProducts = featuredProducts.slice(start, end); // ✅ FIXED

        container.innerHTML = "";

        visibleProducts.forEach((product) => {
          const card = document.createElement("div");
          card.classList.add("product-card");
          card.setAttribute("data-collection", product.collection);

          card.innerHTML = `
                ${
                  product.image
                    ? `<img src="${product.image}" alt="${product.name}">`
                    : `<div class="no-image">No Image</div>`
                }
                <h3>${product.name}</h3>
                <p class="product-desc">Handcrafted crystal decor piece</p>
                <p class="price">$${product.price}</p>

                <button 
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image="${product.image}"
                    data-link="#"
                >
                    Add to Cart
                </button>
            `;

          container.appendChild(card);

          const button = card.querySelector("button");
          if (isItemInCart(product.id)) {
            button.textContent = "✔ Added";
            button.disabled = true;
          }

          button.addEventListener("click", () => {
            // 🔴 If already in cart
            if (isItemInCart(product.id)) {
              const message = document.getElementById("cart-message");

              if (message) {
                message.textContent = "Already in your cart ✨";
                message.classList.add("show");

                setTimeout(() => {
                  message.classList.remove("show");
                }, 2000);
              }

              return;
            }

            // 🟢 Add new item
            const item = {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              link: "#",
            };

            cart.push(item);
            localStorage.setItem("cart", JSON.stringify(cart));

            updateCartCount();

            // ✅ Update button
            button.textContent = "✔ Added";
            button.disabled = true;

            // ✅ Show message
            const message = document.getElementById("cart-message");

            if (message) {
              message.textContent = item.name + " added to cart 🛒";
              message.classList.add("show");

              setTimeout(() => {
                message.classList.remove("show");
              }, 2000);
            }
          });
        });

        // Disable buttons
        if (prevBtn && nextBtn) {
          prevBtn.disabled = currentPage === 0;
          nextBtn.disabled = currentPage === totalPages - 1;
        }
      }

      if (isHomePage) {
        renderProducts(products);
      } else {
        container.innerHTML = "";

        products.forEach((product) => {
          const card = document.createElement("div");
          card.classList.add("product-card");
          card.setAttribute("data-collection", product.collection);

          card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="product-desc">Handcrafted crystal decor piece</p>
                <p class="price">$${product.price}</p>

                <button 
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image="${product.image}"
                    data-link="#"
                >
                    Add to Cart
                </button>
            `;

          container.appendChild(card);

          const button = card.querySelector("button");
          if (isItemInCart(product.id)) {
            button.textContent = "✔ Added";
            button.disabled = true;
          }

          button.addEventListener("click", () => {
            // 🔴 If already in cart
            if (isItemInCart(product.id)) {
              const message = document.getElementById("cart-message");

              if (message) {
                message.textContent = "Already in your cart ✨";
                message.classList.add("show");

                setTimeout(() => {
                  message.classList.remove("show");
                }, 2000);
              }

              return;
            }

            // 🟢 Add new item
            const item = {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              link: "#",
            };

            cart.push(item);
            localStorage.setItem("cart", JSON.stringify(cart));

            updateCartCount();

            // ✅ Update button
            button.textContent = "✔ Added";
            button.disabled = true;

            // ✅ Show message
            const message = document.getElementById("cart-message");

            if (message) {
              message.textContent = item.name + " added to cart 🛒";
              message.classList.add("show");

              setTimeout(() => {
                message.classList.remove("show");
              }, 2000);
            }
          });
        });

        // Apply collection filter from URL AFTER rendering
        if (selectedCollection) {
          const checkbox = document.querySelector(
            `.collection-filter[value="${selectedCollection}"]`,
          );

          if (checkbox) {
            checkbox.checked = true;
            filterProducts();
          }
        }
      }

      if (nextBtn && prevBtn) {
        nextBtn.addEventListener("click", () => {
          if (currentPage < totalPages - 1) {
            currentPage++;
            renderProducts(products);
          }
        });

        prevBtn.addEventListener("click", () => {
          if (currentPage > 0) {
            currentPage--;
            renderProducts(products);
          }
        });
      }
    })
    .catch((error) => console.log("Error loading products:", error));
});
