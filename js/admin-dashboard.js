import { auth, db } from "./firebase.js";

import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  runTransaction,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

const storage = getStorage(auth.app);
const dashboard = document.getElementById("dashboard");
console.log("Dashboard JS loaded successfully!");
const logoutButton = document.getElementById("admin-logout");

onAuthStateChanged(auth, async (user) => {
  console.log("Firebase auth state:", user ? "Logged in" : "Not logged in");

  try {
    // No logged-in user
    if (!user) {
      window.location.replace("./admin-login.html");
      return;
    }

    // Verify latest admin permissions
    const tokenResult = await user.getIdTokenResult(true);
    console.log("Admin claim:", tokenResult.claims.admin);

    if (tokenResult.claims.admin !== true) {
      await signOut(auth);
      window.location.replace("./admin-login.html");
      return;
    }

    // Authorized admin: show dashboard
    dashboard.hidden = false;

    // Load products only after admin verification
    await loadAdminProducts();
  } catch (error) {
    console.error("Admin verification failed:", error);
    dashboard.hidden = true;
    window.location.replace("./admin-login.html");
  }
});

// Admin logout
logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.replace("./admin-login.html");
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Unable to log out. Please try again.");
  }
});

async function loadAdminProducts() {
  const productsList = document.getElementById("products-list");
  const totalProducts = document.getElementById("total-products");
  const productsMessage = document.getElementById("products-message");
  const productsTable = document.getElementById("products-table");

  try {
    const snapshot = await getDocs(collection(db, "products"));

    totalProducts.textContent = snapshot.size;
    productsList.replaceChildren();

    snapshot.forEach((productDoc) => {
      const product = productDoc.data();

      const row = document.createElement("tr");

      // 1. Product image
      const imageCell = document.createElement("td");
      const image = document.createElement("img");

      image.src = product.image
        ? new URL(product.image, window.location.href).href
        : "";

      image.alt = product.name ?? "Crystal product";
      image.width = 65;
      image.height = 65;
      image.style.objectFit = "cover";
      image.style.borderRadius = "6px";

      imageCell.appendChild(image);
      row.appendChild(imageCell);

      // 2. Product information
      const values = [
        product.name ?? productDoc.id,
        product.price ?? "N/A",
        product.stock ?? "N/A",
        product.collection ?? "N/A",
      ];

      values.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = String(value);
        row.appendChild(cell);
      });

      // 3. Actions column
      const actionCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.type = "button";
      editButton.style.background = "#222";
      editButton.style.color = "#fff";
      editButton.style.padding = "8px 14px";

      editButton.addEventListener("click", () => {
        openEditProduct(productDoc.id, product);
      });

      // Create Delete button
      const deleteButton = document.createElement("button");

      deleteButton.textContent = "Delete";
      deleteButton.type = "button";
      deleteButton.style.background = "#c0392b";
      deleteButton.style.color = "#fff";
      deleteButton.style.padding = "8px 14px";
      deleteButton.style.marginLeft = "8px";

      // Handle Delete click
      deleteButton.addEventListener("click", async () => {
        const confirmed = confirm(
          `Are you sure you want to delete "${product.name ?? productDoc.id}"?\n\nThis action cannot be undone.`,
        );

        if (!confirmed) return;

        deleteButton.disabled = true;
        deleteButton.textContent = "Deleting...";

        try {
          const productRef = doc(db, "products", productDoc.id);

          // Collect all images associated with this product
          const imageUrls = [
            product.image,
            ...(Array.isArray(product.gallery) ? product.gallery : []),
          ].filter((url) => isFirebaseStorageImage(url));

          const uniqueImageUrls = [...new Set(imageUrls)];

          // Check whether other products use these images
          const allProducts = await getDocs(collection(db, "products"));

          const sharedImageUrls = new Set();

          allProducts.forEach((otherDoc) => {
            if (otherDoc.id === productDoc.id) return;

            const otherProduct = otherDoc.data();

            const otherImages = [
              otherProduct.image,
              ...(Array.isArray(otherProduct.gallery)
                ? otherProduct.gallery
                : []),
            ];

            otherImages.forEach((url) => {
              if (uniqueImageUrls.includes(url)) {
                sharedImageUrls.add(url);
              }
            });
          });

          // Delete the product document from Firestore
          await deleteDoc(productRef);

          // Delete only images that are not shared
          for (const imageUrl of uniqueImageUrls) {
            if (sharedImageUrls.has(imageUrl)) continue;

            try {
              await deleteObject(ref(storage, imageUrl));
              console.log("Deleted Storage image:", imageUrl);
            } catch (storageError) {
              console.error("Image cleanup failed:", storageError);
            }
          }

          // Close the edit form if this product was being edited
          if (editingProductId === productDoc.id) {
            editingProductId = null;
            editForm.reset();
            editSection.hidden = true;
          }

          alert("Product deleted successfully!");

          await loadAdminProducts();
        } catch (error) {
          console.error("Error deleting product:", error);
          alert("Unable to delete product: " + error.message);

          deleteButton.disabled = false;
          deleteButton.textContent = "Delete";
        }
      });

      // Add both buttons to the Actions column
      actionCell.appendChild(editButton);
      actionCell.appendChild(deleteButton);

      row.appendChild(actionCell);

      // 4. Add completed row
      productsList.appendChild(row);
    });

    productsTable.hidden = snapshot.empty;
    productsMessage.textContent = snapshot.empty ? "No products found." : "";
  } catch (error) {
    console.error("Error loading products:", error);
    productsMessage.textContent = "Unable to load products.";
    totalProducts.textContent = "—";
  }
}

const editSection = document.getElementById("edit-product-section");
const editForm = document.getElementById("edit-product-form");
const cancelEditButton = document.getElementById("cancel-edit");

let editingProductId = null;

function openEditProduct(productId, product) {
  editingProductId = productId;
  // Clear the previously selected image
  editImageInput.value = "";

  if (editPreviewUrl) {
    URL.revokeObjectURL(editPreviewUrl);
    editPreviewUrl = null;
  }

  // Show the current product's saved image
  editImagePreview.src = product.image
    ? new URL(product.image, window.location.href).href
    : "";

  editImagePreview.hidden = !product.image;

  document.getElementById("edit-name").value = product.name ?? "";

  document.getElementById("edit-price").value = product.price ?? 0;

  document.getElementById("edit-stock").value = product.stock ?? 0;

  document.getElementById("edit-category").value = product.collection ?? "";

  document.getElementById("edit-description").value = product.description ?? "";

  editSection.hidden = false;
  editSection.scrollIntoView({ behavior: "smooth" });
}

cancelEditButton.addEventListener("click", () => {
  editingProductId = null;
  editForm.reset();
  editSection.hidden = true;
});

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!editingProductId) return;

  const saveButton = document.getElementById("save-product");

  // Read values from the edit form
  const name = document.getElementById("edit-name").value.trim();
  const price = Number(document.getElementById("edit-price").value);
  const stock = Number(document.getElementById("edit-stock").value);
  const category = document.getElementById("edit-category").value.trim();
  const description = document.getElementById("edit-description").value.trim();
  // Get the new image selected by the admin
  const newImageFile = document.getElementById("edit-image").files[0];

  // Validate before sending to Firestore
  if (
    !name ||
    !category ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isSafeInteger(stock) ||
    stock < 0
  ) {
    alert("Please enter valid product details.");
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  try {
    // Reference the selected Firestore product document
    const productRef = doc(db, "products", editingProductId);
    // Upload a new image only if the admin selected one
    let newImageUrl = null;

    if (newImageFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (
        !allowedTypes.includes(newImageFile.type) ||
        newImageFile.size >= 5 * 1024 * 1024
      ) {
        throw new Error("Choose a JPG, PNG, or WebP image smaller than 5 MB.");
      }

      saveButton.textContent = "Uploading image...";

      // Generate a unique filename
      const extension =
        newImageFile.type === "image/png"
          ? "png"
          : newImageFile.type === "image/webp"
            ? "webp"
            : "jpg";

      const imageName = `${crypto.randomUUID()}.${extension}`;

      // Upload to Firebase Storage
      const imageRef = ref(storage, `products/${imageName}`);

      await uploadBytes(imageRef, newImageFile, {
        contentType: newImageFile.type,
      });

      // Retrieve the uploaded image URL
      newImageUrl = await getDownloadURL(imageRef);

      console.log("New product image uploaded:", newImageUrl);
    }

    // Prepare the product fields to update
    const updatedData = {
      name: name,
      price: price,
      stock: stock,
      collection: category,
      description: description,
    };

    // Update the image only if a new one was uploaded
    if (newImageUrl) {
      updatedData.image = newImageUrl;

      // Preserve existing gallery images and add the new image
      const existingProduct = await getDoc(productRef);
      const existingGallery = existingProduct.data()?.gallery ?? [];

      updatedData.gallery = [
        newImageUrl,
        ...existingGallery.filter((url) => url !== newImageUrl),
      ];
    }

    // Save changes to Firestore
    await updateDoc(productRef, updatedData);

    alert("Product updated successfully!");

    // Close the form
    editingProductId = null;
    editForm.reset();
    editSection.hidden = true;

    // Refresh the inventory table
    await loadAdminProducts();
  } catch (error) {
    console.error("Error updating product:", error);
    alert("Unable to save product: " + error.message);
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Save Changes";
  }
});

const addProductForm = document.getElementById("add-product-form");
const addProductButton = document.getElementById("add-product-button");
const addProductMessage = document.getElementById("add-product-message");

addProductForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("add-name").value.trim();
  const priceText = document.getElementById("add-price").value;
  const stockText = document.getElementById("add-stock").value;
  const category = document.getElementById("add-category").value.trim();
  const description = document.getElementById("add-description").value.trim();

  // Read the selected file, not the file input's text value
  const imageFile = document.getElementById("add-image").files[0];

  const price = Number(priceText);
  const stock = Number(stockText);

  if (
    !name ||
    !category ||
    !imageFile ||
    priceText === "" ||
    stockText === "" ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isSafeInteger(stock) ||
    stock < 0
  ) {
    addProductMessage.textContent = "Please enter valid product details.";
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (
    !allowedTypes.includes(imageFile.type) ||
    imageFile.size >= 5 * 1024 * 1024
  ) {
    addProductMessage.textContent =
      "Choose a JPG, PNG, or WebP image smaller than 5 MB.";
    return;
  }

  const productId = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!productId) {
    addProductMessage.textContent = "Enter a valid product name.";
    return;
  }

  addProductButton.disabled = true;
  addProductButton.textContent = "Uploading...";
  addProductMessage.textContent = "Uploading product image...";

  try {
    const productRef = doc(db, "products", productId);

    // Check for an existing product before uploading
    const existingProduct = await getDoc(productRef);

    if (existingProduct.exists()) {
      throw new Error("A product with this name already exists.");
    }

    // Generate a unique image filename
    const extension =
      imageFile.type === "image/png"
        ? "png"
        : imageFile.type === "image/webp"
          ? "webp"
          : "jpg";

    const imageName = `${crypto.randomUUID()}.${extension}`;

    // Upload the file to Firebase Storage
    const imageRef = ref(storage, `products/${imageName}`);

    await uploadBytes(imageRef, imageFile, {
      contentType: imageFile.type,
    });

    // Get the URL that the website can use
    const imageUrl = await getDownloadURL(imageRef);

    addProductButton.textContent = "Saving...";
    addProductMessage.textContent = "Saving product to Firestore...";

    // Create only if the document does not already exist
    await runTransaction(db, async (transaction) => {
      const currentProduct = await transaction.get(productRef);

      if (currentProduct.exists()) {
        throw new Error("A product with this name already exists.");
      }

      transaction.set(productRef, {
        id: productId,
        name,
        price,
        stock,
        collection: category,
        description,
        image: imageUrl,
        gallery: [imageUrl],
        featured: false,
      });
    });

    addProductMessage.textContent = "Product added successfully!";
    addProductForm.reset();

    // Clear the image preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    imagePreview.removeAttribute("src");
    imagePreview.hidden = true;

    await loadAdminProducts();
  } catch (error) {
    console.error("Error adding product:", error);
    addProductMessage.textContent = "Unable to add product: " + error.message;
  } finally {
    addProductButton.disabled = false;
    addProductButton.textContent = "Add Product";
  }
});

const imageInput = document.getElementById("add-image");
const imagePreview = document.getElementById("add-image-preview");

let previewUrl = null;

imageInput.addEventListener("change", () => {
  // Release any previous preview URL
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  const file = imageInput.files[0];

  if (!file) {
    imagePreview.hidden = true;
    imagePreview.removeAttribute("src");
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type) || file.size >= 5 * 1024 * 1024) {
    alert("Choose a JPG, PNG, or WebP image smaller than 5 MB.");
    imageInput.value = "";
    imagePreview.hidden = true;
    imagePreview.removeAttribute("src");
    return;
  }

  previewUrl = URL.createObjectURL(file);
  imagePreview.src = previewUrl;
  imagePreview.hidden = false;
});

const editImageInput = document.getElementById("edit-image");
const editImagePreview = document.getElementById("edit-image-preview");

let editPreviewUrl = null;

editImageInput.addEventListener("change", () => {
  if (editPreviewUrl) {
    URL.revokeObjectURL(editPreviewUrl);
    editPreviewUrl = null;
  }

  const file = editImageInput.files[0];

  if (!file) {
    editImagePreview.hidden = true;
    editImagePreview.removeAttribute("src");
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type) || file.size >= 5 * 1024 * 1024) {
    alert("Choose a JPG, PNG, or WebP image smaller than 5 MB.");
    editImageInput.value = "";
    editImagePreview.hidden = true;
    editImagePreview.removeAttribute("src");
    return;
  }

  editPreviewUrl = URL.createObjectURL(file);
  editImagePreview.src = editPreviewUrl;
  editImagePreview.hidden = false;
});

function isFirebaseStorageImage(imageUrl) {
  if (typeof imageUrl !== "string") {
    return false;
  }

  try {
    const url = new URL(imageUrl);

    return (
      url.protocol === "https:" &&
      url.hostname === "firebasestorage.googleapis.com" &&
      url.pathname.startsWith("/v0/b/dazzle-crystals.firebasestorage.app/o/")
    );
  } catch (error) {
    return false;
  }
}
