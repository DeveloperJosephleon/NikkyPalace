// js/cart-page.js
document.addEventListener('DOMContentLoaded', function() {
    initializeCartPage();
});

class CartPage {
    constructor() {
        this.cart = cart;
        this.promoCode = null;
        this.promoDiscount = 0;
        this.shippingThreshold = 200;
        this.shippingCost = 15;
        this.taxRate = 0.2; // 20% VAT
    }

    initialize() {
        this.loadCartItems();
        this.updateCartSummary();
        this.initializeEventListeners();
        this.loadRecentlyViewed();
    }

    loadCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const cartItemsCount = document.getElementById('cart-items-count');

        if (this.cart.items.length === 0) {
            cartItemsContainer.style.display = 'none';
            emptyCart.classList.add('active');
            cartItemsCount.textContent = '0 items';
            return;
        }

        cartItemsContainer.style.display = 'flex';
        emptyCart.classList.remove('active');
        cartItemsCount.textContent = `${this.cart.getItemCount()} item${this.cart.getItemCount() !== 1 ? 's' : ''}`;

        cartItemsContainer.innerHTML = this.cart.items.map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                
                <div class="cart-item-details">
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <div class="cart-item-meta">
                            Size: ${item.size} | Color: ${item.color}
                        </div>
                        <div class="cart-item-price">
                            £${item.price}
                        </div>
                    </div>
                </div>
                
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-action="decrease" title="Decrease quantity">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" data-action="increase" title="Increase quantity">+</button>
                    </div>
                    
                    <div class="item-total">
                        £${(item.price * item.quantity).toFixed(2)}
                    </div>
                    
                    <button class="remove-item" title="Remove item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        this.initializeCartItemEvents();
    }

    initializeCartItemEvents() {
        // Quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.cart-item').getAttribute('data-index'));
                const action = e.target.getAttribute('data-action');
                
                if (action === 'increase') {
                    this.updateQuantity(index, this.cart.items[index].quantity + 1);
                } else if (action === 'decrease') {
                    this.updateQuantity(index, this.cart.items[index].quantity - 1);
                }
            });
        });

        // Remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.cart-item').getAttribute('data-index'));
                this.removeItem(index);
            });
        });
    }

    initializeEventListeners() {
        // Continue shopping button
        document.getElementById('continue-shopping').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Checkout button
        document.getElementById('checkout-btn').addEventListener('click', () => {
            this.proceedToCheckout();
        });

        // Promo code
        document.getElementById('apply-promo').addEventListener('click', () => {
            this.applyPromoCode();
        });

        document.getElementById('promo-code').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyPromoCode();
            }
        });
    }

    updateQuantity(index, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(index);
            return;
        }

        if (newQuantity > 10) {
            this.showMessage('Maximum quantity per item is 10', 'error');
            return;
        }

        this.cart.updateQuantity(index, newQuantity);
        this.loadCartItems();
        this.updateCartSummary();
    }

    removeItem(index) {
        if (confirm('Are you sure you want to remove this item from your cart?')) {
            this.cart.removeItem(index);
            this.loadCartItems();
            this.updateCartSummary();
        }
    }

    updateCartSummary() {
        const subtotal = this.cart.getTotal();
        const shipping = this.calculateShipping(subtotal);
        const tax = this.calculateTax(subtotal);
        const total = this.calculateTotal(subtotal, shipping, tax);

        document.getElementById('subtotal').textContent = `£${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`;
        document.getElementById('tax').textContent = `£${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `£${total.toFixed(2)}`;

        // Update checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.disabled = this.cart.items.length === 0;
        checkoutBtn.textContent = this.cart.items.length === 0 
            ? 'Cart is Empty' 
            : `Proceed to Checkout - £${total.toFixed(2)}`;

        // Update shipping notice
        const shippingNotice = document.querySelector('.shipping-notice');
        const remaining = this.shippingThreshold - subtotal;
        
        if (remaining > 0) {
            shippingNotice.innerHTML = `
                <p>✓ Add £${remaining.toFixed(2)} more for free shipping</p>
                <p>✓ Delivery within 3-5 business days</p>
            `;
        } else {
            shippingNotice.innerHTML = `
                <p>✓ Free shipping applied</p>
                <p>✓ Delivery within 3-5 business days</p>
            `;
        }
    }

    calculateShipping(subtotal) {
        return subtotal >= this.shippingThreshold ? 0 : this.shippingCost;
    }

    calculateTax(subtotal) {
        return subtotal * this.taxRate;
    }

    calculateTotal(subtotal, shipping, tax) {
        return subtotal + shipping + tax - this.promoDiscount;
    }

    applyPromoCode() {
        const promoInput = document.getElementById('promo-code');
        const promoMessage = document.getElementById('promo-message');
        const code = promoInput.value.trim().toUpperCase();

        const validPromoCodes = {
            'WELCOME10': 0.1,  // 10% off
            'FREESHIP': 'free-shipping',
            'LUXURY20': 0.2   // 20% off
        };

        if (!code) {
            promoMessage.textContent = 'Please enter a promo code';
            promoMessage.className = 'promo-message error';
            return;
        }

        if (validPromoCodes[code]) {
            this.promoCode = code;
            
            if (validPromoCodes[code] === 'free-shipping') {
                this.shippingCost = 0;
                promoMessage.textContent = 'Free shipping applied!';
            } else {
                const discountRate = validPromoCodes[code];
                this.promoDiscount = this.cart.getTotal() * discountRate;
                promoMessage.textContent = `Discount applied! £${this.promoDiscount.toFixed(2)} off`;
            }
            
            promoMessage.className = 'promo-message success';
            promoInput.disabled = true;
            document.getElementById('apply-promo').textContent = 'Applied';
            document.getElementById('apply-promo').disabled = true;
            
            this.updateCartSummary();
        } else {
            promoMessage.textContent = 'Invalid promo code';
            promoMessage.className = 'promo-message error';
        }
    }

    proceedToCheckout() {
        if (this.cart.items.length === 0) {
            this.showMessage('Your cart is empty', 'error');
            return;
        }

        // Save cart state for checkout page
        localStorage.setItem('nikky-checkout-cart', JSON.stringify(this.cart.items));
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }

    loadRecentlyViewed() {
        const recentlyViewedGrid = document.getElementById('recently-viewed-grid');
        const recentlyViewed = this.getRecentlyViewed();
        
        if (recentlyViewed.length === 0) {
            // Show some bestsellers if no recently viewed
            const bestsellers = getBestSellers().slice(0, 4);
            recentlyViewedGrid.innerHTML = bestsellers.map(product => this.createProductCard(product)).join('');
        } else {
            recentlyViewedGrid.innerHTML = recentlyViewed.map(product => this.createProductCard(product)).join('');
        }

        this.initializeProductCards();
    }

    getRecentlyViewed() {
        const viewed = JSON.parse(localStorage.getItem('nikky-recently-viewed') || '[]');
        return viewed.map(id => getProductById(id)).filter(product => product).slice(0, 4);
    }

    createProductCard(product) {
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                    ${product.collection === 'new' ? '<span class="product-badge new">New</span>' : ''}
                    ${product.bestseller ? '<span class="product-badge bestseller">Bestseller</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">£${product.price}</div>
                    <button class="btn btn--outline quick-view-btn" data-id="${product.id}">Quick View</button>
                </div>
            </div>
        `;
    }

    initializeProductCards() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('quick-view-btn')) {
                    const productId = card.getAttribute('data-id');
                    window.location.href = `product.html?id=${productId}`;
                }
            });
        });

        document.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.getAttribute('data-id');
                showQuickView(productId);
            });
        });
    }

    showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `cart-toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize cart page
function initializeCartPage() {
    const cartPage = new CartPage();
    cartPage.initialize();
}

// Add toast styles for cart page
const cartStyles = `
    .cart-toast {
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--gold);
        color: var(--charcoal);
        padding: 1rem 1.5rem;
        border-radius: 0;
        box-shadow: var(--shadow);
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-weight: 500;
    }
    
    .cart-toast.show {
        transform: translateX(0);
    }
    
    .cart-toast.error {
        background: #fecaca;
        color: #dc2626;
    }
    
    .cart-toast.success {
        background: #d1fae5;
        color: #059669;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = cartStyles;
document.head.appendChild(styleSheet);