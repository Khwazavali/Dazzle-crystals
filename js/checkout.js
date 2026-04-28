document.addEventListener("DOMContentLoaded", function () {
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const street = document.getElementById("street");
  const city = document.getElementById("city");
  const state = document.getElementById("state");
  const zip = document.getElementById("zip");

  const nextBtn = document.getElementById("next-btn");

  function validateForm() {
    const isNameValid = name.value.trim().length >= 2;

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);

    const isPhoneValid = /^\d{10}$/.test(phone.value.trim());

    const isStreetValid = street.value.trim().length >= 5;

    const isCityValid = city.value.trim().length >= 2;

    const isStateValid = state.value !== "";

    const isZipValid = /^\d{5}$/.test(zip.value.trim());

    if (
      isNameValid &&
      isEmailValid &&
      isPhoneValid &&
      isStreetValid &&
      isCityValid &&
      isStateValid &&
      isZipValid
    ) {
      nextBtn.disabled = false;
    } else {
      nextBtn.disabled = true;
    }
  }

  // 🔥 Listen to all inputs
  name.addEventListener("input", validateForm);
  email.addEventListener("input", validateForm);
  phone.addEventListener("input", validateForm);
  street.addEventListener("input", validateForm);
  city.addEventListener("input", validateForm);
  state.addEventListener("change", validateForm);
  zip.addEventListener("input", validateForm);
});
