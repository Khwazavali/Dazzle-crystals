
import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const loginForm = document.getElementById("admin-login-form");
const errorMessage = document.getElementById("error-message");
const loginButton = document.getElementById("login-button");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  errorMessage.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";

  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value;

  try {
    // Step 1: Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Step 2: Refresh token and check admin custom claim
    const tokenResult = await userCredential.user.getIdTokenResult(true);

    if (tokenResult.claims.admin !== true) {
      await signOut(auth);
      throw new Error("Access denied. Admin account required.");
    }

    // Step 3: Redirect authorized admin
    window.location.replace("./admin-dashboard.html");

  } catch (error) {
    console.error("Admin login failed:", error.code || error.message);

    errorMessage.textContent =
      error.message === "Access denied. Admin account required."
        ? error.message
        : "Unable to sign in. Check your credentials and try again.";

  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
  }
});
