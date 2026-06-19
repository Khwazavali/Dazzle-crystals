import { addOrder } from "./orders-firestore.js";
import { clearCart } from "./cart-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const street = document.getElementById("street");
  const city = document.getElementById("city");
  const state = document.getElementById("state");
  const zip = document.getElementById("zip");

  const deliveryCharge = document.getElementById("delivery-charge");

  zip.addEventListener("input", function () {
    const zipValue = zip.value.trim();

    if (/^\d{5}$/.test(zipValue)) {
      const shipping = 12;

      deliveryCharge.textContent = "$" + shipping.toFixed(2);

      totalElement.textContent = "$" + (total + shipping).toFixed(2);
    } else {
      deliveryCharge.textContent = "Enter 5 digit zipcode";

      totalElement.textContent = "$" + total.toFixed(2);
    }
  });

  const nextBtn = document.getElementById("next-btn");

  // LOAD CART SUMMARY

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const cartKey = currentUser ? `cart_${currentUser.email}` : "cart_guest";

  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  const cartCount = document.getElementById("cart-count");

  if (cartCount) {
    cartCount.textContent = cart.length;
  }

  const subtotalElement = document.getElementById("checkout-subtotal");
  const totalElement = document.getElementById("checkout-total");

  let total = 0;

  cart.forEach((item) => {
    total += Number(item.price);
  });

  const checkoutItems = document.getElementById("checkout-items");

  cart.forEach((item) => {
    const itemDiv = document.createElement("div");

    itemDiv.classList.add("checkout-item");

    itemDiv.innerHTML = `
    <div class="checkout-product-row">
        <p>${item.name} × 1</p>
        <span>$${item.price}</span>
    </div>
`;

    checkoutItems.appendChild(itemDiv);
  });

  subtotalElement.textContent = "$" + total.toFixed(2);

  totalElement.textContent = "$" + total.toFixed(2);

  // STEP NAVIGATION ELEMENTS
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");

  const stepIndicator1 = document.getElementById("step-indicator-1");
  const stepIndicator2 = document.getElementById("step-indicator-2");

  const backBtn = document.getElementById("back-btn");

  function validateForm() {
    const isNameValid = name.value.trim().length >= 2;

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);

    const isPhoneValid = /^\d{10}$/.test(phone.value.trim());

    const isStreetValid = street.value.trim().length >= 5;

    const isCityValid = city.value.trim().length >= 2;

    const isStateValid = state.value !== "";

    const isZipValid = /^\d{5}$/.test(zip.value.trim());

    nextBtn.disabled = !(
      isNameValid &&
      isEmailValid &&
      isPhoneValid &&
      isStreetValid &&
      isCityValid &&
      isStateValid &&
      isZipValid
    );
  }

  // INPUT LISTENERS
  name.addEventListener("input", validateForm);
  email.addEventListener("input", validateForm);
  phone.addEventListener("input", validateForm);
  street.addEventListener("input", validateForm);
  city.addEventListener("input", validateForm);
  state.addEventListener("change", validateForm);
  zip.addEventListener("input", validateForm);

  // NEXT BUTTON
  nextBtn.addEventListener("click", function () {
    step1.style.display = "none";
    step2.style.display = "block";

    stepIndicator1.classList.remove("active");
    stepIndicator2.classList.add("active");
  });

  // BACK BUTTON
  backBtn.addEventListener("click", function () {
    step2.style.display = "none";
    step1.style.display = "block";

    stepIndicator2.classList.remove("active");
    stepIndicator1.classList.add("active");
  });

  // PAYMENT FIELDS
  const cardNumber = document.getElementById("card-number");
  const expiry = document.getElementById("expiry");
  const cvv = document.getElementById("cvv");
  const cardName = document.getElementById("card-name");
  const payBtn = document.getElementById("pay-btn");

  function validatePayment() {
    const cleanCard = cardNumber.value.replace(/\s/g, "");

    const isCardValid = /^\d{16}$/.test(cleanCard);
    const isExpiryValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.value);
    const isCvvValid = /^\d{3}$/.test(cvv.value);
    const isNameValid = cardName.value.trim().length >= 2;

    payBtn.disabled = !(
      isCardValid &&
      isExpiryValid &&
      isCvvValid &&
      isNameValid
    );
  }

  // LISTENERS
  cardNumber.addEventListener("input", validatePayment);
  expiry.addEventListener("input", validatePayment);
  cvv.addEventListener("input", validatePayment);
  cardName.addEventListener("input", validatePayment);

  // FORMAT CARD NUMBER (adds spaces)
  cardNumber.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "").substring(0, 16);
    this.value = value.replace(/(.{4})/g, "$1 ").trim();
  });

  // FORMAT EXPIRY (MM/YY)
  expiry.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "").substring(0, 4);

    if (value.length >= 3) {
      this.value = value.substring(0, 2) + "/" + value.substring(2);
    } else {
      this.value = value;
    }
  });

  // CVV only digits
  cvv.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").substring(0, 3);
  });

  const step3 = document.getElementById("step-3");
  const stepIndicator3 = document.getElementById("step-indicator-3");
  const orderIdText = document.getElementById("order-id");

  payBtn.addEventListener("click", async function () {
    // hide BOTH previous steps
    step1.style.display = "none";
    step2.style.display = "none";

    // show success step
    step3.style.display = "block";

    document.querySelector(".checkout-summary").style.display = "none";

    // update stepper
    stepIndicator2.classList.remove("active");
    stepIndicator3.classList.add("active");

    // generate random order id
    const orderId = "ORD" + Math.floor(Math.random() * 1000000);
    orderIdText.textContent = orderId;

    // =========================
    // CREATE ORDER OBJECT
    // =========================

    const orderData = {
      items: cart,

      subtotal: total,

      delivery: /^\d{5}$/.test(zip.value.trim()) ? 12 : 0,

      total: total + (/^\d{5}$/.test(zip.value.trim()) ? 12 : 0),

      orderId: orderId,

      status: "Processing",

      date: new Date().toLocaleDateString(),

      customer: {
        name: name.value,
        email: email.value,
        phone: phone.value,
        address: street.value,
        city: city.value,
        state: state.value,
        zip: zip.value,
      },
    };

    localStorage.setItem("lastOrder", JSON.stringify(orderData));

    // =========================
    // SAVE ORDER HISTORY
    // =========================

    const ordersKey = currentUser
      ? `orders_${currentUser.email}`
      : "orders_guest";

    if (currentUser?.uid) {
      addOrder(currentUser.uid, orderData);
    }

    // clear cart
    localStorage.setItem(cartKey, JSON.stringify([]));

    const cartCount = document.getElementById("cart-count");

    if (currentUser?.uid) {
      await clearCart(currentUser.uid);
    }

    if (cartCount) {
      cartCount.textContent = "0";
    }

    const mobileCartCount = document.getElementById("mobile-cart-count");

    if (mobileCartCount) {
      mobileCartCount.textContent = "0";
    }
  });

  // =========================
  // RECEIPT PDF
  // =========================

  const receiptBtn = document.getElementById("download-receipt");

  receiptBtn.addEventListener("click", function () {
    const order = JSON.parse(localStorage.getItem("lastOrder"));

    if (!order) return;

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
