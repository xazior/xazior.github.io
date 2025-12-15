// ============================================
// ChestUp - Modern JavaScript 2025
// Interactive Features & Animations
// ============================================

// ========== Utility Functions ==========
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ========== Navbar Scroll Effect ==========
const navbar = document.getElementById('navbar');
let lastScroll = 0;

const handleScroll = () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
};

window.addEventListener('scroll', debounce(handleScroll, 10));

// ========== Scroll Animations ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');

            // Add stagger delay to children if they exist
            const children = entry.target.querySelectorAll('.animate-fade-in, .animate-scale-in');
            children.forEach((child, index) => {
                child.style.animationDelay = `${index * 100}ms`;
            });
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .bento-card, .use-case-card, .pricing-card').forEach(el => {
    animateOnScroll.observe(el);
});

// ========== Smooth Scroll for  Navigation Links ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Skip if it's just "#"
        if (href === '#') {
            e.preventDefault();
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ========== 3D Product Viewer Controls ==========
const viewerBtns = document.querySelectorAll('.viewer-btn');
const viewerImage = document.querySelector('.viewer-image');

if (viewerBtns.length && viewerImage) {
    viewerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            viewerBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            // Get the view type
            const view = btn.dataset.view;

            // Simple fade effect
            viewerImage.style.opacity = '0';

            setTimeout(() => {
                // Here you would change the image source based on view
                // For now, we'll just fade back in
                // viewerImage.src = `product-${view}.png`;
                viewerImage.style.opacity = '1';
            }, 200);
        });
    });
}

// ========== Hotspot Tooltips ==========
const hotspots = document.querySelectorAll('.hotspot');

hotspots.forEach(hotspot => {
    hotspot.addEventListener('mouseenter', function () {
        const info = this.dataset.info;

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'hotspot-tooltip';
        tooltip.textContent = info;
        tooltip.style.cssText = `
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            font-size: 12px;
            white-space: nowrap;
            border-radius: 8px;
            pointer-events: none;
            z-index: 100;
        `;

        this.appendChild(tooltip);
    });

    hotspot.addEventListener('mouseleave', function () {
        const tooltip = this.querySelector('.hotspot-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    });
});

// ========== Battery Level Animation ==========
const batteryLevel = document.querySelector('.battery-level');

if (batteryLevel) {
    const observeBattery = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate battery fill
                const width = batteryLevel.style.width;
                batteryLevel.style.width = '0%';
                setTimeout(() => {
                    batteryLevel.style.width = width;
                }, 100);
                observeBattery.unobserve(entry.target);
            }
        });
    });

    observeBattery.observe(batteryLevel);
}

// ========== Pricing Card Hover Effect ==========
const pricingCards = document.querySelectorAll('.pricing-card');

pricingCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
    });
});

// ========== CTA Button Ripple Effect ==========
const ctaButtons = document.querySelectorAll('.btn-primary');

ctaButtons.forEach(button => {
    button.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: translate(-50%, -50%) scale(20);
                    opacity: 0;
                }
            }
        `;
        if (!document.querySelector('style[data-ripple]')) {
            style.dataset.ripple = true;
            document.head.appendChild(style);
        }

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// ========== Lazy Load Images ==========
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ========== Shine Effect (Titanium) ==========
const bentoCards = document.querySelectorAll('.bento-card');

bentoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// ========== Parallax Effect for Hero ==========
const hero = document.querySelector('.hero');
const heroProduct = document.querySelector('.hero-product');

if (hero && heroProduct) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;

        if (scrolled < window.innerHeight) {
            heroProduct.style.transform = `translateY(${rate}px)`;
        }
    });
}

// ========== Console Easter Egg ==========
console.log('%c🔒 ChestUp - Suezo is watching!', 'color: #8b5cf6; font-size: 20px; font-weight: bold;');
console.log('%cInterested in joining our team? careers@chestup.io', 'color: #ec4899; font-size: 14px;');

// ========== Performance Monitoring ==========
if ('PerformanceObserver' in window) {
    try {
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'navigation') {
                    console.log('Page Load Time:', entry.loadEventEnd - entry.fetchStart, 'ms');
                }
                if (entry.entryType === 'paint') {
                    console.log(entry.name + ':', entry.startTime, 'ms');
                }
            }
        });

        perfObserver.observe({ entryTypes: ['navigation', 'paint'] });
    } catch (e) {
        // PerformanceObserver not supported
    }
}

// ========== Shopping Cart Logic ==========
const cart = [];
const cartBtn = document.querySelector('.btn-secondary svg').parentNode; // Target cart button
let isCartOpen = false;

// Inject Cart Modal
const cartModal = document.createElement('div');
cartModal.className = 'cart-modal glass';
cartModal.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    width: 350px;
    background: rgba(15, 15, 15, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    transform: translateX(120%);
    transition: transform 0.3s ease-out;
    z-index: 1000;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
`;

cartModal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0;">Il tuo Carrello</h3>
        <button id="close-cart" style="background:none; border:none; color:white; cursor:pointer;">✕</button>
    </div>
    <div id="cart-items" style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
        <p style="color: #888; text-align: center;">Il carrello è vuoto</p>
    </div>
    <div style="border-top: 1px solid #333; padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <span>Totale</span>
            <span id="cart-total" style="font-weight: bold; color: #8b5cf6;">€0.00</span>
        </div>
        <button class="btn btn-primary" style="width: 100%;">Procedi al Checkout</button>
    </div>
`;
document.body.appendChild(cartModal);

// Toggle Cart
if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        isCartOpen = !isCartOpen;
        cartModal.style.transform = isCartOpen ? 'translateX(0)' : 'translateX(120%)';
    });
}

document.getElementById('close-cart').addEventListener('click', () => {
    isCartOpen = false;
    cartModal.style.transform = 'translateX(120%)';
});

// Add to Cart Functionality
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function () {
        const card = this.closest('.product-card');
        const title = card.querySelector('.product-title').innerText;
        const price = parseFloat(card.querySelector('.product-price').innerText.replace('€', ''));

        cart.push({ title, price });
        updateCart();

        // Open cart
        isCartOpen = true;
        cartModal.style.transform = 'translateX(0)';

        // Update button text temporarily
        const originalText = this.innerText;
        this.innerText = 'Aggiunto! ✓';
        this.style.background = 'var(--color-success)';
        setTimeout(() => {
            this.innerText = originalText;
            this.style.background = ''; // Reset to default
        }, 2000);
    });
});

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCountBtn = document.querySelector('.btn-secondary'); // Correct selector for nav button text if possible

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="color: #888; text-align: center;">Il carrello è vuoto</p>';
        cartTotal.innerText = '€0.00';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
                <span>${item.title}</span>
                <span style="color: #bbb;">€${item.price.toFixed(2)}</span>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotal.innerText = '€' + total.toFixed(2);
    }

    // Update nav button text (heuristic)
    if (cartCountBtn && cartBtn.innerText.includes('Carrello')) {
        cartCountBtn.innerHTML = `
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px;">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Carrello (${cart.length})`;
    }
}

// ========== Initialize on DOM Load ==========

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ ChestUp website loaded successfully');

    // Add a subtle entrance animation to the page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});
