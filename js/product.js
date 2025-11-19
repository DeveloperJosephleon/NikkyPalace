// js/product.js
document.addEventListener('DOMContentLoaded', function() {
    initializeProductPage();
});

function initializeProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductData(productId);
        initializeProductInteractions();
        loadReviews(productId);
        loadRelatedProducts(productId);
    } else {
        // Redirect to homepage if no product ID
        window.location.href = 'index.html';
    }
}

function loadProductData(productId) {
    const product = getProductById(productId);
    
    if (!product) {
        document.querySelector('.product-page').innerHTML = `
            <div class="container" style="padding: 120px 0; text-align: center;">
                <h1>Product Not Found</h1>
                <p>Sorry, the product you're looking for doesn't exist.</p>
                <a href="index.html" class="btn btn--gold">Return to Home</a>
            </div>
        `;
        return;
    }

    // Update page title
    document.title = `${product.name} - Nikky Fashion Palace`;

    // Update breadcrumb
    document.getElementById('category-link').href = `category.html?category=${product.category}`;
    document.getElementById('category-link').textContent = 
        product.category.charAt(0).toUpperCase() + product.category.slice(1);
    document.getElementById('product-category').textContent = product.name;

    // Update product info
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-price').textContent = `£${product.price}`;
    document.getElementById('dynamic-price').textContent = product.price;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-material').textContent = product.material;

    // Load images
    loadProductImages(product);

    // Load size options
    loadSizeOptions(product);

    // Load color options
    loadColorOptions(product);

    // Initialize quantity and price updates
    initializeQuantityHandler(product);
}

function loadProductImages(product) {
    const mainImage = document.getElementById('main-product-image');
    const thumbnailsContainer = document.getElementById('image-thumbnails');

    if (product.images.length > 0) {
        mainImage.src = product.images[0];
        mainImage.alt = product.name;

        thumbnailsContainer.innerHTML = product.images.map((image, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${image}">
                <img src="${image}" alt="${product.name} view ${index + 1}">
            </div>
        `).join('');

        // Add thumbnail click handlers
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', function() {
                const imageUrl = this.getAttribute('data-image');
                mainImage.src = imageUrl;
                
                // Update active thumbnail
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
}

function loadSizeOptions(product) {
    const sizesContainer = document.getElementById('size-options');
    
    sizesContainer.innerHTML = product.sizes.map(size => `
        <div class="size-option" data-size="${size}">${size}</div>
    `).join('');

    // Add size selection handlers
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', function() {
            if (!this.classList.contains('disabled')) {
                document.querySelectorAll('.size-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
            }
        });
    });

    // Select first available size by default
    if (product.sizes.length > 0) {
        document.querySelector('.size-option').click();
    }
}

function loadColorOptions(product) {
    const colorsContainer = document.getElementById('color-options');
    
    // Map color names to background colors
    const colorMap = {
        'Black': '#000000',
        'White': '#FFFFFF',
        'Champagne': '#E6C98D',
        'Navy': '#1A1A1A',
        'Charcoal': '#333333',
        'Camel': '#C19A6B',
        'Cream': '#F5E9D3',
        'Burgundy': '#800020',
        'Cognac': '#9A463D',
        'Grey': '#808080',
        'Beige': '#F5E9D3',
        'Pink': '#FFB6C1',
        'Blue': '#0000FF',
        'Ivory': '#FFFFF0'
    };

    colorsContainer.innerHTML = product.colors.map(color => `
        <div class="color-option" data-color="${color}" style="background-color: ${colorMap[color] || '#CCCCCC'}" title="${color}"></div>
    `).join('');

    // Add color selection handlers
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });

    // Select first color by default
    if (product.colors.length > 0) {
        document.querySelector('.color-option').click();
    }
}

function initializeQuantityHandler(product) {
    const quantityInput = document.querySelector('.quantity-input');
    const decreaseBtn = document.querySelector('[data-action="decrease"]');
    const increaseBtn = document.querySelector('[data-action="increase"]');
    const dynamicPrice = document.getElementById('dynamic-price');

    function updatePrice() {
        const quantity = parseInt(quantityInput.value);
        const total = product.price * quantity;
        dynamicPrice.textContent = total.toFixed(2);
    }

    decreaseBtn.addEventListener('click', () => {
        const current = parseInt(quantityInput.value);
        if (current > 1) {
            quantityInput.value = current - 1;
            updatePrice();
        }
    });

    increaseBtn.addEventListener('click', () => {
        const current = parseInt(quantityInput.value);
        if (current < 10) {
            quantityInput.value = current + 1;
            updatePrice();
        }
    });

    quantityInput.addEventListener('change', updatePrice);
}

function initializeProductInteractions() {
    const addToCartForm = document.getElementById('add-to-cart-form');
    
    addToCartForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productId = new URLSearchParams(window.location.search).get('id');
        const product = getProductById(productId);
        
        const selectedSize = document.querySelector('.size-option.selected')?.getAttribute('data-size');
        const selectedColor = document.querySelector('.color-option.selected')?.getAttribute('data-color');
        const quantity = parseInt(document.querySelector('.quantity-input').value);

        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        if (!selectedColor) {
            alert('Please select a color');
            return;
        }

        cart.addItem(product, selectedSize, selectedColor, quantity);
    });

    // Review modal
    const reviewModal = document.getElementById('review-modal');
    const writeReviewBtn = document.getElementById('write-review-btn');
    const closeReviewModal = document.querySelector('.review-modal-close');

    writeReviewBtn.addEventListener('click', () => {
        reviewModal.classList.add('active');
    });

    closeReviewModal.addEventListener('click', () => {
        reviewModal.classList.remove('active');
    });

    reviewModal.addEventListener('click', (e) => {
        if (e.target === reviewModal) {
            reviewModal.classList.remove('active');
        }
    });

    // Star rating
    initializeStarRating();

    // Review form submission
    initializeReviewForm();
}

function initializeStarRating() {
    const stars = document.querySelectorAll('.rating-input .star');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            
            stars.forEach(s => {
                const starRating = parseInt(s.getAttribute('data-rating'));
                s.classList.toggle('active', starRating <= rating);
            });
        });
    });
}

function initializeReviewForm() {
    const form = document.getElementById('review-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productId = new URLSearchParams(window.location.search).get('id');
        const formData = new FormData(this);
        const rating = document.querySelectorAll('.rating-input .star.active').length;
        
        const review = {
            id: Date.now(),
            productId: parseInt(productId),
            name: formData.get('name'),
            rating: rating,
            comment: formData.get('comment'),
            date: new Date().toISOString()
        };
        
        saveReview(review);
        loadReviews(productId);
        
        document.getElementById('review-modal').classList.remove('active');
        form.reset();
        
        // Reset stars
        document.querySelectorAll('.rating-input .star').forEach(star => {
            star.classList.remove('active');
        });
    });
}

function saveReview(review) {
    let reviews = JSON.parse(localStorage.getItem('nikky-reviews') || '[]');
    reviews.push(review);
    localStorage.setItem('nikky-reviews', JSON.stringify(reviews));
}

function loadReviews(productId) {
    const reviewsList = document.getElementById('reviews-list');
    const allReviews = JSON.parse(localStorage.getItem('nikky-reviews') || '[]');
    const productReviews = allReviews.filter(review => review.productId === parseInt(productId));
    
    // Update summary
    const averageRating = productReviews.length > 0 
        ? (productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length).toFixed(1)
        : '0.0';
    
    document.querySelector('.rating-score').textContent = averageRating;
    document.querySelector('.rating-count').textContent = `Based on ${productReviews.length} reviews`;
    
    // Display reviews
    if (productReviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="no-reviews">
                <p>No reviews yet. Be the first to write one!</p>
            </div>
        `;
    } else {
        reviewsList.innerHTML = productReviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">${review.name}</div>
                    <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
                </div>
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <div class="review-comment">${review.comment}</div>
            </div>
        `).join('');
    }
}

function loadRelatedProducts(currentProductId) {
    const currentProduct = getProductById(currentProductId);
    const relatedProducts = getProductsByCategory(currentProduct.category)
        .filter(product => product.id !== parseInt(currentProductId))
        .slice(0, 4);
    
    const relatedGrid = document.getElementById('related-products-grid');
    
    if (relatedProducts.length === 0) {
        relatedGrid.innerHTML = '<p>No related products found.</p>';
    } else {
        relatedGrid.innerHTML = relatedProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">£${product.price}</div>
                    <button class="btn btn--outline" onclick="window.location.href='product.html?id=${product.id}'">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }
}