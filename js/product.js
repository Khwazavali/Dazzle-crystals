document.addEventListener("DOMContentLoaded", () => {

    const urlParams = new URLSearchParams(window.location.search);

    const productId = urlParams.get("id");

    fetch("products.json")

        .then(response => response.json())

        .then(products => {

            const product = products.find(p => p.id === productId);

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

            document.getElementById("product-weight").textContent =
                product.weight;

            document.getElementById("product-material").textContent =
                product.material;

            // =========================
            // MAIN IMAGE
            // =========================

            const mainImage =
                document.getElementById("main-product-image");

            mainImage.src = product.image;

            // =========================
            // THUMBNAILS
            // =========================

            const thumbnailRow =
                document.getElementById("thumbnail-row");

            product.gallery.forEach((image, index) => {

                const thumb = document.createElement("img");

                thumb.src = image;

                if (index === 0) {
                    thumb.classList.add("active-thumb");
                }

                thumb.addEventListener("click", () => {

                    mainImage.src = image;

                    document
                        .querySelectorAll(".thumbnail-row img")
                        .forEach(img => {
                            img.classList.remove("active-thumb");
                        });

                    thumb.classList.add("active-thumb");

                });

                thumbnailRow.appendChild(thumb);

            });

            // =========================
            // ADD TO CART
            // =========================

            const addCartBtn =
                document.getElementById("detail-add-cart");

            addCartBtn.addEventListener("click", () => {

                let cart =
                    JSON.parse(localStorage.getItem("cart")) || [];

                const alreadyInCart =
                    cart.some(item => item.id === product.id);

                if (alreadyInCart) {

                    addCartBtn.textContent = "✔ Already Added";

                    return;

                }

                const item = {

                    id: product.id,

                    name: product.name,

                    price: product.price,

                    image: product.image,

                    link: `product.html?id=${product.id}`

                };

                cart.push(item);

                localStorage.setItem("cart", JSON.stringify(cart));

                addCartBtn.textContent = "✔ Added to Cart";

                document.getElementById("cart-count").textContent =
                    cart.length;

            });

            // =========================
            // CART COUNT
            // =========================

            let cart =
                JSON.parse(localStorage.getItem("cart")) || [];

            document.getElementById("cart-count").textContent =
                cart.length;

            // =========================
            // RELATED PRODUCTS
            // =========================

            const relatedContainer =
                document.getElementById("related-products-container");

            const relatedProducts = products.filter(p =>

                p.collection === product.collection &&
                p.id !== product.id

            );

            relatedProducts.slice(0, 4).forEach(item => {

                const card = document.createElement("div");

                card.classList.add("product-card");

                card.innerHTML = `

                    <a href="product.html?id=${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                    </a>

                    <h3>${item.name}</h3>

                    <p class="price">$${item.price}</p>

                    <button>
                        Add to Cart
                    </button>

                `;

                relatedContainer.appendChild(card);

            });

        });

});