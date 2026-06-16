import { db } from "./firebase.js";

import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

export async function loadProducts() {
  try {
    const snapshot = await getDocs(collection(db, "products"));

    const products = [];

    snapshot.forEach((doc) => {
      products.push(doc.data());
    });

    return products;
  } catch (error) {
    console.error("Error loading products:", error);

    return [];
  }
}