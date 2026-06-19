import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// LOAD ORDERS

export async function loadOrders(uid) {
  const snapshot = await getDocs(
    collection(db, "users", uid, "orders"),
  );

  const orders = [];

  snapshot.forEach((doc) => {
    orders.push(doc.data());
  });

  return orders;
}

// ADD ORDER

export async function addOrder(uid, order) {
  await setDoc(
    doc(db, "users", uid, "orders", order.orderId),
    order,
  );
}