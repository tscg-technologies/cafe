/**
 * CAFE STORE - Core Vanilla JavaScript
 * Features:
 * - Mobile Menu Navigation
 * - Cart Management (Add, update quantity, remove, calculate total, demo checkout)
 * - Menu Category Filtering & Live Search
 * - Gallery Category Filtering
 * - FAQ Accordion
 * - Contact Form Demo Validation
 * - Scroll To Top & Active Nav Indicator
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initCart();
  initMenuFilters();
  initGalleryFilters();
  initFaqAccordion();
  initContactForm();
  initScrollTop();
  highlightActiveNav();
});

/* -------------------------------------------------------------
 * 1. Mobile Navigation
 * ----------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const mainNav = document.getElementById('mainNav');

  if (!toggleBtn || !mainNav) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close nav on click outside
  document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && !toggleBtn.contains(e.target) && mainNav.classList.contains('is-open')) {
      mainNav.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* -------------------------------------------------------------
 * 2. Active Navigation Highlight
 * ----------------------------------------------------------- */
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* -------------------------------------------------------------
 * 3. Shopping Cart System (In-Memory / Session Demo)
 * ----------------------------------------------------------- */
let cartItems = [];

function initCart() {
  const cartTrigger = document.getElementById('cartTrigger');
  const cartClose = document.getElementById('cartCloseBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const checkoutBtn = document.getElementById('checkoutDemoBtn');

  // Load from sessionStorage if available
  try {
    const saved = sessionStorage.getItem('cafestore_cart');
    if (saved) {
      cartItems = JSON.parse(saved);
      updateCartUI();
    }
  } catch (e) {
    console.warn('Session storage inaccessible');
  }

  function openCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add('is-open');
      cartOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.remove('is-open');
      cartOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  if (cartTrigger) cartTrigger.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Add to cart buttons listener
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-add-cart');
    if (!btn) return;

    const id = btn.getAttribute('data-id') || btn.getAttribute('data-name');
    const name = btn.getAttribute('data-name');
    const price = parseFloat(btn.getAttribute('data-price')) || 0;

    addToCart(id, name, price);
    showCartToast(`Added ${name} to cart`);
  });

  // Quantity and remove controls inside cart
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (e) => {
      const target = e.target;
      const itemEl = target.closest('.cart-item');
      if (!itemEl) return;

      const id = itemEl.getAttribute('data-id');

      if (target.closest('.qty-plus')) {
        updateItemQuantity(id, 1);
      } else if (target.closest('.qty-minus')) {
        updateItemQuantity(id, -1);
      } else if (target.closest('.cart-item-remove-btn')) {
        removeItemFromCart(id);
      }
    });
  }

  // Demo Checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cartItems.length === 0) {
        alert('Your cart is empty! Please explore our menu to add items.');
        return;
      }
      const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const confirmDemo = confirm(`[DEMO CHECKOUT SUMMARY]\nTotal Items: ${cartItems.reduce((a, b) => a + b.quantity, 0)}\nTotal Amount: ₹${totalAmount}\n\nThis is an illustrative frontend demonstration. No payment will be processed.\n\nClick OK to simulate order placement.`);
      
      if (confirmDemo) {
        cartItems = [];
        saveCart();
        updateCartUI();
        closeCart();
        alert('🎉 Demo Order Placed Successfully!\nThank you for exploring CAFE STORE. In a production deployment, this would connect to an order management system.');
      }
    });
  }
}

function addToCart(id, name, price) {
  const existing = cartItems.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({ id, name, price, quantity: 1 });
  }
  saveCart();
  updateCartUI();
}

function updateItemQuantity(id, delta) {
  const item = cartItems.find(item => item.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cartItems = cartItems.filter(i => i.id !== id);
  }
  saveCart();
  updateCartUI();
}

function removeItemFromCart(id) {
  cartItems = cartItems.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}

function saveCart() {
  try {
    sessionStorage.setItem('cafestore_cart', JSON.stringify(cartItems));
  } catch (e) {
    // Ignore storage issues
  }
}

function updateCartUI() {
  const countBadge = document.getElementById('cartCountBadge');
  const itemsContainer = document.getElementById('cartItemsContainer');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (countBadge) {
    countBadge.textContent = totalCount;
  }

  if (subtotalEl) subtotalEl.textContent = `₹${totalPrice}`;
  if (totalEl) totalEl.textContent = `₹${totalPrice}`;

  if (!itemsContainer) return;

  if (cartItems.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <div class="cart-empty-icon">☕</div>
        <h4>Your Cart is Empty</h4>
        <p>Explore our menu and add your favorite coffee and treats.</p>
      </div>
    `;
    return;
  }

  itemsContainer.innerHTML = cartItems.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-unit-price">₹${item.price} each</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn qty-minus" aria-label="Decrease quantity">−</button>
        <span class="qty-count">${item.quantity}</span>
        <button class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-item-total" style="font-weight: 700; color: var(--color-espresso); min-width: 55px; text-align: right;">
        ₹${item.price * item.quantity}
      </div>
      <button class="cart-item-remove-btn" title="Remove item" aria-label="Remove item">
        ✕
      </button>
    </div>
  `).join('');
}

function showCartToast(message) {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'cart-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  toast.classList.add('is-visible');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2600);
}

/* -------------------------------------------------------------
 * 4. Menu Filtering & Live Search
 * ----------------------------------------------------------- */
function initMenuFilters() {
  const filterBtns = document.querySelectorAll('.menu-filter-btn');
  const searchInput = document.getElementById('menuSearchInput');
  const cards = document.querySelectorAll('.menu-card[data-category]');

  if (filterBtns.length === 0 && !searchInput) return;

  let activeCategory = 'all';
  let searchTerm = '';

  function applyFilter() {
    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      const name = (card.querySelector('.menu-item-name')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.menu-item-desc')?.textContent || '').toLowerCase();

      const matchesCategory = (activeCategory === 'all' || category === activeCategory);
      const matchesSearch = !searchTerm || name.includes(searchTerm) || desc.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    const noResults = document.getElementById('noMenuResults');
    if (noResults) {
      const visibleCount = Array.from(cards).filter(c => c.style.display !== 'none').length;
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      applyFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilter();
    });
  }
}

/* -------------------------------------------------------------
 * 5. Gallery Filtering
 * ----------------------------------------------------------- */
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const items = document.querySelectorAll('.gallery-item[data-category]');

  if (filterBtns.length === 0 || items.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filter === 'all' || itemCategory === filter) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* -------------------------------------------------------------
 * 6. FAQ Accordion
 * ----------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length === 0) return;

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer');

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other accordions
      faqItems.forEach(other => {
        if (other !== item && other.classList.contains('active')) {
          other.classList.remove('active');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        item.classList.remove('active');
        answer.style.maxHeight = null;
      }
    });
  });
}

/* -------------------------------------------------------------
 * 7. Contact Form Demo Validation
 * ----------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('cafeContactForm');
  const successBanner = document.getElementById('contactSuccessBanner');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');

    let isValid = true;

    // Reset validations
    [nameInput, emailInput, messageInput].forEach(inp => {
      if (inp) inp.classList.remove('is-invalid');
    });

    if (!nameInput || !nameInput.value.trim()) {
      if (nameInput) nameInput.classList.add('is-invalid');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput || !emailRegex.test(emailInput.value.trim())) {
      if (emailInput) emailInput.classList.add('is-invalid');
      isValid = false;
    }

    if (!messageInput || messageInput.value.trim().length < 10) {
      if (messageInput) messageInput.classList.add('is-invalid');
      isValid = false;
    }

    if (isValid) {
      if (successBanner) {
        successBanner.style.display = 'block';
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      form.reset();
    }
  });
}

/* -------------------------------------------------------------
 * 8. Scroll To Top Button
 * ----------------------------------------------------------- */
function initScrollTop() {
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (!scrollBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('is-visible');
    } else {
      scrollBtn.classList.remove('is-visible');
    }
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
