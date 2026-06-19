import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// LOAD WISHLIST

export async function loadWishlist(uid) {
  const snapshot = await getDocs(
    collection(db, "users", uid, "wishlist"),
  );

  const wishlist = [];

  snapshot.forEach((doc) => {
    wishlist.push(doc.data());
  });

  return wishlist;
}

// ADD ITEM

export async function addToWishlist(uid, item) {
  await setDoc(
    doc(db, "users", uid, "wishlist", item.id),
    item,
  );
}

// REMOVE ITEM

export async function removeFromWishlist(uid, productId) {
  await deleteDoc(
    doc(db, "users", uid, "wishlist", productId),
  );
}