const categories = [
  'All Products',
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

// Admin-friendly product section:
// - Add a product: copy one object and change id/name/category/price/image/description.
// - Change image: replace the image URL.
// - Change price: update "price" number.
// - Discount: set discounted: true to include in "İndirimli Ürünler" filter.
const products = [
  {id:1,name:'El Boyama Fincan Takımı - Zümrüt',category:'El Boyama Fincan Takımları',price:78,image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',description:'Hand-painted set with refined gold detailing.',discounted:false},
  {id:2,name:'El Boyama Kahve Fincanı - Osmanlı',category:'El Boyama Kahve Fincanları',price:49,image:'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?auto=format&fit=crop&w=1200&q=80',description:'Boutique Turkish coffee cup in rich turquoise tones.',discounted:true},
  {id:3,name:'Kristal Kahve Yanı Bardak',category:'Kahve Yanı Kristal Bardaklar',price:29,image:'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1200&q=80',description:'Elegant crystal companion glass for coffee service.',discounted:false},
  {id:4,name:'Çay Bardağı Takımı - 6 Parça',category:'Çay Bardağı Takımları',price:56,image:'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=1200&q=80',description:'Luxury tea set for refined hosting.',discounted:false},
  {id:5,name:'Goblen İpek Seccade - Klasik',category:'Goblen İpek Seccadeler',price:120,image:'https://images.unsplash.com/photo-1616627452086-22f8f24a0f0d?auto=format&fit=crop&w=1200&q=80',description:'Premium woven seccade with delicate motif.',discounted:true}
];

const SHIPPING_RATE = 12.99; // Placeholder shipping estimate. Replace when USPS API is integrated.
const CART_KEY = 'vth_lux_cart';
const orderStatuses = ['Order received', 'Preparing shipment', 'Shipped with USPS', 'Out for delivery', 'Delivered'];

const menu = document.getElementById('categoryMenu');
const grid = document.getElementById('productGrid');
const activeCategoryText = document.getElementById('activeCategoryText');
const cartItems = document.getElementById('cartItems');
const subtotal = document.getElementById('subtotal');
const shipping = document.getElementById('shipping');
const finalTotal = document.getElementById('finalTotal');

let selectedCategory = 'All Products';
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

function renderCategories(){
  menu.innerHTML = categories.map(c => `<button class="category-btn ${c===selectedCategory?'active':''}" onclick="selectCategory('${c.replace(/'/g,"\\'")}')">${c}</button>`).join('');
}
function filterProducts(){
  if(selectedCategory==='All Products') return products;
  if(selectedCategory==='İndirimli Ürünler') return products.filter(p=>p.discounted);
  return products.filter(p=>p.category===selectedCategory);
}
function renderProducts(){
  const list = filterProducts();
  activeCategoryText.textContent = selectedCategory;
  grid.innerHTML = list.map(p=>`<article class="product-card"><img src="${p.image}" alt="${p.name}"><div class="product-content"><p class="muted">${p.category}</p><h4>${p.name}</h4><p>$${p.price.toFixed(2)}</p><p class="muted">${p.description}</p><button class="btn-gold" onclick="addToCart(${p.id})">Add to cart</button></div></article>`).join('') || '<p>No products in this category yet.</p>';
}
function selectCategory(cat){selectedCategory=cat;renderCategories();renderProducts();}
function addToCart(id){const cart=getCart();const item=cart.find(x=>x.id===id); if(item) item.qty++; else cart.push({id,qty:1}); saveCart(cart); renderCart();}
function updateQty(id,delta){const cart=getCart().map(i=>i.id===id?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0);saveCart(cart);renderCart();}
function removeItem(id){saveCart(getCart().filter(i=>i.id!==id));renderCart();}
function renderCart(){
  const cart=getCart();
  if(!cart.length){cartItems.innerHTML='<p>Your cart is empty.</p>';subtotal.textContent='$0.00';shipping.textContent='$0.00';finalTotal.textContent='$0.00';return;}
  let sub=0;
  cartItems.innerHTML=cart.map(ci=>{const p=products.find(x=>x.id===ci.id);const line=p.price*ci.qty;sub+=line;return `<div class="cart-item"><div><strong>${p.name}</strong><br/>$${p.price.toFixed(2)} × ${ci.qty}</div><div class="qty-controls"><button class="btn-gold" onclick="updateQty(${p.id},-1)">-</button><button class="btn-gold" onclick="updateQty(${p.id},1)">+</button><button class="btn-gold" onclick="removeItem(${p.id})">Remove</button></div></div>`}).join('');
  const ship=SHIPPING_RATE,total=sub+ship; subtotal.textContent=`$${sub.toFixed(2)}`;shipping.textContent=`$${ship.toFixed(2)}`;finalTotal.textContent=`$${total.toFixed(2)}`;
}

document.getElementById('trackingForm').addEventListener('submit',(e)=>{e.preventDefault(); const orderNo=document.getElementById('orderNumber').value.trim(); const status=orderStatuses[orderNo.length % orderStatuses.length]; document.getElementById('trackingStatus').textContent=`Order #${orderNo}: ${status}`;});
document.getElementById('checkoutForm').addEventListener('submit',(e)=>{e.preventDefault(); document.getElementById('checkoutMessage').textContent='Demo order placed successfully. USPS shipping estimate included.'; saveCart([]); renderCart(); e.target.reset();});
document.querySelectorAll('[data-member]').forEach(btn=>btn.addEventListener('click',()=>{document.getElementById('membershipMessage').textContent=`${btn.textContent} selected (demo mode).`; }));
document.getElementById('mobileMenuBtn').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));

window.selectCategory=selectCategory; window.addToCart=addToCart; window.updateQty=updateQty; window.removeItem=removeItem;
renderCategories(); renderProducts(); renderCart();
