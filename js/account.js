document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("account-container");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

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

      <h2>Profile Information</h2>

      <p><strong>First Name:</strong> ${currentUser.firstName || "Not Added"}</p>

      <p><strong>Last Name:</strong> ${currentUser.lastName || "Not Added"}</p>

      <p><strong>Email:</strong> ${currentUser.email || "Not Added"}</p>

      <p><strong>Phone:</strong> ${currentUser.phone || "Not Added"}</p>

        <p><strong>Address:</strong> ${currentUser.address || "Not Added"}</p>

        <p><strong>City:</strong> ${currentUser.city || "Not Added"}</p>

        <p><strong>State:</strong> ${currentUser.state || "Not Added"}</p>

        <p><strong>Zip Code:</strong> ${currentUser.zipcode || "Not Added"}</p>
        <button id="edit-profile-btn" class="profile-btn">
    Edit Profile
</button>

    </div>


  `;

  const editBtn = document.getElementById("edit-profile-btn");

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
    profileOverlay.style.display="none";

    location.reload();
  });
  const changePasswordBtn = document.getElementById("change-password-btn");

  const passwordOverlay = document.getElementById("password-overlay");

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
