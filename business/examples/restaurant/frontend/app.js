// ============================================
// APLICACIÓN PRINCIPAL - LA CUCINA (FRONTEND)
// ============================================
// Qué: Restaurante italiano - SPA vanilla JavaScript
// Funciones: Menú, carrito, reservaciones, filtros por categoría
// Conecta: Con index.html (DOM), con backend/routes/menu.ts (API)
// Datos: Menú hardcodeado para demo

// ============================================
// DATOS: Menú del restaurante
// ============================================
const menuItems = [
    // ============================================
    // ENTRADAS
    // ============================================
    {
        id: 1,
        name: "Bruschetta Clásica",
        category: "entradas",
        price: 8.99,
        description: "Pan tostado con tomate fresco, albahaca y ajo",
        image: "🍞",
        tags: ["Vegetariano", "Popular"]
    },
    {
        id: 2,
        name: "Carpaccio de Res",
        category: "entradas",
        price: 12.99,
        description: "Laminas de res cruda con rúcula y parmesano",
        image: "🥩",
        tags: ["Sin Gluten"]
    },
    {
        id: 3,
        name: "Calamares Fritos",
        category: "entradas",
        price: 11.99,
        description: "Calamares empanizados con salsa de ajo",
        image: "🦑",
        tags: ["Popular"]
    },
    // ============================================
    // PASTAS
    // ============================================
    {
        id: 4,
        name: "Spaghetti Carbonara",
        category: "pasta",
        price: 16.99,
        description: "Espaguetis con huevo, panceta y parmesano",
        image: "🍝",
        tags: ["Clásico"]
    },
    {
        id: 5,
        name: "Penne Arrabbiata",
        category: "pasta",
        price: 14.99,
        description: "Penne con salsa de tomate picante y albahaca",
        image: "🍝",
        tags: ["Vegetariano", "Picante"]
    },
    {
        id: 6,
        name: "Fettuccine Alfredo",
        category: "pasta",
        price: 15.99,
        description: "Fettuccine con salsa cremosa de parmesano",
        image: "🍝",
        tags: ["Vegetariano"]
    },
    // ============================================
    // PIZZAS
    // ============================================
    {
        id: 7,
        name: "Pizza Margherita",
        category: "pizzas",
        price: 18.99,
        description: "Tomate, mozzarella fresca y albahaca",
        image: "🍕",
        tags: ["Clásico", "Vegetariano"]
    },
    {
        id: 8,
        name: "Pizza Pepperoni",
        category: "pizzas",
        price: 19.99,
        description: "Pepperoni artesanal con mozzarella",
        image: "🍕",
        tags: ["Popular"]
    },
    {
        id: 9,
        name: "Pizza Cuatro Quesos",
        category: "pizzas",
        price: 21.99,
        description: "Mozzarella, gorgonzola, parmesano y fontina",
        image: "🍕",
        tags: ["Vegetariano"]
    },
    // ============================================
    // CARNES
    // ============================================
    {
        id: 10,
        name: "Ossobuco alla Milanese",
        category: "carnes",
        price: 28.99,
        description: "Espinilla de res cocida a fuego lento con gremolata",
        image: "🍖",
        tags: ["Especialidad"]
    },
    {
        id: 11,
        name: "Pollo Parmesano",
        category: "carnes",
        price: 22.99,
        description: "Pechuga empanizada con salsa marinara y queso",
        image: "🍗",
        tags: ["Popular"]
    },
    {
        id: 12,
        name: "Saltimbocca alla Romana",
        category: "carnes",
        price: 26.99,
        description: "Veal con salvia y jamón prosciutto",
        image: "🥩",
        tags: ["Especialidad"]
    },
    // ============================================
    // POSTRES
    // ============================================
    {
        id: 13,
        name: "Tiramisú",
        category: "postres",
        price: 9.99,
        description: "Postre tradicional con café y mascarpone",
        image: "🍰",
        tags: ["Clásico"]
    },
    {
        id: 14,
        name: "Panna Cotta",
        category: "postres",
        price: 8.99,
        description: "Crema italiana con salsa de frutos rojos",
        image: "🍮",
        tags: ["Vegetariano"]
    },
    {
        id: 15,
        name: "Cannoli Siciliani",
        category: "postres",
        price: 7.99,
        description: "Tubos crujientes rellenos de ricotta dulce",
        image: "🥧",
        tags: ["Popular"]
    },
    // ============================================
    // BEBIDAS
    // ============================================
    {
        id: 16,
        name: "Vino Tinto della Casa",
        category: "bebidas",
        price: 8.99,
        description: "Copa de vino tinto italiano selection",
        image: "🍷",
        tags: ["Alcohol"]
    },
    {
        id: 17,
        name: "Limonada Italiana",
        category: "bebidas",
        price: 4.99,
        description: "Limonada fresca con hierbabuena",
        image: "🍋",
        tags: ["Sin Alcohol"]
    },
    {
        id: 18,
        name: "Espresso Doble",
        category: "bebidas",
        price: 3.99,
        description: "Café espresso italiano auténtico",
        image: "☕",
        tags: ["Sin Alcohol"]
    }
];

// ============================================
// ESTADO: Carrito de pedidos
// ============================================
let cart = [];

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const menuGrid = document.getElementById('menuGrid');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const menuCatBtns = document.querySelectorAll('.menu-cat-btn');
const reservationForm = document.getElementById('reservationForm');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    renderMenu('entradas');  // Muestra entradas por defecto
    setupEventListeners();
});

// ============================================
// FUNCIÓN: renderMenu
// ============================================
// Qué: Renderiza platos de una categoría específica
// Recibe: Nombre de la categoría
function renderMenu(category) {
    const filtered = menuItems.filter(item => item.category === category);
    menuGrid.innerHTML = filtered.map(item => `
        <div class="menu-item">
            <div class="menu-item-image">${item.image}</div>
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-name">${item.name}</h3>
                    <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <p class="menu-item-desc">${item.description}</p>
                <div class="menu-item-tags">
                    ${item.tags.map(tag => `<span class="menu-tag">${tag}</span>`).join('')}
                </div>
                <button class="add-to-order" data-id="${item.id}">Agregar al Pedido</button>
            </div>
        </div>
    `).join('');
}

// ============================================
// FUNCIÓN: setupEventListeners
// ============================================
// Qué: Configura todos los event listeners
function setupEventListeners() {
    // Botones de categoría
    menuCatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            menuCatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMenu(btn.dataset.category);
        });
    });

    // Agregar al pedido
    menuGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-order')) {
            const itemId = parseInt(e.target.dataset.id);
            addToCart(itemId);
        }
    });

    // Sidebar del carrito
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
    });

    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });

    // Menú móvil
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    // Formulario de reservación
    reservationForm.addEventListener('submit', handleReservation);
}

// ============================================
// FUNCIÓN: addToCart
// ============================================
// Qué: Agrega un plato al carrito
// Si ya existe, incrementa la cantidad
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const existing = cart.find(c => c.id === itemId);

    if (existing) {
        existing.qty++;  // Incrementa cantidad
    } else {
        cart.push({ ...item, qty: 1 });  // Agrega nuevo
    }

    updateCart();
    alert('¡Agregado al pedido!');
}

// ============================================
// FUNCIÓN: updateCart
// ============================================
// Qué: Actualiza la vista del carrito
function updateCart() {
    // Actualiza contador
    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

    // Renderiza items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
                    <div class="cart-item-qty">
                        <button onclick="updateQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button onclick="removeFromCart(${item.id})">🗑️</button>
            </div>
        `).join('');
    }

    // Actualiza total
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// ============================================
// FUNCIÓN: updateQty
// ============================================
// Qué: Actualiza la cantidad de un item
function updateQty(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(itemId);  // Elimina si cantidad <= 0
        } else {
            updateCart();
        }
    }
}

// ============================================
// FUNCIÓN: removeFromCart
// ============================================
// Qué: Elimina un item del carrito
function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    updateCart();
}

// ============================================
// FUNCIÓN: handleReservation
// ============================================
// Qué: Procesa el formulario de reservación
function handleReservation(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    alert(`¡Reservación confirmada!\n\nNombre: ${data.name}\nFecha: ${data.date}\nHora: ${data.time}\nPersonas: ${data.guests}\n\n¡Te esperamos!`);
    e.target.reset();
}
