// js/app.js
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeMobileMenu();
    initializeSearch();
    loadHomepageProducts();
    initializeAnimations();
    initializeNewsletter();
}

function initializeMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.mobile-menu-close');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

function initializeSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('.search-input');
    const suggestions = document.querySelector('.search-suggestions');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                searchInput.focus();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                showSearchSuggestions(query);
            } else {
                suggestions.innerHTML = '';
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }

    // Close search when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target) && !searchBtn.contains(e.target)) {
            searchContainer.classList.remove('active');
        }
    });
}

function showSearchSuggestions(query) {
    const results = searchProducts(query).slice(0, 5);
    const suggestions = document.querySelector('.search-suggestions');
    
    suggestions.innerHTML = results.map(product => `
        <div class="search-suggestion" data-id="${product.id}">
            <img src="${product.images[0]}" alt="${product.name}" width="40" height="40">
            <div>
                <div class="suggestion-name">${product.name}</div>
                <div class="suggestion-price">£${product.price}</div>
            </div>
        </div>
    `).join('');

    // Add click listeners to suggestions
    document.querySelectorAll('.search-suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', () => {
            const productId = suggestion.getAttribute('data-id');
            window.location.href = `product.html?id=${productId}`;
        });
    });
}

function performSearch(query) {
    if (query.trim()) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
}

function loadHomepageProducts() {
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    const bestsellersGrid = document.getElementById('bestsellers-grid');

    if (newArrivalsGrid) {
        const newArrivals = getNewArrivals().slice(0, 4);
        newArrivalsGrid.innerHTML = newArrivals.map(product => createProductCard(product)).join('');
    }

    if (bestsellersGrid) {
        const bestsellers = getBestSellers().slice(0, 4);
        bestsellersGrid.innerHTML = bestsellers.map(product => createProductCard(product)).join('');
    }

    // Add event listeners to product cards
    initializeProductCards();
}

function createProductCard(product) {
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">£${product.price}</div>
                <button class="btn btn--outline quick-view-btn" data-id="${product.id}">Quick View</button>
            </div>
        </div>
    `;
}

function initializeProductCards() {
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

function showQuickView(productId) {
    const product = getProductById(productId);
    if (!product) return;

    // Create quick view modal
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="quick-view-content">
            <button class="quick-view-close">&times;</button>
            <div class="quick-view-image">
                <img src="${product.images[0]}" alt="${product.name}">
            </div>
            <div class="quick-view-details">
                <h2>${product.name}</h2>
                <div class="price">£${product.price}</div>
                <p>${product.description}</p>
                <div class="quick-view-actions">
                    <button class="btn btn--gold" onclick="window.location.href='product.html?id=${product.id}'">
                        View Full Details
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close modal
    const closeBtn = modal.querySelector('.quick-view-close');
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

function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `fadeIn 1s ease ${entry.target.dataset.delay || '0s'} forwards`;
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.fade-in, .slide-up').forEach(el => {
        observer.observe(el);
    });
}

function initializeNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            
            // Simulate newsletter signup
            form.innerHTML = '<p class="success-message">Thank you for subscribing to Nikky Fashion Palace!</p>';
            
            // You would typically send this to a server here
            console.log('Newsletter signup:', email);
        });
    }
}

// Add CSS for toast and modal
const additionalStyles = `
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
    }
    
    .cart-toast.show {
        transform: translateX(0);
    }
    
    .quick-view-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        padding: 2rem;
    }
    
    .quick-view-content {
        background: var(--white);
        max-width: 800px;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        position: relative;
    }
    
    .quick-view-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 2rem;
        color: var(--charcoal);
        cursor: pointer;
        z-index: 1;
    }
    
    .quick-view-image img {
        width: 100%;
        height: 400px;
        object-fit: cover;
    }
    
    .quick-view-details {
        padding: 2rem;
    }
    
    .search-suggestion {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem;
        cursor: pointer;
        transition: var(--transition);
    }
    
    .search-suggestion:hover {
        background: var(--light-grey);
    }
    
    .search-suggestion img {
        width: 40px;
        height: 40px;
        object-fit: cover;
    }
    
    .suggestion-name {
        font-weight: 500;
    }
    
    .suggestion-price {
        color: var(--gold);
        font-weight: 600;
    }
    
    .success-message {
        text-align: center;
        color: var(--gold);
        font-weight: 500;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);