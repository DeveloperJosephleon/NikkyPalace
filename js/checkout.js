// js/checkout.js
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckoutPage();
});

class CheckoutPage {
    constructor() {
        this.cart = cart;
        this.orderData = {};
        this.shippingCost = 15;
        this.taxRate = 0.2;
        this.discount = 0;
    }

    initialize() {
        this.validateCart();
        this.loadOrderSummary();
        this.initializeForm();
        this.initializeEventListeners();
        this.calculateTotals();
    }

    validateCart() {
        if (this.cart.items.length === 0) {
            this.showEmptyCartMessage();
            return false;
        }

        // Check if cart data exists in localStorage (in case of page refresh)
        const savedCart = localStorage.getItem('nikky-checkout-cart');
        if (!savedCart) {
            this.showEmptyCartMessage();
            return false;
        }

        return true;
    }

    showEmptyCartMessage() {
        document.querySelector('.checkout-content').innerHTML = `
            <div class="empty-checkout">
                <div class="empty-checkout-content">
                    <h2>Your cart is empty</h2>
                    <p>Please add some items to your cart before proceeding to checkout.</p>
                    <div class="empty-checkout-actions">
                        <a href="index.html" class="btn btn--gold">Continue Shopping</a>
                        <a href="cart.html" class="btn btn--outline">View Cart</a>
                    </div>
                </div>
            </div>
        `;
    }

    loadOrderSummary() {
        const orderItemsContainer = document.getElementById('order-items');
        
        orderItemsContainer.innerHTML = this.cart.items.map(item => `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="order-item-details">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-meta">
                        Size: ${item.size} | Color: ${item.color}
                    </div>
                    <div class="order-item-price">£${item.price}</div>
                    <div class="order-item-quantity">Qty: ${item.quantity}</div>
                </div>
            </div>
        `).join('');
    }

    initializeForm() {
        this.initializeBillingToggle();
        this.initializePaymentMethods();
        this.initializeFormValidation();
    }

    initializeBillingToggle() {
        const billingCheckbox = document.getElementById('billing-same');
        const billingSection = document.getElementById('billing-section');

        billingCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                billingSection.style.display = 'none';
                this.clearBillingFields();
            } else {
                billingSection.style.display = 'block';
            }
        });
    }

    clearBillingFields() {
        const billingFields = [
            'billingFirstName', 'billingLastName', 'billingAddress',
            'billingCity', 'billingPostcode'
        ];

        billingFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.value = '';
                element.classList.remove('error');
            }
        });
    }

    initializePaymentMethods() {
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        const cardDetails = document.getElementById('card-details');
        const paypalNotice = document.getElementById('paypal-notice');
        const applePayNotice = document.getElementById('apple-pay-notice');

        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                const value = e.target.value;
                
                // Hide all sections first
                cardDetails.style.display = 'none';
                paypalNotice.style.display = 'none';
                applePayNotice.style.display = 'none';

                // Show relevant section
                if (value === 'card') {
                    cardDetails.style.display = 'block';
                } else if (value === 'paypal') {
                    paypalNotice.style.display = 'block';
                } else if (value === 'apple-pay') {
                    applePayNotice.style.display = 'block';
                }
            });
        });
    }

    initializeFormValidation() {
        const form = document.getElementById('checkout-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.processOrder();
            }
        });

        // Real-time validation
        this.initializeRealTimeValidation();
    }

    initializeRealTimeValidation() {
        const inputs = document.querySelectorAll('input[required], select[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                // Clear error when user starts typing
                if (input.classList.contains('error')) {
                    this.clearFieldError(input);
                }
            });
        });

        // Special validation for card fields
        this.initializeCardValidation();
    }

    initializeCardValidation() {
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');

        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue.substring(0, 19);
            });
        }

        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value.substring(0, 5);
            });
        }

        if (cvv) {
            cvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
            });
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate card details if card payment is selected
        const cardPayment = document.getElementById('credit-card').checked;
        if (cardPayment) {
            const cardFields = ['cardNumber', 'expiryDate', 'cvv', 'cardName'];
            cardFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !this.validateField(field)) {
                    isValid = false;
                }
            });
        }

        // Validate billing address if different from shipping
        const billingSame = document.getElementById('billing-same').checked;
        if (!billingSame) {
            const billingFields = ['billingFirstName', 'billingLastName', 'billingAddress', 'billingCity', 'billingPostcode'];
            billingFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !this.validateField(field)) {
                    isValid = false;
                }
            });
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        
        this.clearFieldError(field);

        // Check if field is empty
        if (!value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        // Field-specific validation
        switch (fieldName) {
            case 'email':
                if (!this.isValidEmail(value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    return false;
                }
                break;
                
            case 'phone':
                if (!this.isValidPhone(value)) {
                    this.showFieldError(field, 'Please enter a valid phone number');
                    return false;
                }
                break;
                
            case 'postcode':
            case 'billingPostcode':
                if (!this.isValidUKPostcode(value)) {
                    this.showFieldError(field, 'Please enter a valid UK postcode');
                    return false;
                }
                break;
                
            case 'cardNumber':
                if (!this.isValidCardNumber(value)) {
                    this.showFieldError(field, 'Please enter a valid card number');
                    return false;
                }
                break;
                
            case 'expiryDate':
                if (!this.isValidExpiryDate(value)) {
                    this.showFieldError(field, 'Please enter a valid expiry date (MM/YY)');
                    return false;
                }
                break;
                
            case 'cvv':
                if (!this.isValidCVV(value)) {
                    this.showFieldError(field, 'Please enter a valid CVV');
                    return false;
                }
                break;
        }

        return true;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // Validation helper methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    isValidUKPostcode(postcode) {
        const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
        return postcodeRegex.test(postcode);
    }

    isValidCardNumber(number) {
        const cleaned = number.replace(/\s+/g, '');
        return /^\d{13,19}$/.test(cleaned);
    }

    isValidExpiryDate(date) {
        const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!regex.test(date)) return false;

        const [month, year] = date.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month));
        const now = new Date();
        
        return expiry > now;
    }

    isValidCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    calculateTotals() {
        const subtotal = this.cart.getTotal();
        const shipping = subtotal >= 200 ? 0 : this.shippingCost;
        const tax = subtotal * this.taxRate;
        const total = subtotal + shipping + tax - this.discount;

        // Update summary display
        document.getElementById('summary-subtotal').textContent = `£${subtotal.toFixed(2)}`;
        document.getElementById('summary-shipping').textContent = shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`;
        document.getElementById('summary-tax').textContent = `£${tax.toFixed(2)}`;
        document.getElementById('summary-total').textContent = `£${total.toFixed(2)}`;
        document.getElementById('order-total-amount').textContent = total.toFixed(2);

        // Show/hide discount line
        const discountLine = document.getElementById('discount-line');
        const discountAmount = document.getElementById('summary-discount');
        
        if (this.discount > 0) {
            discountLine.style.display = 'flex';
            discountAmount.textContent = `-£${this.discount.toFixed(2)}`;
        } else {
            discountLine.style.display = 'none';
        }
    }

    initializeEventListeners() {
        // Apply any saved promo code from cart
        this.applySavedPromo();
    }

    applySavedPromo() {
        // This would integrate with the promo system from cart page
        // For now, we'll just calculate totals
        this.calculateTotals();
    }

    processOrder() {
        // Show loading state
        const submitBtn = document.querySelector('.place-order-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Processing...';
        submitBtn.disabled = true;

        // Collect form data
        const formData = new FormData(document.getElementById('checkout-form'));
        const orderData = {
            customer: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                shippingAddress: {
                    address: formData.get('address'),
                    city: formData.get('city'),
                    postcode: formData.get('postcode'),
                    country: formData.get('country')
                },
                billingAddress: formData.get('billing-same') === 'on' ? null : {
                    firstName: formData.get('billingFirstName'),
                    lastName: formData.get('billingLastName'),
                    address: formData.get('billingAddress'),
                    city: formData.get('billingCity'),
                    postcode: formData.get('billingPostcode')
                }
            },
            payment: {
                method: formData.get('paymentMethod'),
                cardDetails: formData.get('paymentMethod') === 'card' ? {
                    last4: formData.get('cardNumber').slice(-4),
                    expiry: formData.get('expiryDate')
                } : null
            },
            order: {
                items: this.cart.items,
                subtotal: this.cart.getTotal(),
                shipping: this.shippingCost,
                tax: this.cart.getTotal() * this.taxRate,
                discount: this.discount,
                total: this.calculateTotal(),
                notes: formData.get('orderNotes')
            },
            orderDate: new Date().toISOString(),
            orderId: this.generateOrderId()
        };

        // Simulate API call delay
        setTimeout(() => {
            this.saveOrder(orderData);
            this.redirectToConfirmation(orderData.orderId);
        }, 2000);
    }

    calculateTotal() {
        const subtotal = this.cart.getTotal();
        const shipping = subtotal >= 200 ? 0 : this.shippingCost;
        const tax = subtotal * this.taxRate;
        return subtotal + shipping + tax - this.discount;
    }

    generateOrderId() {
        return 'NK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    saveOrder(orderData) {
        // Save order to localStorage
        const orders = JSON.parse(localStorage.getItem('nikky-orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('nikky-orders', JSON.stringify(orders));

        // Clear cart
        this.cart.clear();

        // Clear checkout cart
        localStorage.removeItem('nikky-checkout-cart');
    }

    redirectToConfirmation(orderId) {
        window.location.href = `order-confirmation.html?orderId=${orderId}`;
    }
}

// Initialize checkout page
function initializeCheckoutPage() {
    const checkoutPage = new CheckoutPage();
    checkoutPage.initialize();
}

// Add empty checkout styles
const checkoutStyles = `
    .empty-checkout {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
    }
    
    .empty-checkout-content h2 {
        margin-bottom: 1rem;
        color: var(--charcoal);
    }
    
    .empty-checkout-content p {
        margin-bottom: 2rem;
        color: var(--charcoal);
        opacity: 0.7;
    }
    
    .empty-checkout-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = checkoutStyles;
document.head.appendChild(styleSheet);