import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// LOAD CART

export async function loadCart(uid) {
  const snapshot = await getDocs(
    collection(db, "users", uid, "cart"),
  );

  const cart = [];

  snapshot.forEach((doc) => {
    cart.push(doc.data());
  });

  return cart;
}

// ADD ITEM

export async function addToCart(uid, item) {
  await setDoc(
    doc(db, "users", uid, "cart", item.id),
    item,
  );
}

// REMOVE ITEM

export async function removeFromCart(uid, productId) {
  await deleteDoc(
    doc(db, "users", uid, "cart", productId),
  );
}