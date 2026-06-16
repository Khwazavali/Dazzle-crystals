// =========================
// AUTH MODAL OPEN/CLOSE
// =========================

const signinBtn = document.getElementById("signin-btn");

const authOverlay = document.getElementById("auth-overlay");

const authClose = document.getElementById("auth-close");

// OPEN AUTH MODAL
// ONLY IF USER NOT LOGGED IN

signinBtn.addEventListener("click", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // USER LOGGED IN

  if (currentUser) {
    accountDropdown.classList.toggle("show-dropdown");
  }

  // USER NOT LOGGED IN
  else {
    authOverlay.classList.add("show-auth");
  }
});

// CLOSE MODAL

authClose.addEventListener("click", () => {
  authOverlay.classList.remove("show-auth");
});

// CLOSE ON OUTSIDE CLICK

authOverlay.addEventListener("click", (e) => {
  if (e.target === authOverlay) {
    authOverlay.classList.remove("show-auth");
  }
});

// =========================
// AUTH TAB SWITCHING
// =========================

const signinTab = document.getElementById("signin-tab");

const signupTab = document.getElementById("signup-tab");

const signinForm = document.getElementById("signin-form");

const signupForm = document.getElementById("signup-form");

// SHOW SIGN IN

signinTab.addEventListener("click", () => {
  signinTab.classList.add("active-tab");

  signupTab.classList.remove("active-tab");

  signinForm.classList.remove("hidden-form");

  signupForm.classList.add("hidden-form");
});

// SHOW SIGN UP

signupTab.addEventListener("click", () => {
  signupTab.classList.add("active-tab");

  signinTab.classList.remove("active-tab");

  signupForm.classList.remove("hidden-form");

  signinForm.classList.add("hidden-form");
});

// =========================
// SIGN UP FUNCTIONALITY
// =========================

const signupFormElement = document.getElementById("signup-form");

signupFormElement.addEventListener("submit", (e) => {
  e.preventDefault();

  // GET INPUT VALUES

  const firstName = document.getElementById("signup-firstname").value;

  const lastName = document.getElementById("signup-lastname").value;

  const email = document.getElementById("signup-email").value;

  const password = document.getElementById("signup-password").value;

  const confirmPassword = document.getElementById(
    "signup-confirm-password",
  ).value;

  // PASSWORD MATCH CHECK

  if (password !== confirmPassword) {
    alert("Passwords do not match");

    return;
  }

  // GET EXISTING USERS

  let users = JSON.parse(localStorage.getItem("users")) || [];

  // CHECK DUPLICATE EMAIL

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    alert("Account already exists");

    return;
  }

  // CREATE USER OBJECT

  const newUser = {
    firstName,

    lastName,

    email,

    password,
  };

  // SAVE USER

  users.push(newUser);

  localStorage.setItem("users", JSON.stringify(users));

  // SUCCESS

  alert("Account created successfully");

  // RESET FORM

  signupFormElement.reset();

  // SWITCH TO SIGN IN TAB

  signinTab.click();
});

// =========================
// SIGN IN FUNCTIONALITY
// =========================

const signinFormElement = document.getElementById("signin-form");

signinFormElement.addEventListener("submit", (e) => {
  e.preventDefault();

  // GET INPUT VALUES

  const email = document.getElementById("signin-email").value;

  const password = document.getElementById("signin-password").value;

  // GET USERS

  const users = JSON.parse(localStorage.getItem("users")) || [];

  // FIND MATCHING USER

  const matchedUser = users.find((user) => {
    return user.email === email && user.password === password;
  });

  // INVALID LOGIN

  if (!matchedUser) {
    alert("Invalid email or password");

    return;
  }

  // SAVE CURRENT USER

  localStorage.setItem("currentUser", JSON.stringify(matchedUser));

  // SUCCESS

  alert(`Welcome back ${matchedUser.firstName}`);

  // RESET FORM

  signinFormElement.reset();

  // CLOSE MODAL

  authOverlay.classList.remove("show-auth");

  location.reload();
});

// =========================
// UPDATED NAVBAR USER STATE
// =========================

const signinButton = document.getElementById("signin-btn");

const signinText = document.getElementById("signin-text");

// GET CURRENT USER

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// IF USER EXISTS

if (currentUser) {
  // USER INITIALS

  const initials =
    currentUser.firstName.charAt(0) + currentUser.lastName.charAt(0);

  // UPDATE TEXT

  signinText.textContent = initials.toUpperCase();

  // ADD LOGGED IN STYLE

  signinButton.classList.add("logged-in");
}

// =========================
// ACCOUNT DROPDOWN
// =========================

const accountDropdown = document.getElementById("account-dropdown");

// CLOSE DROPDOWN ON OUTSIDE CLICK

document.addEventListener("click", (e) => {
  if (!signinButton.contains(e.target) && !accountDropdown.contains(e.target)) {
    accountDropdown.classList.remove("show-dropdown");
  }
});

// =========================
// LOGOUT
// =========================

const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => {
  // REMOVE CURRENT USER

  localStorage.removeItem("currentUser");

  // REFRESH PAGE

  location.reload();
});
