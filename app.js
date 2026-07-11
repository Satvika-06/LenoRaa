// ==========================================================================
// LENO-RAA COLD PROCESS SOAP - E-COMMERCE APPLICATION ENGINE
// ==========================================================================

// 1. PRODUCT DATA SOURCE
const PRODUCTS = [
    {
        id: 1,
        name: "Aloe Vera Soap",
        price: 90,
        category: "dry",
        description: "Enriched with 100% pure organic aloe juice and fresh eucalyptus. Instantly calms redness and provides deep soothing hydration for dry skin.",
        image: "assets/aloevera.jpeg",
        tags: ["Soothing", "Dermatologist Approved"],
        ingredients: ["Organic Aloe Vera", "Eucalyptus Oil", "Olive Oil", "Coconut Oil", "Palm Oil", "Sweet Almond Oil", "Sesame Oil", "Cocoa Butter", "Castor Oil"]
    },
    {
        id: 2,
        name: "Ayurvedic Herbal Soap",
        price: 90,
        category: "normal",
        description: "Infused with neem, tulsi, and organic turmeric. A powerful antibacterial remedy designed to detoxify pores and keep skin naturally clear.",
        image: "assets/ayurvedic herbal.jpeg",
        tags: ["Antibacterial", "Herbal Cure"],
        ingredients: ["Mustha","triphala", "Madanaphala", "Karanja","aragwada","kutaja", "sapthaparna","kustha","priyangu", "daruharidra","Coconut oil ","Palm oil","Olive oil ","Sesame oil","Neem oil","Castor oil"]
    },
    {
        id: 3,
        name: "Goat Milk Soap",
        price: 90,
        category: "dry",
        description: "Dermatologist recommended for eczema and dry skin. Made with fresh farm goat milk and sweet honey to restore your skin's natural pH barrier.",
        image: "assets/goatmilk.jpeg",
        tags: ["Rich Moisture", "Sensitive Skin"],
        ingredients: ["Fresh Goat Milk", "Olive Oil", "Coconut Oil", "Palm Oil", "Sweet Almond Oil", "Sesame Oil", "Cocoa Butter", "Castor Oil"]
    },
    {
        id: 4,
        name: "Lavender Soap",
        price: 90,
        category: "dry",
        description: "Calming Bulgarian lavender essential oils blended with extra virgin olive oil. Relax your senses and soothe skin irritation before sleep.",
        image: "assets/lavender.jpeg",
        tags: ["Calming Scent", "Relaxing"],
        ingredients: ["Bulgarian Lavender Oil", "Lavender Buds", "Olive Oil", "Coconut Oil", "Palm Oil", "Sweet Almond Oil", "Sesame Oil", "Cocoa Butter", "Castor Oil"]
    },
    {
        id: 5,
        name: "Charcoal Soap",
        price: 90,
        category: "oily",
        description: "Crafted with activated bamboo charcoal and natural tea tree oil to deeply cleanse pores, remove excess oil, detoxify impurities, and help prevent acne.",
        image: "assets/charcoal.jpeg",
        tags: ["Deep Cleansing", "Oil Control"],
        ingredients: ["Activated Charcoal", "Tea Tree Oil", "Coconut Oil", "Palm Oil", "Rice Bran Oil", "Sunflower Oil", "Mustard Oil", "Castor Oil"]
    },
    {
        id: 6,
        name: "Manjichandan Soap",
        price: 100,
        category: "oily",
        description: "Ayurvedic Manjistha bark powder extract to purify blood flow beneath the skin, reducing pigmentation and boosting natural glow.",
        image: "assets/manjichandan.jpeg",
        tags: ["Ayurvedic Glow", "Detoxifying"],
        ingredients: ["Manjistha Bark Powder", "Mysore Sandalwood Extract", "Coconut Oil", "Palm Oil", "Rice Bran Oil", "Sunflower Oil", "Mustard Oil", "Castor Oil"]
    },
    {
        id: 7,
        name: "Menthol Soap",
        price: 90,
        category: "oily",
        description: "Pure cooling crystal menthol combined with cooling peppermint essential oil. Perfect for an ice-cold, refreshing morning shower.",
        image: "assets/menthol.webp",
        tags: ["Ice Cooling", "Sport Therapy"],
        ingredients: ["Menthol Crystals", "Peppermint Oil", "Coconut Oil", "Palm Oil", "Rice Bran Oil", "Sunflower Oil", "Mustard Oil", "Castor Oil"]
    },
    {
        id: 8,
        name: "Orange Soap",
        price: 90,
        category: "oily",
        description: "Loaded with sweet orange essential oils and botanical vitamin C. Boosts skin elasticity, fights free radicals, and rejuvenates senses.",
        image: "assets/orange.jpeg",
        tags: ["Vitamin C", "Energizing"],
        ingredients: ["Sweet Orange Oil", "Vitamin C (L-Ascorbic Acid)", "Coconut Oil", "Palm Oil", "Rice Bran Oil", "Sunflower Oil", "Mustard Oil", "Castor Oil"]
    },
    {
    id: 9,
    name: "Golden Nalpa Glow",
    price: 100,
    category: "dry",
    description: "A luxurious handcrafted cold process soap infused with traditional Nalpamaradi Tailam and nourishing botanical oils. Specially formulated for dry skin, it deeply moisturizes, enhances natural radiance, and promotes a soft, healthy-looking complexion with every wash.",
    image: "assets/nalpamaradhi.jpeg",
    tags: ["Skin Brightening", "Deep Moisture", "Ayurvedic", "Handcrafted"],
    ingredients: [ "Nalpamaradi Tailam", "Olive Oil", "Coconut Oil", "Palm Oil", "Sweet Almond Oil","Sesame Oil", "Cocoa Butter","Castor Oil" ]
},
    {
        id: 10,
        name: "Tomato Soap",
        price: 90,
        category: "normal",
        description: "Rich in tomato lycopene and gentle organic fruit acids. Helps absorb excess oil secretion and gently exfoliates dead surface cells.",
        image: "assets/tomato.jpeg",
        tags: ["Oil Control", "Exfoliating"],
        ingredients: ["Tomato Lycopene Extract", "Fruit Acids", "Coconut Oil", "Palm Oil", "Rice Bran Oil", "Sunflower Oil", "Sweet Almond Oil", "Castor Oil"]
    },
    {
        id: 11,
        name: "Coffeelatte Soap",
        price: 120,
        category: "normal",
        description: "Ground arabica coffee beans provide dual action: scrub away dead skin flakes while natural caffeine tightens skin texture.",
        image: "assets/coffee.jpeg",
        tags: ["Cellulite Scrub", "Exfoliator"],
        ingredients: ["Ground Coffee Beans", "Natural Caffeine", "Coconut Oil", "Palm Oil", "Castor Oil"]
    },
    {
        id: 12,
        name: "Butter with Milk",
        price: 120,
        category: "normal",
        description: "Crafted with 50% organic shea and cocoa butter. Contains zero fragrances or allergens. The absolute gentlest soap for soft baby skin.",
        image: "assets/buttersoap.jpeg",
        tags: ["Baby Safe", "Fragrance Free"],
        ingredients: ["Organic Shea Butter", "Cocoa Butter", "Coconut Oil", "Palm Oil", "Rice Bran Oil", "Sunflower Oil", "Sweet Almond Oil", "Castor Oil"]
    },
    {
    id: 13,
    name: "Golden Oats",
    price: 120,
    category: "ultra sensitive",
    description: "A soothing handcrafted soap enriched with finely ground oats and pure honey to gently cleanse, calm, and nourish delicate skin. Perfect for babies and anyone with ultra-sensitive skin, leaving it soft, hydrated, and naturally healthy after every wash.",
    image: "assets/Golden Oats.jpeg",
    tags: ["Ultra Gentle", "Baby Safe", "Sensitive Skin", "Honey & Oats"],
    ingredients: [ "Oats", "Raw Honey", "Coconut Oil", "Olive Oil", "Castor Oil", "Cocoa Butter" ]
    },
    {
    id: 14,
    name: "Rose Blossom Soap",
    price: 90,
    category: "all",
    description: "A handcrafted cold process soap enriched with pure rose petal powder and nourishing botanical oils. Gently cleanses, hydrates, and refreshes the skin while leaving a soft floral fragrance and a naturally radiant glow. Suitable for all skin types.",
    image: "assets/rose.jpeg",
    tags: ["Floral Care", "Skin Glow", "Handcrafted", "Natural"],
    ingredients: ["Rose Petal Powder", "Coconut Oil","Palm Oil","Rice Bran Oil","Sunflower Oil", "Mustard Oil", "Castor Oil"]
    },
    {
    id: 15,
    name: "Pure Aloe Vera Gel",
    price: 80,
    category: "all",
    description: "A soothing, lightweight aloe vera gel made with pure aloe extract to hydrate, calm, and refresh the skin. Helps reduce dryness, sun irritation, and redness while providing long-lasting moisture. Suitable for both skin and hair care.",
    image: "assets/aloeveragel.jpeg",
    tags: ["100% Natural", "Hydrating", "Soothing", "Multi-Purpose"],
    ingredients: ["Pure Aloe Vera Extract","Vitamin E","Glycerin","Purified Water", "Natural Preservative"]

}
];

// 2. STATE OBJECTS
let cart = JSON.parse(localStorage.getItem("lenora_cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("lenora_wishlist")) || [];
let currentFilter = "all";
let searchFilter = "";
let currentUser = JSON.parse(localStorage.getItem("lenora_user")) || null;
let pendingAuthAction = null;

// Detailed dermatologist scientific formulations database
const SKIN_TYPE_FORMULATIONS = {
    "Oily": {
        displayName: "Oily / Acne Prone",
        flavours: ["Charcoal", "Orange", "Manjistha with sandalwood", "Rose", "Menthol"],
        oils: [
            { name: "Coconut Oil (92 deg)", percentage: 28, weight: "198.8g" },
            { name: "Palm Oil", percentage: 28, weight: "198.8g" },
            { name: "Rice Bran Oil (refined)", percentage: 18, weight: "127.8g" },
            { name: "Sunflower Oil", percentage: 14, weight: "99.4g" },
            { name: "Mustard Oil (kachi ghani)", percentage: 10, weight: "71.0g" },
            { name: "Castor Oil", percentage: 2, weight: "14.2g" }
        ],
        qualities: [
            { name: "Hardness", value: 43, range: "29 - 54" },
            { name: "Cleansing", value: 19, range: "12 - 22" },
            { name: "Conditioning", value: 48, range: "44 - 69" },
            { name: "Bubbly", value: 21, range: "14 - 46" },
            { name: "Creamy", value: 25, range: "16 - 48" },
            { name: "Iodine", value: 64, range: "41 - 70" },
            { name: "INS", value: 146, range: "136 - 165" }
        ],
        satUnsat: "47 : 53",
        insValue: 146,
        totalWeight: "1031.9g",
        oilWeight: "710g",
        waterWeight: "203.78g",
        lyeWeight: "100.37g"
    },
    "Dry": {
        displayName: "Dry / Dehydrated",
        flavours: ["Goatmilk", "Aloevera", "Lavender", "Nalapamaradi"],
        oils: [
            { name: "Olive Oil", percentage: 28, weight: "210.0g" },
            { name: "Coconut Oil (92 deg)", percentage: 24, weight: "180.0g" },
            { name: "Palm Oil", percentage: 24, weight: "180.0g" },
            { name: "Sweet Almond Oil", percentage: 8, weight: "60.0g" },
            { name: "Sesame Oil", percentage: 6, weight: "45.0g" },
            { name: "Cocoa Butter", percentage: 5, weight: "37.5g" },
            { name: "Castor Oil", percentage: 5, weight: "37.5g" }
        ],
        qualities: [
            { name: "Hardness", value: 40, range: "29 - 54" },
            { name: "Cleansing", value: 16, range: "12 - 22" },
            { name: "Conditioning", value: 56, range: "44 - 69" },
            { name: "Bubbly", value: 21, range: "14 - 46" },
            { name: "Creamy", value: 28, range: "16 - 48" },
            { name: "Iodine", value: 58, range: "41 - 70" },
            { name: "INS", value: 151, range: "136 - 165" }
        ],
        satUnsat: "42 : 58",
        insValue: 151,
        totalWeight: "1089.3g",
        oilWeight: "750g",
        waterWeight: "214.77g",
        lyeWeight: "105.78g"
    },
    "Normal/Combination/Sensitive": {
        displayName: "Normal/Combination/Sensitive",
        flavours: ["Tomato", "Liquorice", "Ayurvedic herbal", "Haridra+Neem"],
        oils: [
            { name: "Coconut Oil (92 deg)", percentage: 28, weight: "210.0g" },
            { name: "Palm Oil", percentage: 25, weight: "187.5g" },
            { name: "Rice Bran Oil (refined)", percentage: 20, weight: "150.0g" },
            { name: "Sunflower Oil", percentage: 16, weight: "120.0g" },
            { name: "Sweet Almond Oil", percentage: 6, weight: "45.0g" },
            { name: "Castor Oil", percentage: 5, weight: "37.5g" }
        ],
        qualities: [
            { name: "Hardness", value: 42, range: "29 - 54" },
            { name: "Cleansing", value: 19, range: "12 - 22" },
            { name: "Conditioning", value: 54, range: "44 - 69" },
            { name: "Bubbly", value: 24, range: "14 - 46" },
            { name: "Creamy", value: 27, range: "16 - 48" },
            { name: "Iodine", value: 66, range: "41 - 70" },
            { name: "INS", value: 147, range: "136 - 165" }
        ],
        satUnsat: "44 : 56",
        insValue: 147,
        totalWeight: "1092.11g",
        oilWeight: "750g",
        waterWeight: "216.65g",
        lyeWeight: "106.71g"
    }
};

let customSoapState = {
    skinType: 'Oily',
    ingredients: 'Charcoal',
    fragrance: 'Lavender Essential Oil',
    color: 'Creamy Beige',
    shape: 'Classic Rectangle',
    packaging: 'Eco-friendly Kraft Paper wrapper'
};

// 3. PAGE INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    // Render products
    renderProducts();

    // Setup Event Listeners
    setupEventListeners();

    // Start background animations
    initLeafAnimation();

    // Update badges
    updateBadges();

    // Initialize customizer dynamic contents
    renderCustomizerFlavours();
    renderScientificFormulation();
    updateCustomizerPreview();

    // Set filter from URL/external triggers if any
    window.setFilter = (category) => {
        const tab = document.querySelector(`.filter-tab[data-filter="${category}"]`);
        if (tab) tab.click();
    };

    // Initialize Auth state
    updateAuthUI();
    setupAuthEventListeners();

    // Initialize Lucide Icons
    lucide.createIcons();
});

// ==========================================================================
// E-COMMERCE PRODUCTS GRID & FILTER ENGINE
// ==========================================================================

function renderProducts() {
    const container = document.getElementById("products-grid-container");
    const emptyState = document.getElementById("products-empty-state");
    if (!container) return;

    // Clear contents
    container.innerHTML = "";

    // Apply filters
    const filtered = PRODUCTS.filter(product => {
        const matchesCategory = currentFilter === "all" || product.category === currentFilter;
        const matchesSearch = product.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                              product.description.toLowerCase().includes(searchFilter.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        container.classList.add("hidden");
        emptyState.classList.remove("hidden");
        return;
    }

    container.classList.remove("hidden");
    emptyState.classList.add("hidden");

    filtered.forEach(product => {
        const isWishlisted = wishlist.includes(product.id);
        const card = document.createElement("div");
        card.className = `product-card card-theme-${product.category} animate-fade-in`;
        card.setAttribute("data-id", product.id);

        // Skin label mapping
        let skinLabel = "Normal / Sensitive";
        if (product.category === "oily") skinLabel = "Oily Skin";
        if (product.category === "dry") skinLabel = "Dry Skin";

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${product.image}" alt="${product.name}" class="card-img" loading="lazy">
                <div class="card-badges">
                    <span class="card-badge badge-handmade">100% Handmade</span>
                    <span class="card-badge badge-skin-${product.category}">${skinLabel}</span>
                </div>
                <div class="card-actions">
                    <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" aria-label="Add to Wishlist">
                        <i data-lucide="heart"></i>
                    </button>
                </div>
            </div>
            <div class="card-info">
                <div class="card-rating">
                    <i data-lucide="star"></i>
                    <i data-lucide="star"></i>
                    <i data-lucide="star"></i>
                    <i data-lucide="star"></i>
                    <i data-lucide="star"></i>
                </div>
                <h3 class="card-name">${product.name}</h3>
                <p class="card-desc">${product.description}</p>
                <div class="card-ingredients-box">
                    <span class="ing-label">Active Ingredients:</span>
                    <div class="ing-pills-list">
                        ${product.ingredients.map(ing => `<span class="ing-pill-tag">${ing}</span>`).join('')}
                    </div>
                </div>
                <div class="card-purchase">
                    <span class="card-price">₹${product.price}</span>
                    <button class="card-buy-btn" data-id="${product.id}">Buy Now</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Reinitialize icons in newly added cards
    lucide.createIcons();
}

function setupEventListeners() {
    // Navbar Scroll shadow
    window.addEventListener("scroll", () => {
        const nav = document.getElementById("main-nav");
        if (window.scrollY > 50) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }

        // Active link highlighting on scroll
        const sections = document.querySelectorAll("section[id]");
        let scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute("id");
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-links a[href*=${sectionId}]`)?.classList.add("active");
            } else {
                document.querySelector(`.nav-links a[href*=${sectionId}]`)?.classList.remove("active");
            }
        });
    });

    // Mobile Hamburger Toggle
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    const menuIcon = document.getElementById("menu-icon");
    
    mobileMenuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        const isOpen = navMenu.classList.contains("active");
        menuIcon.setAttribute("data-lucide", isOpen ? "x" : "menu");
        lucide.createIcons();
    });

    // Close Mobile Menu on Link Click
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            menuIcon.setAttribute("data-lucide", "menu");
            lucide.createIcons();
        });
    });

    // Live Searching
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    
    searchInput.addEventListener("keyup", (e) => {
        searchFilter = e.target.value;
        renderProducts();
    });

    // Clear search button / Empty state reset
    document.getElementById("clear-filters-btn").addEventListener("click", () => {
        searchInput.value = "";
        searchFilter = "";
        currentFilter = "all";
        
        document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
        document.querySelector('.filter-tab[data-filter="all"]').classList.add("active");
        
        renderProducts();
    });

    // Category Tabs Filter
    const filterTabs = document.getElementById("category-tabs");
    filterTabs.addEventListener("click", (e) => {
        if (e.target.classList.contains("filter-tab")) {
            document.querySelectorAll(".filter-tab").forEach(tab => tab.classList.remove("active"));
            e.target.classList.add("active");
            
            currentFilter = e.target.getAttribute("data-filter");
            renderProducts();
        }
    });

    // Products Click Delegation (Wishlist heart & Buy Now)
    const gridContainer = document.getElementById("products-grid-container");
    gridContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".wishlist-btn");
        const buyBtn = e.target.closest(".card-buy-btn");

        if (btn) {
            const id = parseInt(btn.getAttribute("data-id"));
            toggleWishlist(id);
        } else if (buyBtn) {
            const id = parseInt(buyBtn.getAttribute("data-id"));
            addToCart(id, 1);
            openDrawer("cart");
        }
    });

    // Wishlist Drawer Toggles
    document.getElementById("wishlist-toggle-btn").addEventListener("click", () => openDrawer("wishlist"));
    document.getElementById("wishlist-close-btn").addEventListener("click", () => closeDrawer("wishlist"));
    document.getElementById("wishlist-overlay").addEventListener("click", () => closeDrawer("wishlist"));

    // Cart Drawer Toggles
    document.getElementById("cart-toggle-btn").addEventListener("click", () => openDrawer("cart"));
    document.getElementById("cart-close-btn").addEventListener("click", () => closeDrawer("cart"));
    document.getElementById("cart-overlay").addEventListener("click", () => closeDrawer("cart"));

    // Quantity click inside Cart Drawer
    const cartItemsContainer = document.getElementById("cart-items-container");
    cartItemsContainer.addEventListener("click", (e) => {
        const plusBtn = e.target.closest(".qty-plus");
        const minusBtn = e.target.closest(".qty-minus");
        const removeBtn = e.target.closest(".remove-item-btn");

        if (plusBtn || minusBtn) {
            const id = parseInt(plusBtn ? plusBtn.getAttribute("data-id") : minusBtn.getAttribute("data-id"));
            const isCustom = plusBtn ? plusBtn.getAttribute("data-custom") === "true" : minusBtn.getAttribute("data-custom") === "true";
            
            // For custom soaps we match by unique customized description hash or custom field
            const index = cart.findIndex(item => item.id === id && item.isCustom === isCustom);
            if (index > -1) {
                if (plusBtn) {
                    cart[index].quantity += 1;
                } else {
                    cart[index].quantity -= 1;
                    if (cart[index].quantity <= 0) cart.splice(index, 1);
                }
                saveCart();
                renderCart();
            }
        } else if (removeBtn) {
            const id = parseInt(removeBtn.getAttribute("data-id"));
            const isCustom = removeBtn.getAttribute("data-custom") === "true";
            const index = cart.findIndex(item => item.id === id && item.isCustom === isCustom);
            
            if (index > -1) {
                cart.splice(index, 1);
                saveCart();
                renderCart();
            }
        }
    });

    // Wishlist drawer action (Add all to Cart)
    document.getElementById("wishlist-add-all-btn").addEventListener("click", () => {
        wishlist.forEach(id => {
            const inCartIndex = cart.findIndex(item => item.id === id && !item.isCustom);
            if (inCartIndex > -1) {
                cart[inCartIndex].quantity += 1;
            } else {
                cart.push({ id, quantity: 1, isCustom: false });
            }
        });
        wishlist = [];
        saveWishlist();
        saveCart();
        renderWishlist();
        renderCart();
        closeDrawer("wishlist");
        openDrawer("cart");
    });

    // Wishlist drawer items delegation (Remove or add single)
    const wishlistItemsContainer = document.getElementById("wishlist-items-container");
    wishlistItemsContainer.addEventListener("click", (e) => {
        const removeBtn = e.target.closest(".remove-item-btn");
        const addBtn = e.target.closest(".add-to-cart-drawer-btn");

        if (removeBtn) {
            const id = parseInt(removeBtn.getAttribute("data-id"));
            toggleWishlist(id);
        } else if (addBtn) {
            const id = parseInt(addBtn.getAttribute("data-id"));
            addToCart(id, 1);
            toggleWishlist(id); // remove from wishlist once added
        }
    });

    // CUSTOMIZER SELECTIONS
    const customizerSteps = document.querySelector(".customizer-steps");
    customizerSteps.addEventListener("click", (e) => {
        const btn = e.target.closest(".opt-btn");
        const dot = e.target.closest(".color-dot");

        if (btn) {
            const grid = btn.closest(".option-grid");
            const group = grid.getAttribute("data-group");
            const val = btn.getAttribute("data-value");
            
            // Reset active within group
            grid.querySelectorAll(".opt-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Update state
            customSoapState[group] = val;

            if (group === "skinType") {
                // If skin type changed, load flavours for that skin type and set first flavour as default
                const defaultFlavour = SKIN_TYPE_FORMULATIONS[val].flavours[0];
                customSoapState.ingredients = defaultFlavour;
                renderCustomizerFlavours();
                renderScientificFormulation();
            }

            updateCustomizerPreview();
        } else if (dot) {
            const group = dot.closest(".color-options").getAttribute("data-group");
            const val = dot.getAttribute("data-value");

            dot.closest(".color-options").querySelectorAll(".color-dot").forEach(d => d.classList.remove("active"));
            dot.classList.add("active");

            customSoapState[group] = val;
            updateCustomizerPreview();
        }
    });

    // Request Custom Soap (Adds soap batch to cart!)
    document.getElementById("request-custom-soap-btn").addEventListener("click", () => {
        const triggerAction = () => {
            // Prepare customized object details
            const customDetails = { ...customSoapState };
            const descText = `${customDetails.ingredients} for ${customDetails.skinType} skin, aroma: ${customDetails.fragrance}, tint: ${customDetails.color}, shape: ${customDetails.shape}, wrapping: ${customDetails.packaging}`;
            
            // Add special custom item batch to cart
            const customItemId = Date.now(); // unique timestamp identifier
            cart.push({
                id: customItemId,
                quantity: 1, // 1 batch of 5 soaps
                isCustom: true,
                customDetails: customDetails,
                price: 750, // ₹150 * 5 bars
                name: "Custom Doctor-Formulated Batch (5 Bars)",
                description: descText,
                image: "assets/handmade_process.jpg"
            });

            saveCart();
            renderCart();
            openDrawer("cart");

            // Custom notification trigger
            showToast("Custom soap batch added to your shopping cart!");
        };

        if (!currentUser) {
            pendingAuthAction = triggerAction;
            openLoginModal();
            showToast("Please sign in to proceed with soap customization.");
            return;
        }

        triggerAction();
    });

    // FAQ Accordion
    document.querySelectorAll(".faq-question").forEach(q => {
        q.addEventListener("click", () => {
            const item = q.parentNode;
            const isActive = item.classList.contains("active");
            
            // Close all
            document.querySelectorAll(".faq-item").forEach(i => {
                i.classList.remove("active");
                i.querySelector(".faq-answer").style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add("active");
                const answer = item.querySelector(".faq-answer");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // Contact Form Submission
    const contactForm = document.getElementById("contact-form");
    const contactSuccess = document.getElementById("contact-success");
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // Simulate sending details
        contactForm.classList.add("hidden");
        contactSuccess.classList.remove("hidden");
        setTimeout(() => {
            contactForm.reset();
            contactForm.classList.remove("hidden");
            contactSuccess.classList.add("hidden");
        }, 5000);
    });

    // Newsletter Form Submission
    const newsForm = document.getElementById("newsletter-form");
    const newsSuccess = document.getElementById("newsletter-success-msg");
    newsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        newsForm.classList.add("hidden");
        newsSuccess.classList.remove("hidden");
        setTimeout(() => {
            newsForm.reset();
            newsForm.classList.remove("hidden");
            newsSuccess.classList.add("hidden");
        }, 4000);
    });

    // TESTIMONIALS SLIDER NAVIGATION
    const dots = document.querySelectorAll(".carousel-dots .dot-btn");
    const slider = document.getElementById("reviews-slider");
    dots.forEach(dot => {
        dot.addEventListener("click", () => {
            dots.forEach(d => d.classList.remove("active"));
            dot.classList.add("active");
            const idx = parseInt(dot.getAttribute("data-index"));
            slider.style.transform = `translateX(-${idx * 100}%)`;
        });
    });

    // CHECKOUT WIZARD FLOW CONTROL
    const checkoutModal = document.getElementById("checkout-modal");
    const checkoutBtn = document.getElementById("checkout-btn");
    const checkoutClose = document.getElementById("checkout-close-btn");

    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            showToast("Your shopping cart is empty!");
            return;
        }
        if (!currentUser) {
            pendingAuthAction = () => {
                closeDrawer("cart");
                openCheckout();
            };
            openLoginModal();
            showToast("Please sign in to proceed to checkout.");
            return;
        }
        closeDrawer("cart");
        openCheckout();
    });

    checkoutClose.addEventListener("click", closeCheckout);

    // Shipping info submit -> go to payment
    const shippingForm = document.getElementById("shipping-form");
    shippingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        goToCheckoutStep(2);
    });

    // Back to Shipping from Payment
    document.getElementById("checkout-back-1").addEventListener("click", () => {
        goToCheckoutStep(1);
    });

    // Toggle Credit Card fields based on radio selection
    const paymentOptionsContainer = document.querySelector(".payment-options");
    paymentOptionsContainer.addEventListener("change", (e) => {
        const optionCards = document.querySelectorAll(".payment-option-card");
        optionCards.forEach(c => c.classList.remove("active"));
        
        const selectedCard = e.target.closest(".payment-option-card");
        selectedCard.classList.add("active");

        const cardDetails = document.getElementById("payment-details-form");
        if (e.target.value === "card") {
            cardDetails.classList.remove("hidden");
            cardDetails.querySelectorAll("input").forEach(i => i.required = true);
        } else {
            cardDetails.classList.add("hidden");
            cardDetails.querySelectorAll("input").forEach(i => {
                i.required = false;
                i.value = "";
            });
        }
        calculateCheckoutGrandTotal();
    });

    // Complete Purchase -> Show Success screen
    document.getElementById("place-order-btn").addEventListener("click", () => {
        // Validate credit card inputs if visible
        const cardMethod = document.querySelector('input[name="payment-method"]:checked').value === "card";
        if (cardMethod) {
            const cardNum = document.getElementById("card-num").value;
            const cardExp = document.getElementById("card-exp").value;
            const cardCvv = document.getElementById("card-cvv").value;
            if (!cardNum || !cardExp || !cardCvv) {
                showToast("Please fill in credit card details.");
                return;
            }
        }

        // Generate random order tracking ID
        const orderIdVal = "#LR-" + Math.floor(100000 + Math.random() * 900000);
        document.getElementById("success-order-id").textContent = orderIdVal;

        // Clear shopping cart state
        cart = [];
        saveCart();
        renderCart();

        // Switch to Step 3
        goToCheckoutStep(3);
    });

    // Finish checkout
    document.getElementById("checkout-finish-btn").addEventListener("click", () => {
        closeCheckout();
        // Reset checkout panels back to step 1
        goToCheckoutStep(1);
        document.getElementById("shipping-form").reset();
    });
}

// ==========================================================================
// CART & WISHLIST ENGINE FUNCTIONS
// ==========================================================================

function updateBadges() {
    document.getElementById("wishlist-badge").textContent = wishlist.length;
    
    // Calculate total quantity in cart
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-badge").textContent = totalQty;
}

function saveCart() {
    localStorage.setItem("lenora_cart", JSON.stringify(cart));
    updateBadges();
}

function saveWishlist() {
    localStorage.setItem("lenora_wishlist", JSON.stringify(wishlist));
    updateBadges();
}

function toggleWishlist(productId) {
    const idx = wishlist.indexOf(productId);
    const product = PRODUCTS.find(p => p.id === productId);

    if (idx > -1) {
        wishlist.splice(idx, 1);
        showToast(`${product.name} removed from wishlist.`);
    } else {
        wishlist.push(productId);
        showToast(`${product.name} added to wishlist.`);
    }

    saveWishlist();
    renderWishlist();
    
    // Rerender products cards to toggle heart visual activation
    renderProducts();
}

function addToCart(productId, quantity = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const inCartIndex = cart.findIndex(item => item.id === productId && !item.isCustom);
    if (inCartIndex > -1) {
        cart[inCartIndex].quantity += quantity;
    } else {
        cart.push({ id: productId, quantity: quantity, isCustom: false });
    }

    saveCart();
    renderCart();
    showToast(`${product.name} added to cart.`);
}

function renderWishlist() {
    const container = document.getElementById("wishlist-items-container");
    const footer = document.getElementById("wishlist-footer");
    if (!container) return;

    container.innerHTML = "";

    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="drawer-empty">
                <i data-lucide="heart"></i>
                <h4>Your Wishlist is Empty</h4>
                <p>Browse our curated selection and tap the heart icon to save soaps you love here.</p>
                <a href="#shop" class="btn btn-primary" onclick="closeDrawer('wishlist')">Explore Soaps</a>
            </div>
        `;
        footer.classList.add("hidden");
        lucide.createIcons();
        return;
    }

    footer.classList.remove("hidden");

    wishlist.forEach(id => {
        const item = PRODUCTS.find(p => p.id === id);
        if (!item) return;

        const row = document.createElement("div");
        row.className = "drawer-item";
        row.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="drawer-item-img">
            <div class="drawer-item-details">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
            </div>
            <button class="add-to-cart-drawer-btn" data-id="${item.id}" title="Add to Cart"><i data-lucide="shopping-cart"></i></button>
            <button class="remove-item-btn" data-id="${item.id}" title="Remove"><i data-lucide="trash-2"></i></button>
        `;
        container.appendChild(row);
    });

    lucide.createIcons();
}

function renderCart() {
    const container = document.getElementById("cart-items-container");
    const footer = document.getElementById("cart-footer");
    if (!container) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="drawer-empty">
                <i data-lucide="shopping-bag"></i>
                <h4>Your Cart is Empty</h4>
                <p>Looks like you haven't added any natural soaps to your bag yet.</p>
                <a href="#shop" class="btn btn-primary" onclick="closeDrawer('cart')">Shop Now</a>
            </div>
        `;
        footer.classList.add("hidden");
        document.getElementById("cart-subtotal-val").textContent = "₹0";
        lucide.createIcons();
        return;
    }

    footer.classList.remove("hidden");
    let subtotal = 0;

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "drawer-item";

        let name, price, img, detailsMarkup = "";
        
        if (item.isCustom) {
            name = item.name;
            price = item.price;
            img = item.image;
            detailsMarkup = `<p class="custom-soap-summary" style="font-size:0.65rem; color:var(--gold); line-height:1.3; margin-top:3px;">${item.description}</p>`;
            subtotal += price * item.quantity;
        } else {
            const product = PRODUCTS.find(p => p.id === item.id);
            if (!product) return;
            name = product.name;
            price = product.price;
            img = product.image;
            subtotal += price * item.quantity;
        }

        row.innerHTML = `
            <img src="${img}" alt="${name}" class="drawer-item-img">
            <div class="drawer-item-details">
                <h4>${name}</h4>
                ${detailsMarkup}
                <span class="drawer-item-price">₹${price}</span>
            </div>
            <div class="qty-control">
                <button class="qty-btn qty-minus" data-id="${item.id}" data-custom="${item.isCustom}"><i data-lucide="minus"></i></button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn qty-plus" data-id="${item.id}" data-custom="${item.isCustom}"><i data-lucide="plus"></i></button>
            </div>
            <button class="remove-item-btn" data-id="${item.id}" data-custom="${item.isCustom}" title="Remove"><i data-lucide="trash-2"></i></button>
        `;
        container.appendChild(row);
    });

    document.getElementById("cart-subtotal-val").textContent = "₹" + subtotal;
    lucide.createIcons();
}

// Drawers visibility control
function openDrawer(type) {
    // Rerender contents before opening
    if (type === "cart") renderCart();
    if (type === "wishlist") renderWishlist();

    const drawer = document.getElementById(`${type}-drawer`);
    if (drawer) drawer.classList.add("active");
}

function closeDrawer(type) {
    const drawer = document.getElementById(`${type}-drawer`);
    if (drawer) drawer.classList.remove("active");
}

// ==========================================================================
// CUSTOMIZER BUILDER PANEL LOGIC
// ==========================================================================

function updateCustomizerPreview() {
    document.getElementById("prev-ingredients").textContent = customSoapState.ingredients;
    document.getElementById("prev-skin").textContent = customSoapState.skinType;
    document.getElementById("prev-fragrance").textContent = customSoapState.fragrance;
    document.getElementById("prev-color").textContent = customSoapState.color;
    document.getElementById("prev-shape").textContent = customSoapState.shape;
    document.getElementById("prev-packaging").textContent = customSoapState.packaging;
}

function renderCustomizerFlavours() {
    const grid = document.getElementById("customizer-flavour-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const formula = SKIN_TYPE_FORMULATIONS[customSoapState.skinType];
    if (!formula) return;

    formula.flavours.forEach((flav, idx) => {
        const btn = document.createElement("button");
        btn.className = "opt-btn";
        if (flav === customSoapState.ingredients) {
            btn.className += " active";
        }
        btn.setAttribute("data-value", flav);
        btn.textContent = flav;
        grid.appendChild(btn);
    });
}

function renderScientificFormulation() {
    const oilsContainer = document.getElementById("oil-composition-list");
    const qualitiesContainer = document.getElementById("soap-quality-grid");
    const satUnsatEl = document.getElementById("sat-unsat-val");
    const insNumberEl = document.getElementById("ins-number-val");

    if (!oilsContainer || !qualitiesContainer) return;

    const formula = SKIN_TYPE_FORMULATIONS[customSoapState.skinType];
    if (!formula) return;

    // Render Oils Composition as simplified botanical ingredients tags
    oilsContainer.innerHTML = "";
    const listWrapper = document.createElement("div");
    listWrapper.className = "calculator-ingredients-list";
    
    formula.oils.forEach(oil => {
        const shortName = oil.name.split(" (")[0]; // remove detailed notes
        const tag = document.createElement("span");
        tag.className = "calc-ing-pill";
        tag.innerHTML = `<i data-lucide="droplet"></i> ${shortName}`;
        listWrapper.appendChild(tag);
    });

    // Add active flavour tag as well
    if (customSoapState.ingredients) {
        const activeTag = document.createElement("span");
        activeTag.className = "calc-ing-pill active-flavor-pill";
        activeTag.innerHTML = `<i data-lucide="sparkles"></i> ${customSoapState.ingredients}`;
        listWrapper.appendChild(activeTag);
    }
    
    oilsContainer.appendChild(listWrapper);
    lucide.createIcons();

    // Render Soap Qualities
    qualitiesContainer.innerHTML = "";
    formula.qualities.forEach(q => {
        const item = document.createElement("div");
        item.className = "quality-item";
        
        // Normalize visual length
        let pct = q.value;
        if (q.name === "INS") {
            pct = ((q.value - 100) / 80) * 100;
        } else if (q.name === "Iodine") {
            pct = (q.value / 80) * 100;
        } else if (q.name === "Conditioning") {
            pct = (q.value / 80) * 100;
        } else {
            pct = (q.value / 60) * 100;
        }
        pct = Math.max(10, Math.min(100, pct));

        item.innerHTML = `
            <div class="quality-item-header">
                <span class="q-name">${q.name}</span>
                <span class="q-range">${q.range}</span>
                <strong class="q-val">${q.value}</strong>
            </div>
            <div class="quality-bar">
                <div class="quality-bar-fill" style="width: ${pct}%;"></div>
            </div>
        `;
        qualitiesContainer.appendChild(item);
    });

    // Ratios
    if (satUnsatEl) satUnsatEl.textContent = formula.satUnsat;
    if (insNumberEl) insNumberEl.textContent = formula.insValue;
}

// ==========================================================================
// CHECKOUT WIZARD FLOW CONTROL & SUMMARY POPULATION
// ==========================================================================

function openCheckout() {
    populateCheckoutSummary();
    const modal = document.getElementById("checkout-modal");
    modal.classList.add("active");
}

function closeCheckout() {
    const modal = document.getElementById("checkout-modal");
    modal.classList.remove("active");
}

function goToCheckoutStep(stepNumber) {
    // Deactivate panels
    document.querySelectorAll(".checkout-step-panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".w-step").forEach(s => s.classList.remove("active"));

    // Activate selected
    document.getElementById(`checkout-step-${stepNumber}`).classList.add("active");
    document.getElementById(`step-nav-${stepNumber}`).classList.add("active");
    
    // Hide Close button on success page
    const closeBtn = document.getElementById("checkout-close-btn");
    if (stepNumber === 3) {
        closeBtn.classList.add("hidden");
    } else {
        closeBtn.classList.remove("hidden");
    }
}

function populateCheckoutSummary() {
    const container = document.getElementById("checkout-summary-items");
    if (!container) return;

    container.innerHTML = "";
    let subtotal = 0;

    cart.forEach(item => {
        let name, price, img, qtyText = `Qty: ${item.quantity}`;
        if (item.isCustom) {
            name = item.name;
            price = item.price;
            img = item.image;
            qtyText += " (1 Batch = 5 Bars)";
            subtotal += price * item.quantity;
        } else {
            const product = PRODUCTS.find(p => p.id === item.id);
            if (!product) return;
            name = product.name;
            price = product.price;
            img = product.image;
            subtotal += price * item.quantity;
        }

        const div = document.createElement("div");
        div.className = "summary-item";
        div.innerHTML = `
            <img src="${img}" alt="${name}" class="summary-item-img">
            <div class="summary-item-info">
                <h4>${name}</h4>
                <span>${qtyText}</span>
            </div>
            <span class="summary-item-price">₹${price * item.quantity}</span>
        `;
        container.appendChild(div);
    });

    document.getElementById("summary-subtotal").textContent = "₹" + subtotal;
    calculateCheckoutGrandTotal();
}

function calculateCheckoutGrandTotal() {
    const subtotalText = document.getElementById("summary-subtotal").textContent;
    const subtotal = parseInt(subtotalText.replace("₹", "")) || 0;

    // Shipping calculations
    // Free shipping above ₹500, else ₹50
    let shipping = 0;
    const shippingEl = document.getElementById("summary-shipping");
    if (subtotal < 500) {
        shipping = 50;
        shippingEl.textContent = "₹50";
    } else {
        shipping = 0;
        shippingEl.textContent = "Free";
    }

    // COD convenience fee
    let codFee = 0;
    const codRow = document.getElementById("summary-cod-row");
    const selectedPayment = document.querySelector('input[name="payment-method"]:checked').value;
    
    if (selectedPayment === "cod") {
        codFee = 40;
        codRow.classList.remove("hidden");
    } else {
        codFee = 0;
        codRow.classList.add("hidden");
    }

    const grandTotal = subtotal + shipping + codFee;
    document.getElementById("summary-grandtotal").textContent = "₹" + grandTotal;
}

// ==========================================================================
// BACKGROUND CANVAS FLOATING LEAVES SYSTEM
// ==========================================================================

function initLeafAnimation() {
    const container = document.getElementById("leaves-container");
    if (!container) return;

    const maxLeaves = 8;
    for (let i = 0; i < maxLeaves; i++) {
        createLeaf(container, true); // initialize leaves already in positions
    }

    // Periodically spawn new leaves
    setInterval(() => {
        createLeaf(container, false);
    }, 2500);
}

function createLeaf(container, randY = false) {
    const leaf = document.createElement("div");
    leaf.className = "floating-leaf";

    // Randomize initial sizing, rotations, and positions
    const size = Math.floor(Math.random() * 20) + 15; // 15px to 35px
    leaf.style.width = size + "px";
    leaf.style.height = size + "px";

    const left = Math.random() * 100; // 0% to 100% width
    leaf.style.left = left + "%";

    // Custom animation drift duration
    const duration = Math.random() * 6 + 10; // 10s to 16s
    leaf.style.animationDuration = duration + "s";

    const delay = Math.random() * 5; // offset start
    leaf.style.animationDelay = delay + "s";

    if (randY) {
        const top = Math.random() * 100;
        leaf.style.top = top + "%";
        // Start animation mid-way
        leaf.style.animationDelay = `-${Math.random() * 8}s`;
    } else {
        leaf.style.top = "-5%";
    }

    container.appendChild(leaf);

    // Garbage collection: remove element when animation ends
    setTimeout(() => {
        leaf.remove();
    }, (duration + delay) * 1000);
}

// ==========================================================================
// VISUAL TOAST NOTIFICATION UTILITY
// ==========================================================================

function showToast(message) {
    // Remove existing toast if visible
    const existing = document.querySelector(".toast-notification");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.innerHTML = `<i data-lucide="check" class="toast-check-icon"></i> <span>${message}</span>`;
    
    // Add inline styling to avoid creating extra stylesheet structures
    Object.assign(toast.style, {
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%) translateY(100px)",
        backgroundColor: "var(--dark-green)",
        color: "var(--white)",
        padding: "12px 28px",
        borderRadius: "50px",
        fontFamily: "var(--font-body)",
        fontSize: "0.85rem",
        fontWeight: "500",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        zIndex: "9999",
        opacity: "0",
        transition: "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease"
    });

    document.body.appendChild(toast);
    
    // Trigger icons in toast
    lucide.createIcons();

    // Trigger visual entry transition
    setTimeout(() => {
        toast.style.transform = "translateX(-50%) translateY(0)";
        toast.style.opacity = "1";
    }, 100);

    // Dismiss timeline
    setTimeout(() => {
        toast.style.transform = "translateX(-50%) translateY(100px)";
        toast.style.opacity = "0";
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3500);
}

// ==========================================================================
// USER LOGIN & GOOGLE AUTHENTICATION SYSTEM
// ==========================================================================

function getRegisteredCustomers() {
    let users = localStorage.getItem("lenora_registered_users");
    if (!users) {
        users = [
            { email: "tallamsatvika@gmail.com", password: "password123", name: "Tallam Satvika" },
            { email: "customer@gmail.com", password: "password123", name: "Ravi Kumar" },
            { email: "user@gmail.com", password: "user123", name: "Rohit Sharma" },
            { email: "lenora.guest@gmail.com", password: "guest123", name: "Guest Customer" }
        ];
        localStorage.setItem("lenora_registered_users", JSON.stringify(users));
    } else {
        users = JSON.parse(users);
        // Force sync tallamsatvika@gmail.com to prevent stale local storage locking you out
        const satvika = users.find(u => u.email === "tallamsatvika@gmail.com");
        if (!satvika) {
            users.push({ email: "tallamsatvika@gmail.com", password: "password123", name: "Tallam Satvika" });
            localStorage.setItem("lenora_registered_users", JSON.stringify(users));
        } else if (satvika.password !== "password123") {
            satvika.password = "password123";
            localStorage.setItem("lenora_registered_users", JSON.stringify(users));
        }
    }
    return users;
}

function registerCustomer(email, password, name) {
    const users = getRegisteredCustomers();
    const emailLower = email.toLowerCase().trim();
    if (!users.some(u => u.email === emailLower)) {
        users.push({ email: emailLower, password, name });
        localStorage.setItem("lenora_registered_users", JSON.stringify(users));
    }
}

function openLoginModal() {
    const modal = document.getElementById("login-modal");
    if (!modal) return;
    
    // Reset inputs
    const emailInput = document.getElementById("login-email");
    const passInput = document.getElementById("login-password");
    const errorMsg = document.getElementById("email-login-error");
    if (emailInput) emailInput.value = "";
    if (passInput) passInput.value = "";
    if (errorMsg) errorMsg.classList.add("hidden");

    // Reset view screens
    document.getElementById("standard-login-box").classList.remove("hidden");
    document.getElementById("google-email-screen").classList.add("hidden");
    document.getElementById("google-password-screen").classList.add("hidden");
    document.getElementById("google-loading-box").classList.add("hidden");
    
    modal.classList.add("active");
}

function closeLoginModal() {
    const modal = document.getElementById("login-modal");
    if (modal) modal.classList.remove("active");
}

function updateAuthUI() {
    const loginToggleBtn = document.getElementById("login-toggle-btn");
    const userDropdownMenu = document.getElementById("user-dropdown-menu");
    const nameEl = document.getElementById("user-display-name");
    const emailEl = document.getElementById("user-display-email");

    if (!loginToggleBtn) return;

    if (currentUser) {
        // Change login button style to show user initials (Avatar mode)
        const initials = currentUser.avatar || currentUser.name.split(" ").map(n => n[0]).join("").substring(0, 2);
        loginToggleBtn.innerHTML = `<span class="nav-avatar">${initials}</span><span class="nav-login-text">${currentUser.name}</span>`;
        loginToggleBtn.classList.add("logged-in");

        // Populate dropdown details
        if (nameEl) nameEl.textContent = currentUser.name;
        if (emailEl) emailEl.textContent = currentUser.email || "Doctor Member";
    } else {
        // Logged out: restore standard button icon & text
        loginToggleBtn.innerHTML = `<i data-lucide="user"></i><span class="nav-login-text">Sign In</span>`;
        loginToggleBtn.classList.remove("logged-in");
        
        // Hide dropdown
        if (userDropdownMenu) userDropdownMenu.classList.add("hidden");
        
        lucide.createIcons();
    }
}

function setupAuthEventListeners() {
    const loginToggleBtn = document.getElementById("login-toggle-btn");
    const loginCloseBtn = document.getElementById("login-close-btn");
    const loginOverlay = document.getElementById("login-modal-overlay");
    const logoutBtn = document.getElementById("logout-btn");
    const googleLoginBtn = document.getElementById("google-login-btn");
    const emailLoginForm = document.getElementById("email-login-form");
    const userDropdownMenu = document.getElementById("user-dropdown-menu");

    // Login modal toggler
    if (loginToggleBtn) {
        loginToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!currentUser) {
                openLoginModal();
            } else {
                userDropdownMenu.classList.toggle("hidden");
            }
        });
    }

    // Close modal triggers
    if (loginCloseBtn) loginCloseBtn.addEventListener("click", closeLoginModal);
    if (loginOverlay) loginOverlay.addEventListener("click", closeLoginModal);

    // Document click to close user dropdown if open
    document.addEventListener("click", (e) => {
        if (userDropdownMenu && !userDropdownMenu.classList.contains("hidden")) {
            if (!e.target.closest("#nav-user-container")) {
                userDropdownMenu.classList.add("hidden");
            }
        }
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            currentUser = null;
            localStorage.removeItem("lenora_user");
            updateAuthUI();
            showToast("Logged out successfully.");
        });
    }

    let tempGoogleEmail = "";

    // Google Sign in trigger (Starts email screen)
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", () => {
            document.getElementById("google-email-input").value = "";
            document.getElementById("google-password-input").value = "";
            document.getElementById("google-email-error").classList.add("hidden");
            document.getElementById("google-password-error").classList.add("hidden");
            
            document.getElementById("standard-login-box").classList.add("hidden");
            document.getElementById("google-email-screen").classList.remove("hidden");
        });
    }

    // Google Next button (Validates Email)
    const emailNextBtn = document.getElementById("google-email-next-btn");
    const emailInput = document.getElementById("google-email-input");
    const emailError = document.getElementById("google-email-error");

    if (emailNextBtn) {
        emailNextBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const emailVal = emailInput.value.trim().toLowerCase();
            
            // Simple Google-like email verification
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailVal) {
                emailError.textContent = "Enter an email or phone number";
                emailError.classList.remove("hidden");
                emailInput.focus();
            } else if (!emailRegex.test(emailVal)) {
                emailError.textContent = "Enter a valid email address";
                emailError.classList.remove("hidden");
                emailInput.focus();
            } else {
                emailError.classList.add("hidden");
                tempGoogleEmail = emailVal;
                document.getElementById("google-selected-email-display").textContent = emailVal;
                
                document.getElementById("google-email-screen").classList.add("hidden");
                document.getElementById("google-password-screen").classList.remove("hidden");
                
                const passInput = document.getElementById("google-password-input");
                passInput.value = "";
                passInput.focus();
            }
        });
    }

    // Back to email screen when clicking email indicator
    const emailPillBtn = document.getElementById("google-email-pill-btn");
    if (emailPillBtn) {
        emailPillBtn.addEventListener("click", () => {
            document.getElementById("google-password-screen").classList.add("hidden");
            document.getElementById("google-email-screen").classList.remove("hidden");
            document.getElementById("google-email-error").classList.add("hidden");
            emailInput.focus();
        });
    }

    // Show/Hide password toggle
    const togglePasswordBtn = document.getElementById("google-toggle-password-btn");
    const passwordInput = document.getElementById("google-password-input");
    const eyeIcon = document.getElementById("g-pass-eye-icon");

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener("click", () => {
            const isPass = passwordInput.getAttribute("type") === "password";
            passwordInput.setAttribute("type", isPass ? "text" : "password");
            eyeIcon.setAttribute("data-lucide", isPass ? "eye-off" : "eye");
            lucide.createIcons();
        });
    }

    // Google password Sign in submit
    const signinSubmitBtn = document.getElementById("google-signin-submit-btn");
    const passwordError = document.getElementById("google-password-error");

    if (signinSubmitBtn) {
        signinSubmitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const passVal = passwordInput.value;
            const emailLower = tempGoogleEmail.toLowerCase().trim();

            if (!passVal) {
                passwordError.textContent = "Enter a password";
                passwordError.classList.remove("hidden");
                passwordInput.focus();
            } else if (passVal.length < 6) {
                passwordError.textContent = "Password must be at least 6 characters.";
                passwordError.classList.remove("hidden");
                passwordInput.focus();
            } else {
                passwordError.classList.add("hidden");
                
                // Extract name prefix dynamically
                const prefix = tempGoogleEmail.split("@")[0];
                const cleanWords = prefix.replace(/[._-]/g, " ").split(" ");
                const name = cleanWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

                // Sync customer dynamically to localStorage database so they can use standard login too
                registerCustomer(tempGoogleEmail, passVal, name);

                // Hide screen and trigger loading animation
                document.getElementById("google-password-screen").classList.add("hidden");
                const loadingBox = document.getElementById("google-loading-box");
                const loadingText = document.getElementById("google-loading-text");
                loadingBox.classList.remove("hidden");
                loadingText.textContent = `Verifying Google Account secure credentials...`;

                setTimeout(() => {
                    const initials = name.split(" ").map(w => w.charAt(0).toUpperCase()).join("").substring(0, 2);
                    currentUser = {
                        name: name,
                        email: emailLower,
                        avatar: initials
                    };

                    localStorage.setItem("lenora_user", JSON.stringify(currentUser));
                    updateAuthUI();
                    closeLoginModal();
                    showToast(`Signed in securely as ${name}!`);

                    if (pendingAuthAction) {
                        pendingAuthAction();
                        pendingAuthAction = null;
                    }
                }, 1800);
            }
        });
    }

    // Email login submit simulation (Customer credential validation)
    if (emailLoginForm) {
        emailLoginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailVal = document.getElementById("login-email").value.trim().toLowerCase();
            const passVal = document.getElementById("login-password").value;
            const errorMsg = document.getElementById("email-login-error");

            const users = getRegisteredCustomers();
            const foundCustomer = users.find(cust => cust.email === emailVal);

            if (!foundCustomer || foundCustomer.password !== passVal) {
                // Wrong email or password for standard form
                errorMsg.textContent = "Invalid customer email or password. Please try again.";
                errorMsg.classList.remove("hidden");
                document.getElementById("login-password").value = "";
                document.getElementById("login-password").focus();
            } else {
                errorMsg.classList.add("hidden");

                const activeCustomer = foundCustomer;

                // Trigger validation loading screen
                document.getElementById("standard-login-box").classList.add("hidden");
                const loadingBox = document.getElementById("google-loading-box");
                const loadingText = document.getElementById("google-loading-text");
                loadingBox.classList.remove("hidden");
                loadingText.textContent = `Validating customer login credentials...`;

                setTimeout(() => {
                    const initials = activeCustomer.name.split(" ").map(w => w.charAt(0).toUpperCase()).join("").substring(0, 2);
                    currentUser = {
                        name: activeCustomer.name,
                        email: activeCustomer.email,
                        avatar: initials
                    };
                    localStorage.setItem("lenora_user", JSON.stringify(currentUser));
                    updateAuthUI();
                    closeLoginModal();
                    showToast(`Welcome back, ${activeCustomer.name}!`);

                    if (pendingAuthAction) {
                        pendingAuthAction();
                        pendingAuthAction = null;
                    }
                }, 1500);
            }
        });
    }
}
