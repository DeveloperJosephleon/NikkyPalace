// js/cart.js
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.updateCartDisplay();
  }

  loadCart() {
    const savedCart = localStorage.getItem("nikky-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  }

  saveCart() {
    localStorage.setItem("nikky-cart", JSON.stringify(this.items));
    this.updateCartDisplay();
  }

  addItem(product, size, color, quantity = 1) {
    const existingItem = this.items.find(
      (item) =>
        item.id === product.id && item.size === size && item.color === color
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        size: size,
        color: color,
        quantity: quantity,
        image: product.images[0],
      });
    }

    this.saveCart();
    this.showAddToCartMessage(product.name);
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.saveCart();
  }

  updateQuantity(index, quantity) {
    if (quantity <= 0) {
      this.removeItem(index);
    } else {
      this.items[index].quantity = quantity;
      this.saveCart();
    }
  }

  getTotal() {
    return this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  updateCartDisplay() {
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) {
      cartCount.textContent = this.getItemCount();
    }
  }

  showAddToCartMessage(productName) {
    // Create toast notification
    const toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.innerHTML = `
            <span>✓ Added ${productName} to cart</span>
        `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Add to the ShoppingCart class in js/cart.js
  updateQuantity(index, quantity) {
    if (quantity <= 0) {
      this.removeItem(index);
    } else {
      this.items[index].quantity = quantity;
      this.saveCart();
    }
  }

  clear() {
    this.items = [];
    this.saveCart();
  }
}

// Initialize cart
const cart = new ShoppingCart();
