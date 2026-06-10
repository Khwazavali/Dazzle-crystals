document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const container = document.getElementById("orders-container");

  // =========================
  // CART COUNT
  // =========================

  const cartKey = currentUser ? `cart_${currentUser.email}` : "cart_guest";

  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  document.getElementById("cart-count").textContent = cart.length;

  if (!currentUser) {
    container.innerHTML = `
            <div class="empty-orders">

                <h2>Please Sign In</h2>

                <p>You need an account to view orders.</p>

            </div>
        `;

    return;
  }

  const ordersKey = `orders_${currentUser.email}`;

  const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];

  if (orders.length === 0) {
    container.innerHTML = `
            <div class="empty-orders">

                <i class="fa-solid fa-box-open"></i>

                <h2>No Orders Yet</h2>

                <p>Your crystal collection starts here.</p>

                <a href="shop.html" class="shop-btn">
                    Shop Now
                </a>

            </div>
        `;

    return;
  }

  const totalOrders = orders.length;

  const totalSpent = orders.reduce((sum, order) => {
    return sum + order.total;
  }, 0);

  const totalOrdersElement = document.getElementById("total-orders");

  const totalSpentElement = document.getElementById("total-spent");

  totalOrdersElement.textContent = totalOrders;

  totalSpentElement.textContent = "$" + totalSpent.toFixed(2);

  orders.reverse().forEach((order) => {
    const card = document.createElement("div");

    card.classList.add("order-card");

    const productNames = order.items
      .map((item) => `<li>${item.name}</li>`)
      .join("");

    card.innerHTML = `

    <div class="order-top">

        <h3>Order #${order.orderId}</h3>

        <span>${order.status}</span>

    </div>

    <p>
        Placed on ${order.date}
    </p>

    <ul class="order-products">
        ${productNames}
    </ul>

    <h4>
        Total: $${order.total.toFixed(2)}
    </h4>

    <button class="download-receipt-btn">
    Download Receipt
    </button>

`;

    container.appendChild(card);
    const receiptBtn = card.querySelector(".download-receipt-btn");

    receiptBtn.addEventListener("click", () => {
      generateReceipt(order);
    });

    function generateReceipt(order) {
      const { jsPDF } = window.jspdf;

      const doc = new jsPDF();

      const logo = new Image();

      logo.onload = function () {
        // =========================
        // PREMIUM HEADER
        // =========================

        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, 210, 32, "F");

        doc.addImage(logo, "PNG", 8, 4, 120, 24);

        doc.setFillColor(25, 25, 25);
        doc.roundedRect(150, 8, 42, 12, 3, 3, "F");

        doc.setTextColor(255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");

        doc.text(order.orderId, 171, 16, {
          align: "center",
        });

        doc.setTextColor(0);

        // =========================
        // ORDER CONFIRMED BADGE
        // =========================

        doc.setFillColor(223, 232, 208);
        doc.roundedRect(14, 42, 42, 8, 4, 4, "F");

        doc.setTextColor(68, 94, 40);
        doc.setFontSize(10);

        doc.text("Order confirmed", 35, 47, {
          align: "center",
        });

        doc.setTextColor(0);

        // =========================
        // ORDER INFO
        // =========================

        const today = order.date || new Date().toLocaleDateString();

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(120);

        doc.text("DATE", 14, 62);
        doc.text("PAYMENT", 70, 62);
        doc.text("ITEMS", 125, 62);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0);

        doc.text(today, 14, 71);

        doc.text("Card •••• 1234", 70, 71);

        doc.text(`${order.items.length} pieces`, 125, 71);

        // =========================
        // CUSTOMER INFO
        // =========================

        doc.setFillColor(242, 242, 242);
        doc.roundedRect(14, 82, 182, 38, 4, 4, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(0);

        doc.text(order.customer.name, 20, 94);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(60);

        doc.text(`${order.customer.email} · ${order.customer.phone}`, 20, 103);

        doc.text(
          `${order.customer.address}, ${order.customer.city}, ${order.customer.state} ${order.customer.zip}`,
          20,
          112,
        );

        doc.setDrawColor(200);
        doc.line(20, 122, 190, 122);

        // =========================
        // ITEMS
        // =========================

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(110);

        doc.text("PRODUCT", 20, 135);
        doc.text("QTY", 145, 135);
        doc.text("PRICE", 170, 135);

        doc.setDrawColor(215);
        doc.line(20, 140, 190, 140);

        let y = 152;

        order.items.forEach((item) => {
          if (y > 255) {
            doc.addPage();

            y = 30;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(110);

            doc.text("PRODUCT", 20, y);
            doc.text("QTY", 145, y);
            doc.text("PRICE", 170, y);

            doc.setDrawColor(215);
            doc.line(20, y + 5, 190, y + 5);

            y += 18;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(0);

          doc.text(item.name, 20, y);

          doc.setFont("helvetica", "normal");

          doc.text("1", 148, y);

          doc.text(`$${item.price}`, 170, y);

          doc.setDrawColor(235);
          doc.line(20, y + 6, 190, y + 6);

          y += 16;
        });

        y += 10;

        // =========================
        // WATERMARK
        // =========================

        doc.setTextColor(252);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(38);

        doc.text("DAZZLE", 85, 205, {
          angle: 35,
        });

        doc.setTextColor(0);
        doc.setFontSize(12);

        // =========================
        // TOTALS
        // =========================

        doc.setFont("helvetica", "normal");
        doc.setFontSize(13);
        doc.setTextColor(40);

        doc.text("Subtotal", 20, y);
        doc.text(`$${order.subtotal.toFixed(2)}`, 168, y);

        y += 12;

        doc.text("Delivery", 20, y);
        doc.text(`$${order.delivery.toFixed(2)}`, 168, y);

        y += 18;

        doc.setFillColor(0, 0, 0);
        doc.roundedRect(14, y - 10, 182, 22, 4, 4, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(255);

        doc.text("Total", 20, y + 3);

        doc.text(`$${order.total.toFixed(2)}`, 168, y + 3);

        doc.setTextColor(0);

        y += 22;

        // =========================
        // DELIVERY NOTE
        // =========================

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(70);

        doc.text("Estimated Delivery: 3-5 Business Days", 20, y);

        y += 18;

        // =========================
        // FOOTER
        // =========================

        doc.setDrawColor(225);
        doc.line(0, y - 4, 210, y - 4);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(70);

        y += 10;

        doc.text("Thank you for shopping with Dazzle Crystals", 105, y, {
          align: "center",
        });

        doc.setFontSize(10);
        doc.setTextColor(150);

        y += 8;

        doc.text("Crafted with elegance", 105, y, {
          align: "center",
        });

        // =========================
        // SAVE PDF
        // =========================

        doc.save(`Receipt-${order.orderId}.pdf`);
      };

      logo.src = "images/ReceiptLogo.png";
    }
  });
});
