// js/confirmation.js
document.addEventListener('DOMContentLoaded', function() {
    initializeConfirmationPage();
});

class ConfirmationPage {
    constructor() {
        this.orderData = null;
        this.orderId = this.getOrderIdFromURL();
    }

    initialize() {
        if (!this.orderId) {
            this.showError('Order not found');
            return;
        }

        this.loadOrderData();
        this.displayOrderDetails();
        this.initializeEventListeners();
    }

    getOrderIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('orderId');
    }

    loadOrderData() {
        const orders = JSON.parse(localStorage.getItem('nikky-orders') || '[]');
        this.orderData = orders.find(order => order.orderId === this.orderId);

        if (!this.orderData) {
            this.showError('Order not found in our system');
            return;
        }
    }

    displayOrderDetails() {
        this.displayOrderHeader();
        this.displayOrderItems();
        this.displayOrderTotals();
        this.displayShippingInfo();
        this.displayCustomerInfo();
    }

    displayOrderHeader() {
        document.getElementById('order-number').textContent = `Order #${this.orderData.orderId}`;
    }

    displayOrderItems() {
        const itemsContainer = document.getElementById('confirmation-items');
        
        itemsContainer.innerHTML = this.orderData.order.items.map(item => `
            <div class="confirmation-item">
                <div class="confirmation-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="confirmation-item-details">
                    <div class="confirmation-item-name">${item.name}</div>
                    <div class="confirmation-item-meta">
                        Size: ${item.size} | Color: ${item.color}
                    </div>
                    <div class="confirmation-item-price">£${item.price} × ${item.quantity}</div>
                </div>
            </div>
        `).join('');
    }

    displayOrderTotals() {
        const order = this.orderData.order;
        
        document.getElementById('confirmation-subtotal').textContent = `£${order.subtotal.toFixed(2)}`;
        document.getElementById('confirmation-shipping').textContent = order.shipping === 0 ? 'FREE' : `£${order.shipping.toFixed(2)}`;
        document.getElementById('confirmation-tax').textContent = `£${order.tax.toFixed(2)}`;
        document.getElementById('confirmation-total').textContent = `£${order.total.toFixed(2)}`;
    }

    displayShippingInfo() {
        const customer = this.orderData.customer;
        const shipping = customer.shippingAddress;
        
        // Display shipping address
        document.getElementById('shipping-address').innerHTML = `
            <div>${customer.firstName} ${customer.lastName}</div>
            <div>${shipping.address}</div>
            <div>${shipping.city}, ${shipping.postcode}</div>
            <div>${this.getCountryName(shipping.country)}</div>
        `;

        // Display estimated delivery date
        const deliveryDate = this.calculateDeliveryDate();
        document.getElementById('delivery-date').textContent = deliveryDate;
    }

    displayCustomerInfo() {
        const customer = this.orderData.customer;
        const payment = this.orderData.payment;
        
        // Display contact information
        document.getElementById('customer-contact').innerHTML = `
            <div>${customer.firstName} ${customer.lastName}</div>
            <div>${customer.email}</div>
            <div>${customer.phone}</div>
        `;

        // Display payment method
        const paymentMethod = this.getPaymentMethodDisplay(payment.method);
        document.getElementById('payment-method').innerHTML = paymentMethod;

        // Display order date
        const orderDate = new Date(this.orderData.orderDate).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('order-date').textContent = orderDate;
    }

    getCountryName(countryCode) {
        const countries = {
            'GB': 'United Kingdom',
            'US': 'United States',
            'CA': 'Canada',
            'AU': 'Australia',
            'DE': 'Germany',
            'FR': 'France'
        };
        return countries[countryCode] || countryCode;
    }

    getPaymentMethodDisplay(method) {
        const methods = {
            'card': 'Credit/Debit Card',
            'paypal': 'PayPal',
            'apple-pay': 'Apple Pay'
        };

        let display = methods[method] || method;

        if (method === 'card' && this.orderData.payment.cardDetails) {
            display += ` (•••• ${this.orderData.payment.cardDetails.last4})`;
        }

        return display;
    }

    calculateDeliveryDate() {
        const orderDate = new Date(this.orderData.orderDate);
        const deliveryDate = new Date(orderDate);
        
        // Add 3-5 business days
        let businessDays = 3 + Math.floor(Math.random() * 3); // Random between 3-5 days
        
        while (businessDays > 0) {
            deliveryDate.setDate(deliveryDate.getDate() + 1);
            // Skip weekends
            if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
                businessDays--;
            }
        }

        return deliveryDate.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    initializeEventListeners() {
        // Track order button
        document.getElementById('track-order').addEventListener('click', () => {
            this.trackOrder();
        });

        // Print functionality
        this.initializePrintFunctionality();

        // Email confirmation simulation
        this.sendConfirmationEmail();
    }

    trackOrder() {
        // In a real application, this would redirect to a tracking page
        // For now, we'll show a modal with tracking information
        this.showTrackingModal();
    }

    showTrackingModal() {
        const modal = document.createElement('div');
        modal.className = 'tracking-modal';
        modal.innerHTML = `
            <div class="tracking-modal-content">
                <button class="tracking-modal-close">&times;</button>
                <h3>Order Tracking</h3>
                <div class="tracking-info">
                    <div class="tracking-number">
                        <strong>Tracking Number:</strong> TRK${this.orderData.orderId.slice(2)}
                    </div>
                    <div class="tracking-status">
                        <strong>Status:</strong> Order Processing
                    </div>
                    <div class="tracking-timeline">
                        <div class="timeline-item active">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <strong>Order Confirmed</strong>
                                <span>${new Date(this.orderData.orderDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <strong>Processing</strong>
                                <span>Expected: Tomorrow</span>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <strong>Shipped</strong>
                                <span>Expected: In 2 days</span>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <strong>Delivered</strong>
                                <span>Expected: ${this.calculateDeliveryDate()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="tracking-note">
                    You will receive an email with live tracking updates once your order ships.
                </p>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Close modal
        const closeBtn = modal.querySelector('.tracking-modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }
        });
    }

    initializePrintFunctionality() {
        // Add print button to the page
        const printBtn = document.createElement('button');
        printBtn.className = 'btn btn--outline print-btn';
        printBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" stroke-width="2"/>
                <path d="M6 14h12v8H6z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Print Confirmation
        `;
        printBtn.addEventListener('click', () => {
            window.print();
        });

        // Add to the confirmation header
        const confirmationHeader = document.querySelector('.confirmation-header');
        confirmationHeader.appendChild(printBtn);
    }

    sendConfirmationEmail() {
        // Simulate sending confirmation email
        console.log('Confirmation email sent to:', this.orderData.customer.email);
        
        // In a real application, you would make an API call to your email service
        // For demo purposes, we'll just log it
    }

    showError(message) {
        document.querySelector('.confirmation-content').innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <h2>Order Not Found</h2>
                <p>${message}</p>
                <div class="error-actions">
                    <a href="index.html" class="btn btn--gold">Return to Home</a>
                    <a href="cart.html" class="btn btn--outline">View Cart</a>
                </div>
            </div>
        `;
    }
}

// Initialize confirmation page
function initializeConfirmationPage() {
    const confirmationPage = new ConfirmationPage();
    confirmationPage.initialize();
}

// Add modal and error state styles
const confirmationStyles = `
    .tracking-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
        padding: 2rem;
    }
    
    .tracking-modal-content {
        background: var(--white);
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        position: relative;
        border-radius: 10px;
    }
    
    .tracking-modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--charcoal);
    }
    
    .tracking-modal-content h3 {
        margin-bottom: 1.5rem;
        color: var(--charcoal);
    }
    
    .tracking-info {
        margin-bottom: 1.5rem;
    }
    
    .tracking-number,
    .tracking-status {
        margin-bottom: 1rem;
        padding: 1rem;
        background: var(--light-grey);
        border-radius: 5px;
    }
    
    .tracking-timeline {
        position: relative;
        margin: 2rem 0;
        padding-left: 2rem;
    }
    
    .timeline-item {
        position: relative;
        margin-bottom: 2rem;
    }
    
    .timeline-item:last-child {
        margin-bottom: 0;
    }
    
    .timeline-dot {
        position: absolute;
        left: -2rem;
        top: 0;
        width: 12px;
        height: 12px;
        background: var(--light-grey);
        border-radius: 50%;
        border: 2px solid var(--white);
    }
    
    .timeline-item.active .timeline-dot {
        background: var(--gold);
    }
    
    .timeline-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .timeline-content span {
        font-size: 0.9rem;
        opacity: 0.7;
    }
    
    .tracking-note {
        font-size: 0.9rem;
        opacity: 0.8;
        text-align: center;
    }
    
    .print-btn {
        margin-top: 1rem;
    }
    
    .error-state {
        text-align: center;
        padding: 4rem 2rem;
        background: var(--white);
        border-radius: 10px;
        box-shadow: var(--shadow);
    }
    
    .error-icon {
        color: #dc2626;
        margin-bottom: 1.5rem;
    }
    
    .error-state h2 {
        margin-bottom: 1rem;
        color: var(--charcoal);
    }
    
    .error-state p {
        margin-bottom: 2rem;
        opacity: 0.8;
    }
    
    .error-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = confirmationStyles;
document.head.appendChild(styleSheet);