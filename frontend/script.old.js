/**
 * SuperNØva - Landing Page JavaScript
 * Minimal, clean interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initLucide();
    initNavbar();
    initScrollAnimations();
    initContactForm();
});

// Initialize Lucide icons
function initLucide() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Navbar scroll behavior
function initNavbar() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
            toggle.classList.toggle('open');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Intersection Observer for scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.koda-feature, .security-item, .pricing-card').forEach(el => {
        observer.observe(el);
    });
}

// Contact form handling
function initContactForm() {
    const form = document.getElementById('contact-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email-input');
            const button = form.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;

            // Validate email
            if (!emailInput.value || !isValidEmail(emailInput.value)) {
                shakeElement(emailInput);
                return;
            }

            // Show loading state
            button.innerHTML = '<span class="loading"></span>';
            button.disabled = true;

            // Simulate API call
            await delay(1500);

            // Success state
            button.innerHTML = 'Fatto! ✓';
            button.style.background = '#10b981';
            emailInput.value = '';

            // Reset after delay
            await delay(3000);
            button.innerHTML = originalText;
            button.style.background = '';
            button.disabled = false;
        });
    }
}

// Utility functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight; // Trigger reflow
    el.style.animation = 'shake 0.5s ease';

    setTimeout(() => {
        el.style.animation = '';
    }, 500);
}

// Add shake animation to head
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
    }

    .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(0, 0, 0, 0.2);
        border-top-color: #000;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// KODA Easter egg - click to wink
document.querySelectorAll('.koda').forEach(koda => {
    koda.addEventListener('click', () => {
        const eyes = koda.querySelectorAll('.koda-eye');
        eyes.forEach(eye => {
            eye.style.animation = 'none';
            eye.offsetHeight;
            eye.style.animation = 'wink 0.3s ease';
        });

        setTimeout(() => {
            eyes.forEach(eye => {
                eye.style.animation = 'blink 4s ease-in-out infinite';
            });
        }, 300);
    });
});

// Add wink animation
const winkStyle = document.createElement('style');
winkStyle.textContent = `
    @keyframes wink {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(0.1); }
    }
`;
document.head.appendChild(winkStyle);

// ============================================
// Eye Tracking - Dynamic floating eyeballs
// ============================================

function initEyeTracking() {
    const kodas = document.querySelectorAll('.koda');

    // Mouse position
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animate eyes smoothly
    function animateEyes() {
        kodas.forEach(koda => {
            const face = koda.querySelector('.koda-face');
            if (!face) return;

            const rect = koda.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate angle and distance to mouse
            const deltaX = mouseX - centerX;
            const deltaY = mouseY - centerY;
            const angle = Math.atan2(deltaY, deltaX);
            const distance = Math.hypot(deltaX, deltaY);

            // Max movement radius (eyeballs can move a lot!)
            const maxMove = 12;
            const moveAmount = Math.min(distance / 50, maxMove);

            const moveX = Math.cos(angle) * moveAmount;
            const moveY = Math.sin(angle) * moveAmount;

            const eyes = koda.querySelectorAll('.koda-eye');
            eyes.forEach(eye => {
                eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });

        requestAnimationFrame(animateEyes);
    }

    animateEyes();
}

// Enhanced eye styles
const eyeStyle = document.createElement('style');
eyeStyle.textContent = `
    .koda-face {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        gap: 24px;
    }

    .koda-eye {
        width: 16px;
        height: 16px;
        background: var(--accent, #8b5cf6);
        border-radius: 50%;
        box-shadow:
            0 0 20px rgba(139, 92, 246, 0.6),
            0 0 40px rgba(139, 92, 246, 0.3),
            inset 0 0 8px rgba(255, 255, 255, 0.3);
        transition: transform 0.08s ease-out;
        will-change: transform;
    }

    .koda.mini .koda-face {
        gap: 12px;
    }

    .koda.mini .koda-eye {
        width: 8px;
        height: 8px;
        box-shadow:
            0 0 10px rgba(139, 92, 246, 0.6),
            0 0 20px rgba(139, 92, 246, 0.3);
    }
`;
document.head.appendChild(eyeStyle);

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEyeTracking);
} else {
    initEyeTracking();
}
