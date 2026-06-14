document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("account-container");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  let savedCards = JSON.parse(localStorage.getItem("savedCards")) || [];
  function renderSavedCards() {
    const savedCardsList = document.getElementById("saved-cards-list");

    if (savedCards.length === 0) {
      savedCardsList.innerHTML = "<p>No cards saved yet.</p>";

      return;
    }

    savedCardsList.innerHTML = "";

    savedCards.forEach((card, index) => {
      const lastFour = card.cardNumber.slice(-4);

      savedCardsList.innerHTML += `

<div class="saved-card">

    <div class="saved-card-info">

        <strong>
            💳 Card ending ${lastFour}
        </strong>

        <span>
            Expires ${card.expiry}
        </span>

    </div>

    <button
        class="delete-card-btn"
        data-index="${index}">
        Delete
    </button>

</div>

`;
    });

    const deleteButtons = document.querySelectorAll(".delete-card-btn");

    deleteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const cardIndex = button.dataset.index;

        const confirmDelete = confirm(
          "Are you sure you want to delete this card?",
        );

        if (confirmDelete) {
          savedCards.splice(cardIndex, 1);

          localStorage.setItem("savedCards", JSON.stringify(savedCards));

          renderSavedCards();
        }
      });
    });
  }

  if (!currentUser) {
    container.innerHTML = `
      <div class="empty-orders">
        <h2>Please Sign In</h2>
        <p>You need an account to view your profile.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = `

<div class="account-card">

    <div class="account-section" id="personal-details-card">

        <div class="section-header">

    <div class="section-title">
        <i class="fa-regular fa-user"></i>
        <span>Personal Details</span>
    </div>

    <i class="fa-solid fa-chevron-down section-arrow"></i>

</div>

        <div class="section-content" id="personal-details-content">
        <div class="personal-grid">

            <div class="info-item">
                <strong>Email</strong>
                <span>${currentUser.email || "Not Added"}</span>
            </div>

            <div class="info-item">
                <strong>Phone</strong>
                <span>${currentUser.phone || "Not Added"}</span>
            </div>

            <div class="info-item">
                <strong>Address</strong>
                <span>${currentUser.address || "Not Added"}</span>
            </div>

            <div class="info-item">
                <strong>City</strong>
                <span>${currentUser.city || "Not Added"}</span>
            </div>

            <div class="info-item">
                <strong>State</strong>
                <span>${currentUser.state || "Not Added"}</span>
            </div>

            <div class="info-item">
                <strong>Zip Code</strong>
                <span>${currentUser.zipcode || "Not Added"}</span>
            </div>

            </div>

            <button id="edit-profile-btn" class="profile-btn">
                Edit Profile
            </button>

        </div>

    </div>

    <div class="account-section" id="saved-cards-card">

        <div class="section-header">

    <div class="section-title">
        <i class="fa-regular fa-credit-card"></i>
        <span>Saved Cards</span>
    </div>

    <i class="fa-solid fa-chevron-down section-arrow"></i>

</div>

        <div class="section-content" id="saved-cards-content">

    <div id="saved-cards-list">

        <p>No cards saved yet.</p>

    </div>

    <button
        id="add-card-btn"
        class="profile-btn">
        Add Card
    </button>

</div>

    </div>

</div>

`;
  renderSavedCards();

  const editBtn = document.getElementById("edit-profile-btn");

  const personalCard = document.getElementById("personal-details-card");

  const savedCardsCard = document.getElementById("saved-cards-card");

  const personalContent = document.getElementById("personal-details-content");

  const savedCardsContent = document.getElementById("saved-cards-content");

  const personalArrow = personalCard.querySelector(".section-arrow");

  const savedArrow = savedCardsCard.querySelector(".section-arrow");
  personalArrow.classList.add("open");

  /* Initial State */

  personalContent.style.display = "block";
  savedCardsContent.style.display = "none";

  /* Personal Details */

  personalCard
    .querySelector(".section-header")
    .addEventListener("click", () => {
      const isOpen = personalContent.style.display === "block";

      personalContent.style.display = isOpen ? "none" : "block";

      personalArrow.classList.toggle("open");
    });

  /* Saved Cards */

  savedCardsCard
    .querySelector(".section-header")
    .addEventListener("click", () => {
      const isOpen = savedCardsContent.style.display === "block";

      savedCardsContent.style.display = isOpen ? "none" : "block";

      savedArrow.classList.toggle("open");
    });
  const profileOverlay = document.getElementById("profile-overlay");

  const closeProfile = document.getElementById("profile-close");
  closeProfile.addEventListener("click", () => {
    profileOverlay.style.display = "none";
  });

  editBtn.addEventListener("click", () => {
    document.getElementById("edit-firstname").value =
      currentUser.firstName || "";

    document.getElementById("edit-lastname").value = currentUser.lastName || "";

    document.getElementById("edit-email").value = currentUser.email || "";

    document.getElementById("edit-phone").value = currentUser.phone || "";

    document.getElementById("edit-address").value = currentUser.address || "";

    document.getElementById("edit-city").value = currentUser.city || "";

    document.getElementById("edit-state").value = currentUser.state || "";

    document.getElementById("edit-zipcode").value = currentUser.zipcode || "";

    profileOverlay.style.display = "flex";
  });
  const saveBtn = document.getElementById("save-profile-btn");

  saveBtn.addEventListener("click", () => {
    currentUser.firstName = document.getElementById("edit-firstname").value;

    currentUser.lastName = document.getElementById("edit-lastname").value;

    currentUser.email = document.getElementById("edit-email").value;

    currentUser.phone = document.getElementById("edit-phone").value;

    currentUser.address = document.getElementById("edit-address").value;

    currentUser.city = document.getElementById("edit-city").value;

    currentUser.state = document.getElementById("edit-state").value;

    currentUser.zipcode = document.getElementById("edit-zipcode").value;

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    profileOverlay.style.display = "none";

    location.reload();
  });
  const changePasswordBtn = document.getElementById("change-password-btn");

  const passwordOverlay = document.getElementById("password-overlay");

  const cardOverlay = document.getElementById("card-overlay");

  const addCardBtn = document.getElementById("add-card-btn");

  const cardClose = document.getElementById("card-close");
  const saveCardBtn = document.getElementById("save-card-btn");
  const cardNumberInput = document.getElementById("card-number");

  cardNumberInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");

    value = value.substring(0, 16);

    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");

    e.target.value = value;
  });

  const expiryInput = document.getElementById("card-expiry");

  expiryInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");

    value = value.substring(0, 4);

    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    }

    e.target.value = value;
  });

  const cvvInput = document.getElementById("card-cvv");

  cvvInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 3);
  });

  const cardholderInput = document.getElementById("cardholder-name");

  cardholderInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
  });

  saveCardBtn.addEventListener("click", () => {
    const cardholderName = document.getElementById("cardholder-name").value;

    const cardNumber = document.getElementById("card-number").value;

    const expiry = document.getElementById("card-expiry").value;

    const cvv = document.getElementById("card-cvv").value;

    if (!cardholderName || !cardNumber || !expiry || !cvv) {
      alert("Please fill all card details");
      return;
    }
    if (cardholderName.trim() === "") {
      alert("Enter cardholder name");
      return;
    }

    const cleanNumber = cardNumber.replace(/\s/g, "");

    if (!/^\d{16}$/.test(cleanNumber)) {
      alert("Card number must be 16 digits");

      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      alert("Expiry must be MM/YY");
      return;
    }

    if (!/^\d{3}$/.test(cvv)) {
      alert("CVV must be 3 digits");
      return;
    }

    const newCard = {
      cardholderName,

      cardNumber,

      expiry,
    };

    savedCards.push(newCard);

    localStorage.setItem("savedCards", JSON.stringify(savedCards));

    alert("Card saved successfully");

    cardOverlay.style.display = "none";

    location.reload();
  });

  const savedCardsList = document.getElementById("saved-cards-list");

  addCardBtn.addEventListener("click", () => {
    cardOverlay.style.display = "flex";
  });

  cardClose.addEventListener("click", () => {
    cardOverlay.style.display = "none";
  });

  cardOverlay.addEventListener("click", (e) => {
    if (e.target === cardOverlay) {
      cardOverlay.style.display = "none";
    }
  });

  const passwordClose = document.getElementById("password-close");

  changePasswordBtn.addEventListener("click", () => {
    profileOverlay.style.display = "none";
    passwordOverlay.style.display = "flex";
  });

  passwordClose.addEventListener("click", () => {
    passwordOverlay.style.display = "none";
    profileOverlay.style.display = "flex";
  });

  passwordOverlay.addEventListener("click", (e) => {
    if (e.target === passwordOverlay) {
      passwordOverlay.style.display = "none";
    }
  });
  document.getElementById("save-password-btn").addEventListener("click", () => {
    const currentPwd = document.getElementById("current-password").value;

    const newPwd = document.getElementById("new-password").value;

    const confirmPwd = document.getElementById("confirm-password").value;

    if (currentPwd !== currentUser.password) {
      alert("Current password is incorrect");

      return;
    }

    if (newPwd !== confirmPwd) {
      alert("Passwords do not match");

      return;
    }

    currentUser.password = newPwd;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const userIndex = users.findIndex(
      (user) => user.email === currentUser.email,
    );

    if (userIndex !== -1) {
      users[userIndex].password = newPwd;
    }

    localStorage.setItem("users", JSON.stringify(users));

    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    alert("Password updated successfully");

    passwordOverlay.style.display = "none";
  });
});
