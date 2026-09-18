const products = [
  { id: 1, name: "Classic Oversized Hoodie", category: "Fashion", price: 6490, rating: 4.8, emoji: "🧥", badge: "BESTSELLER" },
  { id: 2, name: "Wireless Pro Headphones", category: "Electronics", price: 12990, rating: 4.9, emoji: "🎧", badge: "HOT" },
  { id: 3, name: "Street Runner Sneakers", category: "Footwear", price: 9990, rating: 4.7, emoji: "👟", badge: "NEW" },
  { id: 4, name: "Minimal Smart Watch", category: "Electronics", price: 15490, rating: 4.6, emoji: "⌚", badge: "POPULAR" },
  { id: 5, name: "Premium Backpack", category: "Accessories", price: 5790, rating: 4.7, emoji: "🎒", badge: "" },
  { id: 6, name: "Everyday Sunglasses", category: "Accessories", price: 3490, rating: 4.5, emoji: "🕶️", badge: "" },
  { id: 7, name: "Urban Graphic T-Shirt", category: "Fashion", price: 2990, rating: 4.6, emoji: "👕", badge: "TRENDING" },
  { id: 8, name: "Portable Bluetooth Speaker", category: "Electronics", price: 7490, rating: 4.8, emoji: "🔊", badge: "" },
];

let cart = JSON.parse(localStorage.getItem("novashop-cart") || "[]");
let discountRate = 0;

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");
const cartCount = document.getElementById("cartCount");
const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const subtotalEl = document.getElementById("subtotal");
const discountEl = document.getElementById("discount");
const totalEl = document.getElementById("total");
const couponInput = document.getElementById("couponInput");
const applyCoupon = document.getElementById("applyCoupon");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeModal = document.getElementById("closeModal");
const continueShopping = document.getElementById("continueShopping");
const toast = document.getElementById("toast");

const money = value => `Rs. ${value.toLocaleString("en-LK")}`;

function renderProducts() {
  let list = [...products];
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const sort = sortSelect.value;

  if (query) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }

  if (category !== "all") {
    list = list.filter(p => p.category === category);
  }

  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);

  if (!list.length) {
    productGrid.innerHTML = `<div class="empty-state">No products matched your search.</div>`;
    return;
  }

  productGrid.innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-visual">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <span>${product.emoji}</span>
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3>${product.name}</h3>
        <div class="rating">★★★★★ <span style="color:#7a7f8b">(${product.rating})</span></div>
        <div class="price-row">
          <span class="price">${money(product.price)}</span>
          <button class="add-btn" onclick="addToCart(${product.id})">Add +</button>
        </div>
      </div>
    </article>
  `).join("");
}

function saveCart() {
  localStorage.setItem("novashop-cart", JSON.stringify(cart));
}

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  updateCart();
  showToast("Added to cart");
}

function changeQty(id, amount) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += amount;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);

  saveCart();
  updateCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCart();
}

function updateCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQty;

  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <div>
          <div style="font-size:3rem;margin-bottom:10px;">🛒</div>
          <strong>Your cart is empty</strong>
          <p style="margin-top:6px;">Add a few products and they will appear here.</p>
        </div>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart.map(item => {
      const p = products.find(product => product.id === item.id);
      return `
        <div class="cart-item">
          <div class="cart-thumb">${p.emoji}</div>
          <div>
            <h4>${p.name}</h4>
            <p>${money(p.price)}</p>
            <div class="qty-row">
              <button onclick="changeQty(${p.id}, -1)">−</button>
              <strong>${item.qty}</strong>
              <button onclick="changeQty(${p.id}, 1)">+</button>
              <button class="remove-btn" onclick="removeItem(${p.id})">Remove</button>
            </div>
          </div>
          <strong>${money(p.price * item.qty)}</strong>
        </div>
      `;
    }).join("");
  }

  const subtotal = cart.reduce((sum, item) => {
    const p = products.find(product => product.id === item.id);
    return sum + p.price * item.qty;
  }, 0);

  const discount = Math.round(subtotal * discountRate);
  const total = subtotal - discount;

  subtotalEl.textContent = money(subtotal);
  discountEl.textContent = `- ${money(discount)}`;
  totalEl.textContent = money(total);
}

function openCartDrawer() {
  cartDrawer.classList.add("active");
  overlay.classList.add("active");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  cartDrawer.classList.remove("active");
  overlay.classList.remove("active");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);

cartBtn.addEventListener("click", openCartDrawer);
closeCart.addEventListener("click", closeCartDrawer);
overlay.addEventListener("click", closeCartDrawer);

applyCoupon.addEventListener("click", () => {
  if (couponInput.value.trim().toUpperCase() === "WELCOME15") {
    discountRate = 0.15;
    updateCart();
    showToast("15% discount applied");
  } else {
    discountRate = 0;
    updateCart();
    showToast("Invalid coupon code");
  }
});

checkoutBtn.addEventListener("click", () => {
  if (!cart.length) {
    showToast("Your cart is empty");
    return;
  }
  closeCartDrawer();
  checkoutModal.classList.add("active");
});

closeModal.addEventListener("click", () => checkoutModal.classList.remove("active"));
continueShopping.addEventListener("click", () => checkoutModal.classList.remove("active"));

checkoutModal.addEventListener("click", e => {
  if (e.target === checkoutModal) checkoutModal.classList.remove("active");
});

renderProducts();
updateCart();
