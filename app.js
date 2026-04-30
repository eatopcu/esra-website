const SHIPPING_FLAT_RATE = 12.5;
const CART_KEY = "vth_cart";

const categories = [
  "Kahve Fincanları",
  "Çay Bardağı Seti",
  "Goblen Seccade",
  "Kahve Yanı Bardak",
  "Kahve Sunum Tepsisi",
  "Çay Tepsisi",
  "Kahve Sunum Peçete",
  "Salon Örtüsü Takımı (5-piece set)",
  "Masa Örtüsü (260cm, 300cm, 360cm options)",
  "Maşa Sunum Seti (3-piece set)",
  "Servis Seti (5-piece set)",
  "Tekli Fincan Lokumluk",
];

const products = categories.map((category, index) => ({
  id: index + 1,
  category,
  name: `${category} - Premium Model`,
  price: 24.99 + index * 5.2,
  description: `${category} için zarif, günlük kullanım ve özel davetlere uygun premium tasarım ürün.`,
  image: `https://picsum.photos/seed/virginia-${index + 1}/600/400`,
}));

const categoryListEl = document.getElementById("category-list");
const categoryFilterEl = document.getElementById("category-filter");
const productGridEl = document.getElementById("product-grid");
const cartItemsEl = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const shippingEl = document.getElementById("shipping");
const totalEl = document.getElementById("total");

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
}

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderCategories() {
  categories.forEach((category) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.textContent = category;
    categoryListEl.appendChild(card);

    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilterEl.appendChild(option);
  });
}

function renderProducts(filter = "all") {
  productGridEl.innerHTML = "";
  const filtered = filter === "all" ? products : products.filter((product) => product.category === filter);

  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-content">
        <h4>${product.name}</h4>
        <p>${product.description}</p>
        <p class="price">${formatCurrency(product.price)}</p>
        <button class="btn primary-btn" data-product-id="${product.id}">Sepete Ekle</button>
      </div>
    `;
    productGridEl.appendChild(card);
  });
}

function addToCart(productId) {
  const cart = getCart();
  const found = cart.find((item) => item.productId === productId);

  if (found) found.quantity += 1;
  else cart.push({ productId, quantity: 1 });

  saveCart(cart);
  renderCart();
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const cart = getCart();
  cartItemsEl.innerHTML = "";

  if (!cart.length) {
    cartItemsEl.innerHTML = "<p>Sepetiniz boş.</p>";
  }

  let subtotal = 0;
  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;

    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div>
        <strong>${product.name}</strong>
        <p>Adet: ${item.quantity}</p>
      </div>
      <div>
        <p>${formatCurrency(lineTotal)}</p>
        <button class="btn" data-remove-id="${product.id}">Kaldır</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  const shipping = cart.length ? SHIPPING_FLAT_RATE : 0;
  const total = subtotal + shipping;

  subtotalEl.textContent = formatCurrency(subtotal);
  shippingEl.textContent = formatCurrency(shipping);
  totalEl.textContent = formatCurrency(total);
}

function initEvents() {
  document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("main-nav").classList.toggle("open");
  });

  categoryFilterEl.addEventListener("change", (event) => {
    renderProducts(event.target.value);
  });

  productGridEl.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-product-id]");
    if (!btn) return;
    addToCart(Number(btn.dataset.productId));
  });

  cartItemsEl.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-remove-id]");
    if (!btn) return;
    removeFromCart(Number(btn.dataset.removeId));
  });

  document.getElementById("checkout-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!getCart().length) {
      document.getElementById("checkout-message").textContent = "Sepetiniz boşken ödeme yapılamaz.";
      return;
    }

    saveCart([]);
    renderCart();
    event.target.reset();
    document.getElementById("checkout-message").textContent =
      "Siparişiniz alınmıştır! (Demo ödeme)";
  });
}

renderCategories();
renderProducts();
renderCart();
initEvents();
