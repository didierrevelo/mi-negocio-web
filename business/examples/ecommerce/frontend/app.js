// Products data
const products = [
    {
        id: 1,
        name: "MacBook Pro 14\"",
        category: "laptops",
        price: 1999,
        oldPrice: 2199,
        image: "💻",
        description: "Chip M3 Pro, 18GB RAM, 512GB SSD",
        featured: true
    },
    {
        id: 2,
        name: "iPhone 15 Pro",
        category: "phones",
        price: 999,
        oldPrice: 1099,
        image: "📱",
        description: "Titanio, 256GB, cámara 48MP",
        featured: true
    },
    {
        id: 3,
        name: "AirPods Pro 2",
        category: "audio",
        price: 249,
        oldPrice: 299,
        image: "🎧",
        description: "Cancelación de ruido activa",
        featured: true
    },
    {
        id: 4,
        name: "PlayStation 5",
        category: "gaming",
        price: 499,
        oldPrice: 549,
        image: "🎮",
        description: "Consola digital, 825GB SSD",
        featured: true
    },
    {
        id: 5,
        name: "Dell XPS 15",
        category: "laptops",
        price: 1599,
        oldPrice: 1799,
        image: "💻",
        description: "Intel i7, 16GB RAM, 1TB SSD",
        featured: false
    },
    {
        id: 6,
        name: "Samsung Galaxy S24",
        category: "phones",
        price: 899,
        oldPrice: 999,
        image: "📱",
        description: "256GB, cámara 200MP, IA",
        featured: false
    },
    {
        id: 7,
        name: "Sony WH-1000XM5",
        category: "audio",
        price: 349,
        oldPrice: 399,
        image: "🎧",
        description: "Audífonos noise cancelling",
        featured: false
    },
    {
        id: 8,
        name: "Xbox Series X",
        category: "gaming",
        price: 499,
        oldPrice: 549,
        image: "🎮",
        description: "1TB SSD, 4K gaming",
        featured: false
    }
];

// Cart state
let cart = [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    setupEventListeners();
});

// Render products
function renderProducts(productsToRender) {
    productsGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">
                    $${product.price}
                    ${product.oldPrice ? `<span class="product-old-price">$${product.oldPrice}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}">Agregar al Carrito</button>
                    <button class="btn btn-outline">❤️</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Add to cart buttons
    productsGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
    });

    // Cart modal
    cartBtn.addEventListener('click', () => {
        cartModal.classList.add('active');
    });

    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    // Filters
    categoryFilter.addEventListener('change', filterProducts);
    sortFilter.addEventListener('change', filterProducts);

    // Search
    searchBtn.addEventListener('click', filterProducts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filterProducts();
    });

    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            categoryFilter.value = category;
            filterProducts();
        });
    });
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    alert('Producto agregado al carrito');
}

// Update cart
function updateCart() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartItems.innerHTML = cart.length === 0 
        ? '<p style="text-align: center; padding: 2rem; color: var(--secondary);">Tu carrito está vacío</p>'
        : cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.image}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">🗑️</button>
            </div>
        `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Filter products
function filterProducts() {
    let filtered = [...products];
    
    // Category filter
    const category = categoryFilter.value;
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    // Search filter
    const search = searchInput.value.toLowerCase();
    if (search) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search) || 
            p.description.toLowerCase().includes(search)
        );
    }
    
    // Sort
    const sort = sortFilter.value;
    switch (sort) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            filtered.reverse();
            break;
    }
    
    renderProducts(filtered);
}
