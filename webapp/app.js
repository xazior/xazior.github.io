/**
 * SuperNØva Smart Locker - Web App JavaScript
 * Handles authentication, device management, maps, and real-time updates
 */

// ============================================
// Configuration & State
// ============================================

const CONFIG = {
    API_BASE: 'http://localhost:3000/api/v1',
    WS_URL: 'ws://localhost:3000',
    MAP_CENTER: [45.052, 9.695], // Piacenza, Italy
    MAP_ZOOM: 13
};

// Application State
const state = {
    isAuthenticated: false,
    user: null,
    devices: [],
    accessLogs: [],
    notifications: [],
    currentPage: 'dashboard',
    map: null,
    mainMap: null,
    ws: null
};

// Mock Data (replace with API calls in production)
const MOCK_DATA = {
    user: {
        id: 'usr_leonardo',
        name: 'Leonardo',
        email: 'leonardo@esempio.it',
        plan: 'premium'
    },
    devices: [
        {
            id: 'dev_cassapanca_001',
            name: 'Cassapanca Giardino',
            model: 'CassapancaPro-2025',
            firmware: '1.4.2',
            status: {
                is_locked: true,
                battery_percent: 78,
                signal_strength: -85,
                gps_fix: '3D',
                last_checkin: new Date().toISOString()
            },
            location: { lat: 45.052, lng: 9.695, accuracy: 2.5 },
            shared_with: ['mamma@famiglia.it', 'nonna@famiglia.it']
        },
        {
            id: 'dev_cassapanca_002',
            name: 'Cassapanca Ingresso',
            model: 'CassapancaPro-2025',
            firmware: '1.4.2',
            status: {
                is_locked: true,
                battery_percent: 92,
                signal_strength: -72,
                gps_fix: '3D',
                last_checkin: new Date().toISOString()
            },
            location: { lat: 45.054, lng: 9.698, accuracy: 1.8 },
            shared_with: []
        },
        {
            id: 'dev_cassapanca_003',
            name: 'Cassapanca Garage',
            model: 'CassapancaPro-2025',
            firmware: '1.4.1',
            status: {
                is_locked: false,
                battery_percent: 45,
                signal_strength: -90,
                gps_fix: '2D',
                last_checkin: new Date(Date.now() - 3600000).toISOString()
            },
            location: { lat: 45.050, lng: 9.692, accuracy: 5.2 },
            shared_with: ['fratello@famiglia.it']
        }
    ],
    accessLogs: [
        { id: 1, device_id: 'dev_cassapanca_001', user: 'Leonardo', action: 'open', method: 'app', timestamp: new Date(Date.now() - 1800000), granted: true },
        { id: 2, device_id: 'dev_cassapanca_001', user: 'DHL Corriere', action: 'open', method: 'temp_code', timestamp: new Date(Date.now() - 3600000), granted: true },
        { id: 3, device_id: 'dev_cassapanca_002', user: 'Leonardo', action: 'close', method: 'app', timestamp: new Date(Date.now() - 7200000), granted: true },
        { id: 4, device_id: 'dev_cassapanca_003', user: 'Unknown', action: 'open', method: 'temp_code', timestamp: new Date(Date.now() - 10800000), granted: false },
        { id: 5, device_id: 'dev_cassapanca_001', user: 'Mamma', action: 'open', method: 'nfc', timestamp: new Date(Date.now() - 14400000), granted: true }
    ],
    sharedUsers: [
        { email: 'mamma@famiglia.it', name: 'Mamma', role: 'manager', device: 'dev_cassapanca_001', expires: null },
        { email: 'nonna@famiglia.it', name: 'Nonna', role: 'viewer', device: 'dev_cassapanca_001', expires: null },
        { email: 'fratello@famiglia.it', name: 'Fratello', role: 'manager', device: 'dev_cassapanca_003', expires: new Date(Date.now() + 86400000) }
    ],
    alerts: [
        { id: 1, type: 'warning', title: 'Batteria Bassa', desc: 'Cassapanca Garage ha batteria al 45%', time: new Date(Date.now() - 1800000) },
        { id: 2, type: 'info', title: 'Aggiornamento Disponibile', desc: 'Firmware 1.4.3 disponibile per Cassapanca Garage', time: new Date(Date.now() - 7200000) }
    ],
    notifications: [
        { id: 1, text: 'Pacco depositato da DHL', device: 'Cassapanca Giardino', time: new Date(Date.now() - 1800000), read: false },
        { id: 2, text: 'Accesso effettuato da Mamma', device: 'Cassapanca Giardino', time: new Date(Date.now() - 3600000), read: false },
        { id: 3, text: 'Batteria bassa rilevata', device: 'Cassapanca Garage', time: new Date(Date.now() - 7200000), read: true }
    ]
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initLucideIcons();
    checkAuth();
    setupEventListeners();
});

function initLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function checkAuth() {
    const token = localStorage.getItem('auth_token');
    if (token) {
        state.isAuthenticated = true;
        state.user = MOCK_DATA.user;
        showApp();
    } else {
        showLogin();
    }
}

// ============================================
// Authentication
// ============================================

function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-wrapper').style.display = 'none';
}

function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-wrapper').style.display = 'flex';

    // Load initial data
    loadDevices();
    loadAccessLogs();
    loadNotifications();

    // Initialize dashboard
    navigateTo('dashboard');

    // Setup WebSocket connection
    setupWebSocket();
}

function handleLogin(email, password) {
    // Demo credentials check
    if (email === 'demo@example.com' && password === 'password123') {
        const token = 'demo_jwt_token_' + Date.now();
        localStorage.setItem('auth_token', token);
        state.isAuthenticated = true;
        state.user = MOCK_DATA.user;
        showApp();
        showToast('Accesso effettuato con successo', 'success');
    } else {
        showToast('Credenziali non valide', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('auth_token');
    state.isAuthenticated = false;
    state.user = null;
    if (state.ws) {
        state.ws.close();
    }
    showLogin();
    showToast('Disconnesso', 'info');
}

// ============================================
// Event Listeners Setup
// ============================================

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            handleLogin(email, password);
        });
    }

    // Password toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const input = document.getElementById('login-password');
            const icon = togglePassword.querySelector('svg');
            if (input.type === 'password') {
                input.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                input.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Sidebar navigation
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });

    // Card navigation buttons
    document.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('nav-item')) return;
            e.preventDefault();
            const page = btn.dataset.page;
            navigateTo(page);
        });
    });

    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshData();
        });
    }

    // Notification panel
    const notificationBtn = document.getElementById('notification-btn');
    const notificationPanel = document.getElementById('notification-panel');
    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationPanel.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!notificationPanel.contains(e.target)) {
                notificationPanel.classList.remove('active');
            }
        });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Share access button
    const shareAccessBtn = document.getElementById('share-access-btn');
    const newShareBtn = document.getElementById('new-share-btn');
    [shareAccessBtn, newShareBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                openShareModal();
            });
        }
    });

    // Generate temp code button
    const generateTempCode = document.getElementById('generate-temp-code');
    if (generateTempCode) {
        generateTempCode.addEventListener('click', () => {
            openTempCodeModal();
        });
    }

    // Share form
    const shareForm = document.getElementById('share-form');
    if (shareForm) {
        shareForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleShareAccess();
        });
    }

    // Temp code form
    const tempCodeForm = document.getElementById('temp-code-form');
    if (tempCodeForm) {
        tempCodeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleGenerateTempCode();
        });
    }

    // Copy code button
    const copyCodeBtn = document.getElementById('copy-code-btn');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', () => {
            const code = document.getElementById('generated-code-value').textContent;
            navigator.clipboard.writeText(code);
            showToast('Codice copiato!', 'success');
        });
    }

    // Export logs button
    const exportLogsBtn = document.getElementById('export-logs-btn');
    if (exportLogsBtn) {
        exportLogsBtn.addEventListener('click', exportLogsToCSV);
    }

    // Alert settings
    const batteryThreshold = document.getElementById('battery-threshold');
    const batteryThresholdValue = document.getElementById('battery-threshold-value');
    if (batteryThreshold && batteryThresholdValue) {
        batteryThreshold.addEventListener('input', () => {
            batteryThresholdValue.textContent = batteryThreshold.value + '%';
        });
    }

    // Mark all notifications read
    const markAllRead = document.getElementById('mark-all-read');
    if (markAllRead) {
        markAllRead.addEventListener('click', () => {
            state.notifications.forEach(n => n.read = true);
            renderNotifications();
            document.querySelector('.notification-dot').style.display = 'none';
        });
    }
}

// ============================================
// Navigation
// ============================================

function navigateTo(page) {
    state.currentPage = page;

    // Update sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        devices: 'Dispositivi',
        map: 'Mappa',
        access: 'Controllo Accessi',
        sharing: 'Condivisioni',
        logs: 'Log Accessi',
        alerts: 'Alert',
        settings: 'Impostazioni'
    };
    document.getElementById('page-title').textContent = titles[page] || page;

    // Show/hide pages
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
    });
    const pageElement = document.getElementById(`page-${page}`);
    if (pageElement) {
        pageElement.style.display = 'block';
    }

    // Page-specific initialization
    switch (page) {
        case 'dashboard':
            initDashboard();
            break;
        case 'devices':
            renderDevicesGrid();
            break;
        case 'map':
            initMainMap();
            break;
        case 'access':
            renderPermissions();
            break;
        case 'sharing':
            renderSharedUsers();
            break;
        case 'logs':
            renderLogsTable();
            break;
        case 'alerts':
            renderAlerts();
            break;
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

// ============================================
// Data Loading
// ============================================

function loadDevices() {
    // In production, fetch from API
    state.devices = MOCK_DATA.devices;
}

function loadAccessLogs() {
    state.accessLogs = MOCK_DATA.accessLogs;
}

function loadNotifications() {
    state.notifications = MOCK_DATA.notifications;
}

function refreshData() {
    const btn = document.getElementById('refresh-btn');
    btn.classList.add('spinning');

    setTimeout(() => {
        loadDevices();
        loadAccessLogs();
        loadNotifications();

        // Re-render current page
        navigateTo(state.currentPage);

        btn.classList.remove('spinning');
        showToast('Dati aggiornati', 'success');
    }, 1000);
}

// ============================================
// Dashboard
// ============================================

function initDashboard() {
    renderDeviceList();
    renderActivityList();
    initDashboardMap();
    initActivityChart();
    updateStats();
}

function updateStats() {
    document.getElementById('stat-devices').textContent = state.devices.length;
    document.getElementById('stat-unlocks').textContent = state.accessLogs.filter(l => l.action === 'open' && l.granted).length;
    document.getElementById('stat-shared').textContent = MOCK_DATA.sharedUsers.length;

    const avgBattery = Math.round(state.devices.reduce((sum, d) => sum + d.status.battery_percent, 0) / state.devices.length);
    document.getElementById('stat-battery').textContent = avgBattery + '%';
}

function renderDeviceList() {
    const container = document.getElementById('device-list');
    if (!container) return;

    container.innerHTML = state.devices.map(device => `
        <div class="device-item" data-device-id="${device.id}">
            <div class="device-icon">
                <i data-lucide="box"></i>
            </div>
            <div class="device-info">
                <span class="device-name">${device.name}</span>
                <div class="device-meta">
                    <span><i data-lucide="battery"></i> ${device.status.battery_percent}%</span>
                    <span><i data-lucide="signal"></i> ${device.status.gps_fix}</span>
                </div>
            </div>
            <div class="device-status">
                <span class="status-dot ${device.status.is_locked ? '' : 'warning'}"></span>
                <span>${device.status.is_locked ? 'Bloccato' : 'Aperto'}</span>
            </div>
            <div class="device-actions">
                <button class="device-action-btn ${device.status.is_locked ? 'unlock' : 'lock'}"
                        onclick="toggleLock('${device.id}')"
                        title="${device.status.is_locked ? 'Sblocca' : 'Blocca'}">
                    <i data-lucide="${device.status.is_locked ? 'unlock' : 'lock'}"></i>
                </button>
            </div>
        </div>
    `).join('');

    lucide.createIcons();

    // Add click handler to open device control
    container.querySelectorAll('.device-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.device-action-btn')) {
                openDeviceControl(item.dataset.deviceId);
            }
        });
    });
}

function renderActivityList() {
    const container = document.getElementById('activity-list');
    if (!container) return;

    container.innerHTML = state.accessLogs.slice(0, 5).map(log => {
        const device = state.devices.find(d => d.id === log.device_id);
        const iconClass = log.granted ? (log.action === 'open' ? 'success' : '') : 'danger';
        const icon = log.granted ? (log.action === 'open' ? 'unlock' : 'lock') : 'x-circle';

        return `
            <div class="activity-item">
                <div class="activity-icon ${iconClass}">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-text">
                        <strong>${log.user}</strong> ${log.action === 'open' ? 'ha aperto' : 'ha chiuso'}
                        ${device ? device.name : log.device_id}
                    </p>
                    <span class="activity-time">${formatTime(log.timestamp)}</span>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

function initDashboardMap() {
    const mapContainer = document.getElementById('dashboard-map');
    if (!mapContainer || state.map) return;

    state.map = L.map('dashboard-map', {
        zoomControl: false,
        attributionControl: false
    }).setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(state.map);

    // Add device markers
    state.devices.forEach(device => {
        const marker = L.circleMarker([device.location.lat, device.location.lng], {
            radius: 8,
            fillColor: device.status.is_locked ? '#10b981' : '#f59e0b',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(state.map);

        marker.bindPopup(`
            <strong>${device.name}</strong><br>
            Batteria: ${device.status.battery_percent}%<br>
            Stato: ${device.status.is_locked ? 'Bloccato' : 'Aperto'}
        `);
    });
}

function initActivityChart() {
    const ctx = document.getElementById('activity-chart');
    if (!ctx) return;

    // Check if chart already exists
    if (ctx.chart) {
        ctx.chart.destroy();
    }

    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('it-IT', { weekday: 'short' }));
        data.push(Math.floor(Math.random() * 10) + 3);
    }

    ctx.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Aperture',
                data,
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#71717a'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#71717a',
                        stepSize: 5
                    }
                }
            }
        }
    });
}

// ============================================
// Devices Page
// ============================================

function renderDevicesGrid() {
    const container = document.getElementById('devices-grid');
    if (!container) return;

    container.innerHTML = state.devices.map(device => `
        <div class="device-card" data-device-id="${device.id}">
            <div class="device-card-header">
                <div class="device-card-info">
                    <div class="device-card-icon">
                        <i data-lucide="box"></i>
                    </div>
                    <div>
                        <h4 class="device-card-title">${device.name}</h4>
                        <span class="device-card-model">${device.model}</span>
                    </div>
                </div>
                <div class="device-card-status">
                    <span class="status-dot ${device.status.is_locked ? '' : 'warning'}"></span>
                    <span>${device.status.is_locked ? 'Bloccato' : 'Aperto'}</span>
                </div>
            </div>
            <div class="device-card-body">
                <div class="device-stats">
                    <div class="device-stat">
                        <span class="device-stat-value">${device.status.battery_percent}%</span>
                        <span class="device-stat-label">Batteria</span>
                    </div>
                    <div class="device-stat">
                        <span class="device-stat-value">${device.status.gps_fix}</span>
                        <span class="device-stat-label">GPS</span>
                    </div>
                    <div class="device-stat">
                        <span class="device-stat-value">${device.shared_with.length}</span>
                        <span class="device-stat-label">Condiviso</span>
                    </div>
                </div>
                <div class="device-card-actions">
                    <button class="btn btn-outline" onclick="openDeviceControl('${device.id}')">
                        <i data-lucide="settings"></i>
                        Gestisci
                    </button>
                    <button class="btn ${device.status.is_locked ? 'btn-primary' : 'btn-success'}"
                            onclick="toggleLock('${device.id}')">
                        <i data-lucide="${device.status.is_locked ? 'unlock' : 'lock'}"></i>
                        ${device.status.is_locked ? 'Sblocca' : 'Blocca'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// ============================================
// Map Page
// ============================================

function initMainMap() {
    const mapContainer = document.getElementById('main-map');
    if (!mapContainer) return;

    // Destroy existing map if present
    if (state.mainMap) {
        state.mainMap.remove();
    }

    state.mainMap = L.map('main-map', {
        zoomControl: false
    }).setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(state.mainMap);

    // Add device markers with more details
    state.devices.forEach(device => {
        const marker = L.marker([device.location.lat, device.location.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div class="marker-icon ${device.status.is_locked ? 'locked' : 'unlocked'}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 8V21H3V8H21M21 6H3C1.9 6 1 6.9 1 8V21C1 22.1 1.9 23 3 23H21C22.1 23 23 22.1 23 21V8C23 6.9 22.1 6 21 6M12 12C9.5 12 7.5 14 7.5 16.5S9.5 21 12 21 16.5 19 16.5 16.5 14.5 12 12 12M12 14C13.4 14 14.5 15.1 14.5 16.5S13.4 19 12 19 9.5 17.9 9.5 16.5 10.6 14 12 14M7 3V6H17V3H7M9 1H15C16.1 1 17 1.9 17 3V6H7V3C7 1.9 7.9 1 9 1Z"/>
                    </svg>
                </div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            })
        }).addTo(state.mainMap);

        marker.bindPopup(`
            <div style="min-width: 200px;">
                <h4 style="margin: 0 0 8px; font-weight: 600;">${device.name}</h4>
                <p style="margin: 0 0 4px; font-size: 12px; color: #a1a1aa;">${device.model}</p>
                <div style="display: flex; gap: 16px; margin-top: 12px;">
                    <div>
                        <span style="font-size: 18px; font-weight: 700;">${device.status.battery_percent}%</span>
                        <span style="display: block; font-size: 11px; color: #71717a;">Batteria</span>
                    </div>
                    <div>
                        <span style="font-size: 18px; font-weight: 700;">${device.status.gps_fix}</span>
                        <span style="display: block; font-size: 11px; color: #71717a;">GPS</span>
                    </div>
                </div>
                <button onclick="toggleLock('${device.id}')"
                        style="width: 100%; margin-top: 12px; padding: 8px;
                               background: ${device.status.is_locked ? '#6366f1' : '#10b981'};
                               color: white; border: none; border-radius: 6px; cursor: pointer;">
                    ${device.status.is_locked ? 'Sblocca' : 'Blocca'}
                </button>
            </div>
        `);

        // Add geofence circle
        L.circle([device.location.lat, device.location.lng], {
            radius: 50,
            color: '#6366f1',
            fillColor: '#6366f1',
            fillOpacity: 0.1,
            weight: 1,
            dashArray: '4'
        }).addTo(state.mainMap);
    });

    // Render device list in sidebar
    renderMapDeviceList();

    // Map controls
    document.getElementById('map-center')?.addEventListener('click', () => {
        state.mainMap.setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);
    });

    document.getElementById('map-zoom-in')?.addEventListener('click', () => {
        state.mainMap.zoomIn();
    });

    document.getElementById('map-zoom-out')?.addEventListener('click', () => {
        state.mainMap.zoomOut();
    });
}

function renderMapDeviceList() {
    const container = document.getElementById('map-device-list');
    if (!container) return;

    container.innerHTML = state.devices.map(device => `
        <div class="device-item" onclick="focusDevice('${device.id}')">
            <div class="device-icon">
                <i data-lucide="box"></i>
            </div>
            <div class="device-info">
                <span class="device-name">${device.name}</span>
                <div class="device-meta">
                    <span><i data-lucide="map-pin"></i> ${device.location.lat.toFixed(3)}°, ${device.location.lng.toFixed(3)}°</span>
                </div>
            </div>
            <div class="device-status">
                <span class="status-dot ${device.status.is_locked ? '' : 'warning'}"></span>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

function focusDevice(deviceId) {
    const device = state.devices.find(d => d.id === deviceId);
    if (device && state.mainMap) {
        state.mainMap.setView([device.location.lat, device.location.lng], 16);
    }
}

// ============================================
// Access Control
// ============================================

function renderPermissions() {
    const container = document.getElementById('permissions-list');
    if (!container) return;

    container.innerHTML = MOCK_DATA.sharedUsers.map(user => {
        const device = state.devices.find(d => d.id === user.device);
        return `
            <div class="permission-item">
                <div class="permission-avatar">${user.name.charAt(0)}</div>
                <div class="permission-info">
                    <span class="permission-name">${user.name}</span>
                    <span class="permission-role">${user.role} • ${device ? device.name : user.device}</span>
                </div>
                <div class="permission-actions">
                    <button class="device-action-btn" onclick="revokeAccess('${user.email}', '${user.device}')" title="Revoca">
                        <i data-lucide="x"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// ============================================
// Sharing
// ============================================

function renderSharedUsers() {
    const container = document.getElementById('shared-users-list');
    if (!container) return;

    // Populate device filter
    const deviceFilter = document.getElementById('sharing-filter-device');
    if (deviceFilter) {
        deviceFilter.innerHTML = '<option value="all">Tutti i dispositivi</option>' +
            state.devices.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }

    container.innerHTML = MOCK_DATA.sharedUsers.map(user => {
        const device = state.devices.find(d => d.id === user.device);
        const expiresText = user.expires ? `Scade: ${formatDate(user.expires)}` : 'Permanente';

        return `
            <div class="permission-item">
                <div class="permission-avatar">${user.name.charAt(0)}</div>
                <div class="permission-info">
                    <span class="permission-name">${user.name}</span>
                    <span class="permission-role">${user.email}</span>
                </div>
                <div style="text-align: right; margin-right: 16px;">
                    <span style="display: block; font-size: 0.875rem; text-transform: capitalize;">${user.role}</span>
                    <span style="font-size: 0.75rem; color: var(--text-tertiary);">${expiresText}</span>
                </div>
                <div style="margin-right: 16px;">
                    <span style="font-size: 0.875rem;">${device ? device.name : user.device}</span>
                </div>
                <div class="permission-actions">
                    <button class="device-action-btn" onclick="editShare('${user.email}')" title="Modifica">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="device-action-btn" onclick="revokeAccess('${user.email}', '${user.device}')" title="Revoca">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

function openShareModal() {
    const modal = document.getElementById('share-access-modal');
    const deviceSelect = document.getElementById('share-device');

    // Populate device options
    deviceSelect.innerHTML = state.devices.map(d =>
        `<option value="${d.id}">${d.name}</option>`
    ).join('');

    modal.classList.add('active');
}

function handleShareAccess() {
    const email = document.getElementById('share-email').value;
    const device = document.getElementById('share-device').value;
    const role = document.getElementById('share-role').value;
    const expires = document.getElementById('share-expires').value;

    // In production, send to API
    console.log('Sharing access:', { email, device, role, expires });

    closeAllModals();
    showToast(`Invito inviato a ${email}`, 'success');

    // Reset form
    document.getElementById('share-form').reset();
}

function revokeAccess(email, deviceId) {
    if (confirm(`Sei sicuro di voler revocare l'accesso a ${email}?`)) {
        // In production, send to API
        console.log('Revoking access:', { email, deviceId });
        showToast(`Accesso revocato per ${email}`, 'success');
        renderPermissions();
        renderSharedUsers();
    }
}

// ============================================
// Temporary Codes
// ============================================

function openTempCodeModal() {
    const modal = document.getElementById('temp-code-modal');
    const deviceSelect = document.getElementById('temp-code-device');

    // Reset display
    document.getElementById('temp-code-form').style.display = 'block';
    document.getElementById('generated-code-display').style.display = 'none';

    // Populate device options
    deviceSelect.innerHTML = state.devices.map(d =>
        `<option value="${d.id}">${d.name}</option>`
    ).join('');

    modal.classList.add('active');
}

function handleGenerateTempCode() {
    const device = document.getElementById('temp-code-device').value;
    const validity = document.getElementById('temp-code-validity').value;
    const note = document.getElementById('temp-code-note').value;

    // Generate random code
    const code = generateRandomCode();

    // In production, send to API
    console.log('Generating temp code:', { device, validity, note, code });

    // Show generated code
    document.getElementById('temp-code-form').style.display = 'none';
    document.getElementById('generated-code-display').style.display = 'block';
    document.getElementById('generated-code-value').textContent = code;
    document.getElementById('code-expiry-time').textContent = validity;
}

function generateRandomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ============================================
// Logs
// ============================================

function renderLogsTable() {
    const tbody = document.getElementById('logs-table-body');
    if (!tbody) return;

    // Populate device filter
    const deviceFilter = document.getElementById('logs-filter-device');
    if (deviceFilter) {
        deviceFilter.innerHTML = '<option value="all">Tutti i dispositivi</option>' +
            state.devices.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }

    tbody.innerHTML = state.accessLogs.map(log => {
        const device = state.devices.find(d => d.id === log.device_id);
        return `
            <tr>
                <td>${formatDateTime(log.timestamp)}</td>
                <td>${device ? device.name : log.device_id}</td>
                <td>${log.user}</td>
                <td>${log.action === 'open' ? 'Apertura' : 'Chiusura'}</td>
                <td>${log.method}</td>
                <td>—</td>
                <td>
                    <span class="log-status ${log.granted ? 'success' : 'failed'}">
                        ${log.granted ? 'Autorizzato' : 'Negato'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

function exportLogsToCSV() {
    const headers = ['Data/Ora', 'Dispositivo', 'Utente', 'Azione', 'Metodo', 'Stato'];
    const rows = state.accessLogs.map(log => {
        const device = state.devices.find(d => d.id === log.device_id);
        return [
            formatDateTime(log.timestamp),
            device ? device.name : log.device_id,
            log.user,
            log.action,
            log.method,
            log.granted ? 'Autorizzato' : 'Negato'
        ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `access_logs_${formatDate(new Date())}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('Log esportati', 'success');
}

// ============================================
// Alerts
// ============================================

function renderAlerts() {
    const container = document.getElementById('active-alerts-list');
    if (!container) return;

    container.innerHTML = MOCK_DATA.alerts.map(alert => `
        <div class="alert-item ${alert.type === 'critical' ? 'critical' : ''}">
            <div class="alert-icon">
                <i data-lucide="${alert.type === 'warning' ? 'alert-triangle' : 'info'}"></i>
            </div>
            <div class="alert-content">
                <h4 class="alert-title">${alert.title}</h4>
                <p class="alert-desc">${alert.desc}</p>
                <span class="alert-time">${formatTime(alert.time)}</span>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// ============================================
// Notifications
// ============================================

function renderNotifications() {
    const container = document.getElementById('notification-list');
    if (!container) return;

    container.innerHTML = state.notifications.map(notif => `
        <div class="notification-item ${notif.read ? '' : 'unread'}">
            <div class="activity-icon ${notif.read ? '' : 'success'}">
                <i data-lucide="bell"></i>
            </div>
            <div class="activity-content">
                <p class="activity-text">${notif.text}</p>
                <span class="activity-time">${notif.device} • ${formatTime(notif.time)}</span>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// ============================================
// Device Control
// ============================================

function openDeviceControl(deviceId) {
    const device = state.devices.find(d => d.id === deviceId);
    if (!device) return;

    const modal = document.getElementById('device-control-modal');
    const body = document.getElementById('device-control-body');

    body.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
            <div class="device-card-icon" style="margin: 0 auto 16px; width: 64px; height: 64px;">
                <i data-lucide="box" style="width: 32px; height: 32px;"></i>
            </div>
            <h3 style="margin-bottom: 4px;">${device.name}</h3>
            <p style="color: var(--text-tertiary); font-size: 0.875rem;">${device.model} • v${device.firmware}</p>
        </div>

        <div class="device-stats" style="margin-bottom: 24px;">
            <div class="device-stat">
                <span class="device-stat-value">${device.status.battery_percent}%</span>
                <span class="device-stat-label">Batteria</span>
            </div>
            <div class="device-stat">
                <span class="device-stat-value">${device.status.gps_fix}</span>
                <span class="device-stat-label">GPS</span>
            </div>
            <div class="device-stat">
                <span class="device-stat-value">${device.status.signal_strength}dBm</span>
                <span class="device-stat-label">Segnale</span>
            </div>
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: 20px;">
            <button class="btn ${device.status.is_locked ? 'btn-primary' : 'btn-success'} btn-block"
                    onclick="toggleLock('${device.id}')">
                <i data-lucide="${device.status.is_locked ? 'unlock' : 'lock'}"></i>
                ${device.status.is_locked ? 'Sblocca' : 'Blocca'}
            </button>
        </div>

        <div style="display: flex; gap: 12px;">
            <button class="btn btn-outline btn-block" onclick="openShareForDevice('${device.id}')">
                <i data-lucide="share-2"></i>
                Condividi
            </button>
            <button class="btn btn-outline btn-block" onclick="showDeviceLocation('${device.id}')">
                <i data-lucide="map-pin"></i>
                Posizione
            </button>
        </div>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-color);">
            <h4 style="font-size: 0.875rem; margin-bottom: 12px;">Ultimo check-in</h4>
            <p style="font-size: 0.875rem; color: var(--text-secondary);">${formatDateTime(new Date(device.status.last_checkin))}</p>
        </div>
    `;

    lucide.createIcons();
    modal.classList.add('active');
}

function toggleLock(deviceId) {
    const device = state.devices.find(d => d.id === deviceId);
    if (!device) return;

    const action = device.status.is_locked ? 'sbloccare' : 'bloccare';

    if (confirm(`Sei sicuro di voler ${action} ${device.name}?`)) {
        // Toggle lock state
        device.status.is_locked = !device.status.is_locked;

        // Add to access log
        state.accessLogs.unshift({
            id: Date.now(),
            device_id: deviceId,
            user: state.user.name,
            action: device.status.is_locked ? 'close' : 'open',
            method: 'app',
            timestamp: new Date(),
            granted: true
        });

        // Re-render affected components
        renderDeviceList();
        renderDevicesGrid();
        renderActivityList();

        closeAllModals();
        showToast(`${device.name} ${device.status.is_locked ? 'bloccato' : 'sbloccato'}`, 'success');
    }
}

function openShareForDevice(deviceId) {
    closeAllModals();
    openShareModal();
    document.getElementById('share-device').value = deviceId;
}

function showDeviceLocation(deviceId) {
    closeAllModals();
    navigateTo('map');
    setTimeout(() => focusDevice(deviceId), 500);
}

// ============================================
// WebSocket (Real-time Updates)
// ============================================

function setupWebSocket() {
    // In production, connect to actual WebSocket server
    console.log('WebSocket connection would be established here');

    // Simulate real-time updates
    setInterval(() => {
        // Random battery drain simulation
        state.devices.forEach(device => {
            if (Math.random() > 0.9) {
                device.status.battery_percent = Math.max(10, device.status.battery_percent - 1);
            }
        });
    }, 30000);
}

// ============================================
// Modals
// ============================================

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        animation: slideUp 0.3s ease;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    `;

    // Add animation
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .toast button {
                background: none;
                border: none;
                color: white;
                font-size: 1.25rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================
// Utility Functions
// ============================================

function formatTime(date) {
    const now = new Date();
    const diff = now - new Date(date);

    if (diff < 60000) return 'Adesso';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min fa`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ore fa`;
    return new Date(date).toLocaleDateString('it-IT');
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('it-IT');
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// CSS for Custom Markers
// ============================================

const markerStyles = document.createElement('style');
markerStyles.textContent = `
    .custom-marker {
        background: none;
        border: none;
    }
    .marker-icon {
        width: 40px;
        height: 40px;
        background: var(--bg-card, #1e1e24);
        border: 2px solid #10b981;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #10b981;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .marker-icon.unlocked {
        border-color: #f59e0b;
        color: #f59e0b;
    }
    .marker-icon svg {
        width: 20px;
        height: 20px;
    }

    #refresh-btn.spinning svg {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(markerStyles);
