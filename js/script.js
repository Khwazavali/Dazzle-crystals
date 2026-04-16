let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartDisplay = document.getElementById("cart-count");
const resultCount = document.getElementById("result-count");
const priceCheckboxes = document.querySelectorAll(".price-filter");
const noResults = document.getElementById("no-results");

// GET COLLECTION FROM URL
const params = new URLSearchParams(window.location.search);
const selectedCollection = params.get("collection");

// Update count
function updateCartCount() {
    cartDisplay.textContent = cart.length;
}

updateCartCount();

// Select buttons
const buttons = document.querySelectorAll(".product-card button");

buttons.forEach(button => {
    button.addEventListener("click", () => {

        const name = button.getAttribute("data-name");
        const price = button.getAttribute("data-price");

        const image = button.getAttribute("data-image");
        const link = button.getAttribute("data-link");

        const item = {
            name: name,
            price: price,
            image: image,
            link: link
        };

        cart.push(item);

        localStorage.setItem("cart", JSON.stringify(cart));

        updateCartCount();
    });
});

// COLLECTION FILTER LOGIC

const checkboxes = document.querySelectorAll(".collection-filter");
const products = document.querySelectorAll(".product-card");

checkboxes.forEach(cb => {
    cb.addEventListener("change", filterProducts);
});

priceCheckboxes.forEach(cb => {
    cb.addEventListener("change", filterProducts);
});

const clearBtn = document.getElementById("clear-filters");

if (clearBtn) {
    clearBtn.addEventListener("click", () => {

        // uncheck collection filters
        checkboxes.forEach(cb => cb.checked = false);

        // uncheck price filters
        priceCheckboxes.forEach(cb => cb.checked = false);

        // re-run filter logic
        filterProducts();

        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function filterProducts() {
    let selectedCollections = [];
    let selectedPrices = [];
    let visibleCount = 0;

    // GET COLLECTIONS
    checkboxes.forEach(cb => {
        if (cb.checked) {
            selectedCollections.push(cb.value);
        }
    });

    // GET PRICE RANGES
    priceCheckboxes.forEach(cb => {
        if (cb.checked) {
            selectedPrices.push(cb.value);
        }
    });

    products.forEach(product => {

        const category = product.getAttribute("data-collection");
        const price = parseInt(
            product.querySelector(".price").textContent.replace("$", "")
        );

        let matchCollection = false;
        let matchPrice = false;

        // COLLECTION MATCH
        if (selectedCollections.length > 0) {
            matchCollection = selectedCollections.includes(category);
        }

        // PRICE MATCH
        if (selectedPrices.length > 0) {
            selectedPrices.forEach(range => {
                const [min, max] = range.split("-").map(Number);

                if (price >= min && price <= max) {
                    matchPrice = true;
                }
            });
        }

        let show = true;

        // COLLECTION CONDITION
        if (selectedCollections.length > 0) {
            show = show && matchCollection;
        }

        // PRICE CONDITION
        if (selectedPrices.length > 0) {
            show = show && matchPrice;
        }

        // FINAL DECISION
        if (show && (selectedCollections.length > 0 || selectedPrices.length > 0)) {
            product.style.display = "block";
            visibleCount++;
        } else {
            product.style.display = "none";
        }
    });

    resultCount.textContent = visibleCount + " Results";

    if (visibleCount === 0) {
        noResults.textContent = "No crystals match your filters. Try adjusting your selection ✨";
        noResults.style.display = "block";
    } else {
        noResults.style.display = "none";
    }
}

const sortDropdown = document.getElementById("sort");

sortDropdown.addEventListener("change", sortProducts);

function sortProducts() {
    const value = sortDropdown.value;
    const grid = document.querySelector(".product-grid");
    const items = Array.from(document.querySelectorAll(".product-card"));

    let sortedItems;

    if (value === "low-high") {
        sortedItems = items.sort((a, b) => {
            return a.querySelector(".price").textContent.replace("$", "") - 
                   b.querySelector(".price").textContent.replace("$", "");
        });
    } 
    else if (value === "high-low") {
        sortedItems = items.sort((a, b) => {
            return b.querySelector(".price").textContent.replace("$", "") - 
                   a.querySelector(".price").textContent.replace("$", "");
        });
    } 
    else {
        return;
    }

    grid.innerHTML = "";
    sortedItems.forEach(item => grid.appendChild(item));
}

if (selectedCollection) {
    const checkbox = document.querySelector(
        `.collection-filter[value="${selectedCollection}"]`
    );

    if (checkbox) {
        checkbox.checked = true;
    }

    filterProducts();
}


filterProducts();