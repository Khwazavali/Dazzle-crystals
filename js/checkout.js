document.addEventListener("DOMContentLoaded", function () {
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const street = document.getElementById("street");
  const city = document.getElementById("city");
  const state = document.getElementById("state");
  const zip = document.getElementById("zip");

  const nextBtn = document.getElementById("next-btn");

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

  payBtn.addEventListener("click", function () {
    // hide BOTH previous steps
    step1.style.display = "none";
    step2.style.display = "none";

    // show success step
    step3.style.display = "block";

    // update stepper
    stepIndicator2.classList.remove("active");
    stepIndicator3.classList.add("active");

    // generate random order id
    const orderId = "ORD" + Math.floor(Math.random() * 1000000);
    orderIdText.textContent = orderId;

    // clear cart
    localStorage.removeItem("cart");
  });
});
