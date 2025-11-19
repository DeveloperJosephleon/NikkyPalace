// js/category.js
document.addEventListener('DOMContentLoaded', function() {
    initializeCategoryPage();
});

class CategoryFilter {
    constructor() {
        this.currentCategory = null;
        this.filters = {
            priceRange: { min: null, max: null },
            collections: [],
            sizes: [],
            colors: []
        };
        this.sortBy = 'featured';
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
    }

    initialize(category) {
        this.currentCategory = category;
        this.loadProducts();
        this.initializeFilters();
        this.initializeSorting();
        this.initializeEventListeners();
        this.applyFilters();
    }

    loadProducts() {
        if (this.currentCategory === 'all') {
            this.products = [...products];
        } else {
            this.products = getProductsByCategory(this.currentCategory);
        }
    }

    initializeFilters() {
        this.initializePriceFilter();
        this.initializeCollectionFilter();
        this.initializeSizeFilter();
        this.initializeColorFilter();
    }

    initializePriceFilter() {
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        const applyPriceBtn = document.getElementById('apply-price');

        applyPriceBtn.addEventListener('click', () => {
            this.filters.priceRange.min = minPrice.value ? parseFloat(minPrice.value) : null;
            this.filters.priceRange.max = maxPrice.value ? parseFloat(maxPrice.value) : null;
            this.applyFilters();
        });

        // Enter key support
        [minPrice, maxPrice].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    applyPriceBtn.click();
                }
            });
        });
    }

    initializeCollectionFilter() {
        const collectionCheckboxes = document.querySelectorAll('input[name="collection"]');
        
        collectionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.collections.push(e.target.value);
                } else {
                    this.filters.collections = this.filters.collections.filter(c => c !== e.target.value);
                }
                this.applyFilters();
            });
        });
    }

    initializeSizeFilter() {
        const sizesContainer = document.getElementById('size-filters');
        
        // Get all unique sizes from products in this category
        const allSizes = [...new Set(this.products.flatMap(product => product.sizes))].sort();
        
        sizesContainer.innerHTML = allSizes.map(size => `
            <label class="filter-option">
                <input type="checkbox" name="size" value="${size}">
                <span class="checkmark"></span>
                ${size}
            </label>
        `).join('');

        // Add event listeners
        sizesContainer.addEventListener('change', (e) => {
            if (e.target.name === 'size') {
                if (e.target.checked) {
                    this.filters.sizes.push(e.target.value);
                } else {
                    this.filters.sizes = this.filters.sizes.filter(s => s !== e.target.value);
                }
                this.applyFilters();
            }
        });
    }

    initializeColorFilter() {
        const colorsContainer = document.getElementById('color-filters');
        
        // Get all unique colors from products in this category
        const allColors = [...new Set(this.products.flatMap(product => product.colors))].sort();
        
        // Color mapping for swatches
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

        colorsContainer.innerHTML = allColors.map(color => `
            <label class="color-filter-option">
                <input type="checkbox" name="color" value="${color}">
                <span class="color-swatch" style="background-color: ${colorMap[color] || '#CCCCCC'}" title="${color}"></span>
                ${color}
            </label>
        `).join('');

        // Add event listeners
        colorsContainer.addEventListener('change', (e) => {
            if (e.target.name === 'color') {
                if (e.target.checked) {
                    this.filters.colors.push(e.target.value);
                } else {
                    this.filters.colors = this.filters.colors.filter(c => c !== e.target.value);
                }
                this.applyFilters();
            }
        });
    }

    initializeSorting() {
        const sortSelect = document.getElementById('sort-by');
        
        sortSelect.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.applyFilters();
        });
    }

    initializeEventListeners() {
        // Clear filters
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Reset filters for no products
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.clearFilters();
        });

        // Load more products
        document.getElementById('load-more-btn')?.addEventListener('click', () => {
            this.loadMoreProducts();
        });

        // Mobile filter toggle
        const filterToggle = document.querySelector('.filter-toggle');
        const filtersSidebar = document.querySelector('.filters-sidebar');

        if (filterToggle && filtersSidebar) {
            filterToggle.addEventListener('click', () => {
                filtersSidebar.classList.toggle('active');
            });
        }
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Price filter
            if (this.filters.priceRange.min !== null && product.price < this.filters.priceRange.min) {
                return false;
            }
            if (this.filters.priceRange.max !== null && product.price > this.filters.priceRange.max) {
                return false;
            }

            // Collection filter
            if (this.filters.collections.length > 0) {
                const collectionMatch = this.filters.collections.some(collection => {
                    if (collection === 'new') return product.collection === 'new';
                    if (collection === 'featured') return product.collection === 'featured';
                    if (collection === 'bestseller') return product.bestseller;
                    return false;
                });
                if (!collectionMatch) return false;
            }

            // Size filter
            if (this.filters.sizes.length > 0) {
                const sizeMatch = this.filters.sizes.some(size => product.sizes.includes(size));
                if (!sizeMatch) return false;
            }

            // Color filter
            if (this.filters.colors.length > 0) {
                const colorMatch = this.filters.colors.some(color => product.colors.includes(color));
                if (!colorMatch) return false;
            }

            return true;
        });

        // Apply sorting
        this.sortProducts();

        // Reset to first page
        this.currentPage = 1;

        // Display products
        this.displayProducts();
        this.updateProductCount();
        this.updateActiveFilters();
        this.toggleLoadMore();
    }

    sortProducts() {
        switch (this.sortBy) {
            case 'newest':
                this.filteredProducts.sort((a, b) => b.id - a.id);
                break;
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'featured':
            default:
                // Keep original order for featured
                break;
        }
    }

    displayProducts() {
        const productsGrid = document.getElementById('category-products-grid');
        const startIndex = 0;
        const endIndex = this.currentPage * this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        if (productsToShow.length === 0) {
            productsGrid.style.display = 'none';
            document.getElementById('no-products').style.display = 'block';
            document.getElementById('load-more').style.display = 'none';
            return;
        }

        productsGrid.style.display = 'grid';
        document.getElementById('no-products').style.display = 'none';

        productsGrid.innerHTML = productsToShow.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                    ${product.collection === 'new' ? '<span class="product-badge new">New</span>' : ''}
                    ${product.bestseller ? '<span class="product-badge bestseller">Bestseller</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">£${product.price}</div>
                    <div class="product-colors">${product.colors.length} colors</div>
                    <button class="btn btn--outline quick-view-btn" data-id="${product.id}">Quick View</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to new product cards
        this.initializeProductCards();
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

    loadMoreProducts() {
        this.currentPage++;
        this.displayProducts();
        this.toggleLoadMore();
    }

    toggleLoadMore() {
        const loadMore = document.getElementById('load-more');
        const totalProducts = this.filteredProducts.length;
        const displayedProducts = Math.min(this.currentPage * this.productsPerPage, totalProducts);

        if (displayedProducts < totalProducts) {
            loadMore.style.display = 'block';
        } else {
            loadMore.style.display = 'none';
        }
    }

    updateProductCount() {
        const countElement = document.getElementById('products-count');
        const total = this.filteredProducts.length;
        const displayed = Math.min(this.currentPage * this.productsPerPage, total);
        
        if (total === 0) {
            countElement.textContent = 'No products found';
        } else if (displayed < total) {
            countElement.textContent = `Showing ${displayed} of ${total} products`;
        } else {
            countElement.textContent = `${total} product${total !== 1 ? 's' : ''}`;
        }
    }

    updateActiveFilters() {
        const activeFiltersElement = document.getElementById('active-filters');
        const activeFilters = [];

        // Price filter
        if (this.filters.priceRange.min !== null || this.filters.priceRange.max !== null) {
            const min = this.filters.priceRange.min || 0;
            const max = this.filters.priceRange.max || '∞';
            activeFilters.push(`Price: £${min} - £${max}`);
        }

        // Collection filters
        if (this.filters.collections.length > 0) {
            const collectionNames = {
                'new': 'New Arrivals',
                'featured': 'Featured',
                'bestseller': 'Bestsellers'
            };
            activeFilters.push(...this.filters.collections.map(c => collectionNames[c]));
        }

        // Size filters
        if (this.filters.sizes.length > 0) {
            activeFilters.push(`Sizes: ${this.filters.sizes.join(', ')}`);
        }

        // Color filters
        if (this.filters.colors.length > 0) {
            activeFilters.push(`Colors: ${this.filters.colors.join(', ')}`);
        }

        if (activeFilters.length > 0) {
            activeFiltersElement.innerHTML = `
                <div class="active-filters-tags">
                    ${activeFilters.map(filter => `
                        <span class="filter-tag">${filter}</span>
                    `).join('')}
                </div>
            `;
        } else {
            activeFiltersElement.innerHTML = '';
        }
    }

    clearFilters() {
        // Reset filter values
        this.filters = {
            priceRange: { min: null, max: null },
            collections: [],
            sizes: [],
            colors: []
        };

        // Reset form inputs
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        
        document.querySelectorAll('input[name="collection"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('input[name="size"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('input[name="color"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reapply filters
        this.applyFilters();
    }
}

// Initialize category page
function initializeCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (!category) {
        window.location.href = 'index.html';
        return;
    }

    // Update page content based on category
    updateCategoryInfo(category);

    // Initialize filter system
    const categoryFilter = new CategoryFilter();
    categoryFilter.initialize(category);
}

function updateCategoryInfo(category) {
    const categoryNames = {
        'women': "Women's Wear",
        'men': "Men's Wear", 
        'children': "Children's Clothing",
        'shoes': "Shoes & Footwear",
        'accessories': "Accessories"
    };

    const categoryDescriptions = {
        'women': "Discover our exquisite collection of women's luxury fashion, from elegant evening wear to sophisticated casual pieces.",
        'men': "Explore our premium men's collection featuring tailored suits, casual wear, and accessories for the modern gentleman.",
        'children': "Adorable and comfortable luxury clothing for children, perfect for special occasions and everyday elegance.",
        'shoes': "Step into style with our curated collection of luxury footwear for every occasion.",
        'accessories': "Complete your look with our selection of premium accessories, from handbags to jewelry."
    };

    const categoryTitle = document.getElementById('category-title');
    const categoryName = document.getElementById('category-name');
    const categoryDescription = document.getElementById('category-description');

    if (categoryTitle && categoryNames[category]) {
        categoryTitle.textContent = categoryNames[category];
        categoryName.textContent = categoryNames[category];
        document.title = `${categoryNames[category]} - Nikky Fashion Palace`;
    }

    if (categoryDescription && categoryDescriptions[category]) {
        categoryDescription.textContent = categoryDescriptions[category];
    }
}

// Add product badge styles to CSS
const categoryStyles = `
    .product-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 0.25rem 0.75rem;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .product-badge.new {
        background: var(--gold);
        color: var(--charcoal);
    }
    
    .product-badge.bestseller {
        background: var(--charcoal);
        color: var(--white);
    }
    
    .product-image {
        position: relative;
    }
    
    .product-colors {
        font-size: 0.9rem;
        color: var(--charcoal);
        opacity: 0.7;
        margin: 0.5rem 0;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = categoryStyles;
document.head.appendChild(styleSheet);