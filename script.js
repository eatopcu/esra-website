/*
  Admin-friendly product editing:
  1) To add a product: add a new object inside PRODUCTS with a unique id.
  2) To change image/price/name: edit image/price/name fields in the object.
  3) To mark discount: set discounted: true and category: 'İndirimli Ürünler' OR keep original category and set discounted true.
  4) No HTML edits are needed for product updates.
*/
const CATEGORIES = [
  'El Boyama Fincan Takımları',
  'El Boyama Kahve Fincanları',
  'Kahve Sunum Tepsileri',
  'Kahve Sunum Peçeteleri',
  'Kahve Yanı Kristal Bardaklar',
  'Lokumluklar',
  'Çay Bardağı Takımları',
  'Çay Tepsisi',
  'Çay Tabakları',
  'Fransız Dantel Masa Örtüleri',
  'Dertsiz Masa Örtüleri',
  'Salon Örtüsü Takımları',
  'Goblen İpek Seccadeler',
  'Servis Sunum Maşaları',
  'İndirimli Ürünler'
];

const PRODUCTS = [
  { id: 1, name: 'Safir El Boyama Fincan Takımı', category: 'El Boyama Fincan Takımları', price: 129, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80', description: 'Hand-painted luxury set with refined turquoise patterns.', discounted: false },
  { id: 2, name: 'Kristal Kahve Yanı Bardak', category: 'Kahve Yanı Kristal Bardaklar', price: 38, image: 'https://images.unsplash.com/photo-1609951651556-5334e2706168?auto=format&fit=crop&w=1200&q=80', description: 'Delicate crystal side glass for elevated coffee service.', discounted: true },
  { id: 3, name: 'Altın Detay Kahve Tepsisi', category: 'Kahve Sunum Tepsileri', price: 82, image: 'https://images.unsplash.com/photo-1556911261-6bd341186b2f?auto=format&fit=crop&w=1200&q=80', description: 'Gold-accent serving tray crafted for premium presentation.', discounted: false },
  { id: 4, name: 'Goblen İpek Seccade', category: 'Goblen İpek Seccadeler', price: 175, image: 'https://images.unsplash.com/photo-1616627452086-22f8f24a0f0d?auto=format&fit=crop&w=1200&q=80', description: 'Silk-touch woven prayer rug in timeless Ottoman tones.', discounted: false },
  { id: 5, name: 'Fransız Dantel Masa Örtüsü', category: 'Fransız Dantel Masa Örtüleri', price: 148, image: 'https://images.unsplash.com/photo-1617104551722-3b2d5136640b?auto=format&fit=crop&w=1200&q=80', description: 'Ivory lace tablecloth designed for formal gatherings.', discounted: true },
  { id: 6, name: 'Salon Örtüsü Takımı Deluxe', category: 'Salon Örtüsü Takımları', price: 219, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80', description: 'Premium multi-piece salon textile set with graceful finish.', discounted: false }
];

const CART_KEY = 'vth_cart';
const PRODUCTS_KEY = 'vth_products';
const API_ENDPOINT_KEY = 'vth_api_endpoint';
const SHIPPING = { carrier: 'USPS', baseRate: 12.5, paidBy: 'Customer' };
const TRACKING_STATUSES = ['Order received', 'Preparing shipment', 'Shipped with USPS', 'Out for delivery', 'Delivered'];
const OPTIONAL_LOGO_URL = ''; // Add a logo URL here later if desired.

const q = (s) => document.querySelector(s);
const el = {
  sidebar: q('#sidebar'), mobileMenuBtn: q('#mobileMenuBtn'), categoryList: q('#categoryList'),
  activeCategoryText: q('#activeCategoryText'), productGrid: q('#productGrid'), cartItems: q('#cartItems'),
  subtotal: q('#subtotalPrice'), shipping: q('#shippingPrice'), total: q('#totalPrice'), checkoutForm: q('#checkoutForm'),
  checkoutMessage: q('#checkoutMessage'), trackingForm: q('#trackingForm'), trackingResult: q('#trackingResult'),
  membershipForm: q('#membershipForm'), brandLogo: q('#brandLogo'),
  adminProductForm: q('#adminProductForm'), apiEndpoint: q('#apiEndpoint'), syncApiBtn: q('#syncApiBtn'), adminMessage: q('#adminMessage')
};

let activeCategory = 'All Products';
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
const setCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));
const getProducts = () => JSON.parse(localStorage.getItem(PRODUCTS_KEY) || 'null') || PRODUCTS;
const setProducts = (items) => localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items));

function initLogo() {
  if (OPTIONAL_LOGO_URL) {
    el.brandLogo.src = OPTIONAL_LOGO_URL;
    el.brandLogo.classList.remove('hidden');
  }
}

function renderCategories() {
  el.categoryList.innerHTML = CATEGORIES.map((c) => `<button class="cat-btn" data-category="${c}">${c}</button>`).join('');
  document.querySelectorAll('.cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      document.querySelectorAll('.cat-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts();
    });
  });
}

function filteredProducts() {
  const products = getProducts();
  if (activeCategory === 'All Products') return products;
  if (activeCategory === 'İndirimli Ürünler') return products.filter((p) => p.discounted || p.category === 'İndirimli Ürünler');
  return products.filter((p) => p.category === activeCategory);
}

function renderProducts() {
  const list = filteredProducts();
  el.activeCategoryText.textContent = `Showing: ${activeCategory}`;
  el.productGrid.innerHTML = list.map((p) => `
    <article class="product-card">
      <img src="${p.image}" alt="${p.name}">
      <div class="product-body">
        ${p.discounted ? '<span class="badge">Discounted</span>' : ''}
        <h4>${p.name}</h4>
        <p>${p.category}</p>
        <p class="price">$${p.price.toFixed(2)}</p>
        <p>${p.description}</p>
        <button class="ghost-btn" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </article>
  `).join('');
}

function addToCart(id) {
  const cart = getCart();
  const found = cart.find((item) => item.id === id);
  if (found) found.qty += 1;
  else cart.push({ id, qty: 1 });
  setCart(cart);
  renderCart();
}
function changeQty(id, delta) {
  const cart = getCart().map((item) => item.id === id ? { ...item, qty: item.qty + delta } : item).filter((item) => item.qty > 0);
  setCart(cart);
  renderCart();
}
function removeItem(id) { setCart(getCart().filter((item) => item.id !== id)); renderCart(); }

function renderCart() {
  const cart = getCart();
  if (!cart.length) {
    el.cartItems.innerHTML = '<p class="note">Your cart is empty.</p>';
    el.subtotal.textContent = '$0.00'; el.shipping.textContent = '$0.00'; el.total.textContent = '$0.00'; return;
  }
  let subtotal = 0;
  el.cartItems.innerHTML = cart.map((item) => {
    const p = getProducts().find((product) => product.id === item.id);
    const line = p.price * item.qty; subtotal += line;
    return `<div class="cart-item"><div><strong>${p.name}</strong><br><small>$${p.price.toFixed(2)} x ${item.qty}</small></div><div class="qty-controls"><button class="qty-btn" onclick="changeQty(${item.id},-1)">-</button><button class="qty-btn" onclick="changeQty(${item.id},1)">+</button><button class="qty-btn" onclick="removeItem(${item.id})">x</button></div></div>`;
  }).join('');
  const shippingCost = SHIPPING.baseRate;
  el.subtotal.textContent = `$${subtotal.toFixed(2)}`;
  el.shipping.textContent = `$${shippingCost.toFixed(2)}`;
  el.total.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;
}

el.checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!getCart().length) { el.checkoutMessage.textContent = 'Add products before checkout.'; return; }
  el.checkoutMessage.textContent = `Demo order placed. Shipping carrier: ${SHIPPING.carrier}. Shipping paid by: ${SHIPPING.paidBy}.`;
  el.checkoutForm.reset(); setCart([]); renderCart();
});

el.trackingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const order = q('#orderNumber').value.trim();
  const status = TRACKING_STATUSES[order.length % TRACKING_STATUSES.length];
  el.trackingResult.textContent = `Order #${order}: ${status}`;
});

document.querySelectorAll('[data-membership]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.membership;
    el.membershipForm.classList.remove('hidden');
    if (mode === 'guest') el.membershipForm.innerHTML = '<p class="note">You are continuing as guest. No account required.</p>';
    if (mode === 'signup') el.membershipForm.innerHTML = '<input placeholder="Full Name" required><input type="email" placeholder="Email" required><input type="password" placeholder="Create Password" required><button class="cta-btn" type="button">Create Demo Account</button>';
    if (mode === 'login') el.membershipForm.innerHTML = '<input type="email" placeholder="Email" required><input type="password" placeholder="Password" required><button class="cta-btn" type="button">Login Demo</button>';
  });
});

el.mobileMenuBtn.addEventListener('click', () => el.sidebar.classList.toggle('open'));

window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeItem = removeItem;

initLogo();
renderCategories();
renderProducts();
renderCart();


function upsertCategory(category) {
  if (!CATEGORIES.includes(category) && category.trim()) {
    CATEGORIES.splice(CATEGORIES.length - 1, 0, category.trim());
    renderCategories();
  }
}

el.adminProductForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(el.adminProductForm);
  const items = getProducts();
  const item = {
    id: items.length ? Math.max(...items.map((p) => p.id)) + 1 : 1,
    name: formData.get('name'),
    category: formData.get('category'),
    price: Number(formData.get('price')),
    image: formData.get('image'),
    description: formData.get('description'),
    discounted: formData.get('discounted') === 'on'
  };
  items.push(item);
  setProducts(items);
  upsertCategory(item.category);
  renderProducts();
  el.adminProductForm.reset();
  el.adminMessage.textContent = 'Product added locally. You can now sync to backend endpoint if configured.';
});

el.syncApiBtn.addEventListener('click', async () => {
  const endpoint = el.apiEndpoint.value.trim();
  if (!endpoint) {
    el.adminMessage.textContent = 'No endpoint set. Save endpoint to enable backend sync.';
    return;
  }
  localStorage.setItem(API_ENDPOINT_KEY, endpoint);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: getProducts() })
    });
    el.adminMessage.textContent = res.ok ? 'Backend sync complete.' : 'Backend responded with an error status.';
  } catch (error) {
    el.adminMessage.textContent = 'Backend sync failed (check endpoint/CORS).';
  }
});

(function initApiEndpoint() {
  const saved = localStorage.getItem(API_ENDPOINT_KEY);
  if (saved) el.apiEndpoint.value = saved;
})();
