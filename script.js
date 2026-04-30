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
  "Tekli Fincan Lokumluk"
];

const products = categories.map((category, i) => ({
  id: i + 1,
  name: `${category} - Premium Collection`,
  category,
  price: 24 + i * 7,
  description: `Elegant ${category.toLowerCase()} designed with Turkish-inspired details and modern styling.`,
  image: `https://picsum.photos/seed/turkishhome${i + 1}/800/600`
}));

const SHIPPING_FLAT = 15;

function getCart() {
  return JSON.parse(localStorage.getItem("vth_cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("vth_cart", JSON.stringify(cart));
  renderCartCount();
}
function renderCartCount() {
  const countEl = document.getElementById("cartCount");
  if (!countEl) return;
  const count = getCart().reduce((acc, item) => acc + item.qty, 0);
  countEl.textContent = count;
}

function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: productId, qty: 1 });
  saveCart(cart);
  alert("Added to cart!");
}

function renderHomePage() {
  const productGrid = document.getElementById("productGrid");
  const categoryList = document.getElementById("categoryList");
  const categoryFilter = document.getElementById("categoryFilter");
  if (!productGrid || !categoryList || !categoryFilter) return;

  categories.forEach((category) => {
    const pill = document.createElement("div");
    pill.className = "category-pill";
    pill.textContent = category;
    categoryList.appendChild(pill);

    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const drawProducts = (selected = "all") => {
    productGrid.innerHTML = "";
    products
      .filter((product) => selected === "all" || product.category === selected)
      .forEach((product) => {
        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-content">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p>${product.description}</p>
            <button class="btn primary" data-id="${product.id}">Add to Cart</button>
          </div>
        `;
        productGrid.appendChild(card);
      });

    productGrid.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
    });
  };

  categoryFilter.addEventListener("change", (e) => drawProducts(e.target.value));
  drawProducts();
}

function renderCartPage() {
  const cartItemsEl = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("total");
  if (!cartItemsEl || !subtotalEl || !shippingEl || !totalEl) return;

  const cart = getCart();
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartItemsEl.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div>
          <strong>${product.name}</strong><br />
          Qty: ${item.qty} × $${product.price.toFixed(2)}
        </div>
        <button class="btn" data-remove="${item.id}">Remove</button>
      `;
      cartItemsEl.appendChild(row);
    });
  }

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
  const shipping = cart.length ? SHIPPING_FLAT : 0;
  const total = subtotal + shipping;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  shippingEl.textContent = `$${shipping.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;

  cartItemsEl.querySelectorAll("button[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.remove);
      const updated = getCart().filter((item) => item.id !== id);
      saveCart(updated);
      renderCartPage();
    });
  });

  const form = document.getElementById("checkoutForm");
  const message = document.getElementById("checkoutMessage");
  if (form && message) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!getCart().length) {
        message.textContent = "Your cart is empty. Please add products first.";
        return;
      }
      saveCart([]);
      form.reset();
      message.textContent = "Order placed successfully (demo). Thank you!";
      renderCartPage();
    });
  }
}

function setupMobileNav() {
  const nav = document.getElementById("siteNav");
  const toggle = document.querySelector(".nav-toggle");
  if (!nav || !toggle) return;
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
}

renderCartCount();
renderHomePage();
renderCartPage();
setupMobileNav();
