// js/products.js
const products = [
  {
    id: 1,
    name: "Elegance Silk Blouse",
    price: 289.99,
    category: "women",
    collection: "new",
    bestseller: true,
    images: [
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583496661160-fb5886a13d77?w=600&h=800&fit=crop",
    ],

    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Champagne", "Navy", "Black"],
    description:
      "Luxurious silk blouse with delicate embroidery. Perfect for sophisticated evening wear or professional settings.",
    material: "100% Mulberry Silk",
  },
  {
    id: 2,
    name: "Classic Wool Coat",
    price: 599.99,
    category: "women",
    collection: "new",
    bestseller: true,
    images: [
      "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal", "Camel", "Navy"],
    description:
      "Timeless wool coat with tailored fit and premium craftsmanship. Designed for London's finest weather.",
    material: "100% Merino Wool",
  },
  {
    id: 3,
    name: "Premium Leather Handbag",
    price: 899.99,
    category: "accessories",
    collection: "new",
    bestseller: false,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop",
    ],

    sizes: ["One Size"],
    colors: ["Black", "Cognac", "Burgundy"],
    description:
      "Handcrafted Italian leather handbag with gold-tone hardware. The epitome of luxury accessories.",
    material: "Full Grain Italian Leather",
  },
  {
    id: 4,
    name: "Designer Suit Set",
    price: 1299.99,
    category: "men",
    collection: "featured",
    bestseller: true,

    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=800&fit=crop",
    ],

    sizes: ["38R", "40R", "42R", "44R", "46R"],
    colors: ["Navy", "Charcoal", "Black"],
    description:
      "Bespoke suit set crafted from the finest materials. Perfect for boardrooms and special occasions.",
    material: "Super 150s Wool",
  },
  {
    id: 5,
    name: "Cashmere Scarf",
    price: 199.99,
    category: "accessories",
    collection: "featured",
    bestseller: false,
    images: [
      "https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1520975867593-6ca840e5b9bb?w=600&h=800&fit=crop",
    ],

    sizes: ["One Size"],
    colors: ["Cream", "Camel", "Grey"],
    description:
      "Luxuriously soft cashmere scarf for ultimate comfort and style.",
    material: "100% Cashmere",
  },
  {
    id: 6,
    name: "Children's Party Dress",
    price: 159.99,
    category: "children",
    collection: "featured",
    bestseller: true,
    images: [
      "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1610030469983-98c0245c7ee7?w=600&h=800&fit=crop",
    ],

    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    colors: ["Ivory", "Pink", "Blue"],
    description:
      "Adorable party dress with delicate lace details for special occasions.",
    material: "Organic Cotton & Lace",
  },
  {
    id: 7,
    name: "Designer Heels",
    price: 459.99,
    category: "shoes",
    collection: "new",
    bestseller: false,
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1588361861040-259b70c9a743?w=600&h=800&fit=crop",
    ],

    sizes: ["EU36", "EU37", "EU38", "EU39", "EU40"],
    colors: ["Black", "Nude", "Burgundy"],
    description:
      "Elegant heels with comfortable cushioning and premium leather finish.",
    material: "Calf Leather",
  },
  {
    id: 8,
    name: "Casual Linen Shirt",
    price: 189.99,
    category: "men",
    collection: "featured",
    bestseller: true,
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1618354691797-269e1adac82d?w=600&h=800&fit=crop",
    ],

    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Blue", "Beige"],
    description:
      "Breathable linen shirt perfect for summer occasions and casual elegance.",
    material: "100% Linen",
  },
];

// Product-related functions
function getProductsByCategory(category) {
  return products.filter((product) => product.category === category);
}

function getNewArrivals() {
  return products.filter((product) => product.collection === "new");
}

function getBestSellers() {
  return products.filter((product) => product.bestseller);
}

function searchProducts(query) {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
  );
}

function getProductById(id) {
  return products.find((product) => product.id === parseInt(id));
}
