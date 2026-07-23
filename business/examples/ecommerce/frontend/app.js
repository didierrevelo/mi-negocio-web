// ============================================
// APLICACIÓN PRINCIPAL - TECHSTORE (FRONTEND)
// ============================================
// Qué: Tienda de tecnología - SPA vanilla JavaScript
// Funciones: Renderizar productos, carrito, filtros, búsqueda
// Conecta: Con index.html (DOM), con backend/routes/products.ts (API)
// Datos: Productos hardcodeados para demo

// ============================================
// DATOS: Productos de la tienda
// ============================================
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

// ============================================
// ESTADO: Carrito de compras
// ============================================
let cart = [];

// ============================================
// ELEMENTOS DEL DOM
// ============================================
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

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    setupEventListeners();
});

// ============================================
// FUNCIÓN: renderProducts
// ============================================
// Qué: Renderiza la lista de productos en el grid
// Recibe: Array de productos
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

// ============================================
// FUNCIÓN: setupEventListeners
// ============================================
// Qué: Configura todos los event listeners
function setupEventListeners() {
    // Botones de agregar al carrito
    productsGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
    });

    // Modal del carrito
    cartBtn.addEventListener('click', () => {
        cartModal.classList.add('active');
    });

    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    // Filtros
    categoryFilter.addEventListener('change', filterProducts);
    sortFilter.addEventListener('change', filterProducts);

    // Búsqueda
    searchBtn.addEventListener('click', filterProducts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filterProducts();
    });

    // Tarjetas de categoría
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            categoryFilter.value = category;
            filterProducts();
        });
    });
}

// ============================================
// FUNCIÓN: addToCart
// ============================================
// Qué: Agrega un producto al carrito
// Si ya existe, incrementa la cantidad
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;  // Incrementa cantidad
    } else {
        cart.push({ ...product, quantity: 1 });  // Agrega nuevo
    }

    updateCart();
    alert('Producto agregado al carrito');
}

// ============================================
// FUNCIÓN: updateCart
// ============================================
// Qué: Actualiza la vista del carrito
function updateCart() {
    // Actualiza contador
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Renderiza items
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

    // Actualiza total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// ============================================
// FUNCIÓN: updateQuantity
// ============================================
// Qué: Actualiza la cantidad de un item
// change: +1 o -1
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);  // Elimina si cantidad <= 0
        } else {
            updateCart();
        }
    }
}

// ============================================
// FUNCIÓN: removeFromCart
// ============================================
// Qué: Elimina un item del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// ============================================
// FUNCIÓN: filterProducts
// ============================================
// Qué: Filtra y ordena productos según selección del usuario
function filterProducts() {
    let filtered = [...products];
    
    // Filtro por categoría
    const category = categoryFilter.value;
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    // Filtro por búsqueda
    const search = searchInput.value.toLowerCase();
    if (search) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search) || 
            p.description.toLowerCase().includes(search)
        );
    }
    
    // Ordenamiento
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
