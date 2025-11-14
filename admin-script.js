// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.siteStatus = true;
        this.maintenanceMode = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStoredData();
        this.updateLastUpdate();
        setInterval(() => this.updateLastUpdate(), 60000); // Update every minute
    }

    bindEvents() {
        // Login
        document.getElementById('admin-login').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Site status toggle
        document.getElementById('site-status').addEventListener('change', (e) => {
            this.toggleSiteStatus(e.target.checked);
        });

        // Quick actions
        document.getElementById('maintenance-mode').addEventListener('click', () => {
            this.toggleMaintenanceMode();
        });

        document.getElementById('emergency-close').addEventListener('click', () => {
            this.emergencyClose();
        });

        document.getElementById('backup-data').addEventListener('click', () => {
            this.backupData();
        });

        // Exit maintenance
        document.getElementById('exit-maintenance').addEventListener('click', () => {
            this.exitMaintenance();
        });

        // Class capacity updates
        document.querySelectorAll('.class-controls button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateClassCapacity(e.target);
            });
        });

        // Announcements
        document.getElementById('publish-announcement').addEventListener('click', () => {
            this.publishAnnouncement();
        });

        document.getElementById('remove-announcement').addEventListener('click', () => {
            this.removeAnnouncement();
        });
    }

    handleLogin() {
        const username = document.getElementById('admin-user').value;
        const password = document.getElementById('admin-pass').value;
        const errorDiv = document.getElementById('login-error');

        // Simple authentication (in production, use proper backend authentication)
        if (username === 'admin' && password === 'ananda2025') {
            this.isLoggedIn = true;
            this.showDashboard();
            this.saveToStorage('isLoggedIn', true);
            errorDiv.textContent = '';
        } else {
            errorDiv.textContent = 'Usuario o contraseña incorrectos';
            this.shakeElement(document.querySelector('.login-container'));
        }
    }

    handleLogout() {
        this.isLoggedIn = false;
        this.saveToStorage('isLoggedIn', false);
        this.showLogin();
    }

    showDashboard() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('maintenance-screen').classList.add('hidden');
    }

    showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('maintenance-screen').classList.add('hidden');
    }

    showMaintenance() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('maintenance-screen').classList.remove('hidden');
    }

    toggleSiteStatus(status) {
        this.siteStatus = status;
        const statusText = document.getElementById('site-status-text');
        statusText.textContent = status ? 'Activo' : 'Inactivo';
        statusText.style.color = status ? 'var(--admin-success)' : 'var(--admin-danger)';
        
        this.saveToStorage('siteStatus', status);
        this.showNotification(status ? 'Sitio activado' : 'Sitio desactivado', status ? 'success' : 'warning');
        
        // In a real implementation, this would make an API call to update the site status
        this.updateMainSite(status);
    }

    toggleMaintenanceMode() {
        this.maintenanceMode = !this.maintenanceMode;
        
        if (this.maintenanceMode) {
            this.showMaintenance();
            this.showNotification('Modo mantenimiento activado', 'info');
        } else {
            this.showDashboard();
            this.showNotification('Modo mantenimiento desactivado', 'success');
        }
        
        this.saveToStorage('maintenanceMode', this.maintenanceMode);
    }

    emergencyClose() {
        if (confirm('¿Estás seguro de cerrar el sitio por emergencia?')) {
            this.siteStatus = false;
            document.getElementById('site-status').checked = false;
            this.toggleSiteStatus(false);
            this.showNotification('Sitio cerrado por emergencia', 'error');
        }
    }

    exitMaintenance() {
        this.maintenanceMode = false;
        this.saveToStorage('maintenanceMode', false);
        this.showDashboard();
        this.showNotification('Saliendo del modo mantenimiento', 'success');
    }

    backupData() {
        this.showNotification('Iniciando respaldo...', 'info');
        
        // Simulate backup process
        setTimeout(() => {
            const backupData = {
                timestamp: new Date().toISOString(),
                siteStatus: this.siteStatus,
                bookings: this.getStoredData('bookings') || [],
                classes: this.getStoredData('classes') || []
            };
            
            // In a real implementation, this would send data to a server
            this.saveToStorage('lastBackup', backupData);
            this.showNotification('Respaldo completado exitosamente', 'success');
        }, 2000);
    }

    updateClassCapacity(button) {
        const classItem = button.closest('.class-item');
        const input = classItem.querySelector('.capacity-input');
        const className = classItem.querySelector('h4').textContent;
        const newCapacity = parseInt(input.value);
        
        if (newCapacity >= 0 && newCapacity <= 20) {
            // Update the main site's class capacity
            this.updateMainSiteCapacity(className, newCapacity);
            this.showNotification(`Capacidad de ${className} actualizada a ${newCapacity}`, 'success');
            
            // Save to storage
            const classes = this.getStoredData('classes') || {};
            classes[className] = newCapacity;
            this.saveToStorage('classes', classes);
        } else {
            this.showNotification('La capacidad debe estar entre 0 y 20', 'error');
            input.value = input.getAttribute('value'); // Reset to original value
        }
    }

    publishAnnouncement() {
        const text = document.getElementById('announcement-text').value.trim();
        const type = document.getElementById('announcement-type').value;
        
        if (text) {
            const announcement = { text, type, timestamp: new Date().toISOString() };
            this.saveToStorage('currentAnnouncement', announcement);
            
            // Show in current announcements
            const preview = document.getElementById('announcement-preview');
            const container = document.getElementById('current-announcement');
            
            preview.textContent = text;
            container.className = `current-announcement ${type}`;
            container.classList.remove('hidden');
            
            // Clear form
            document.getElementById('announcement-text').value = '';
            
            this.showNotification('Anuncio publicado', 'success');
            
            // Update main site
            this.updateMainSiteAnnouncement(announcement);
        } else {
            this.showNotification('Escribe un mensaje para el anuncio', 'warning');
        }
    }

    removeAnnouncement() {
        this.saveToStorage('currentAnnouncement', null);
        document.getElementById('current-announcement').classList.add('hidden');
        this.showNotification('Anuncio removido', 'info');
        
        // Remove from main site
        this.updateMainSiteAnnouncement(null);
    }

    updateMainSite(status) {
        // In a real implementation, this would make API calls to update the main site
        // For now, we'll use localStorage to simulate the communication
        localStorage.setItem('mainSiteStatus', JSON.stringify({
            active: status,
            timestamp: new Date().toISOString()
        }));
    }

    updateMainSiteCapacity(className, capacity) {
        const capacities = JSON.parse(localStorage.getItem('mainSiteCapacities') || '{}');
        capacities[className] = capacity;
        localStorage.setItem('mainSiteCapacities', JSON.stringify(capacities));
    }

    updateMainSiteAnnouncement(announcement) {
        localStorage.setItem('mainSiteAnnouncement', JSON.stringify(announcement));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--admin-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info'});
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
        
        // Add shake animation if not exists
        if (!document.querySelector('#shake-style')) {
            const style = document.createElement('style');
            style.id = 'shake-style';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateLastUpdate() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('last-update').textContent = `Hoy ${timeString}`;
    }

    saveToStorage(key, value) {
        localStorage.setItem(`admin_${key}`, JSON.stringify(value));
    }

    getStoredData(key) {
        const data = localStorage.getItem(`admin_${key}`);
        return data ? JSON.parse(data) : null;
    }

    loadStoredData() {
        // Load login status
        const isLoggedIn = this.getStoredData('isLoggedIn');
        if (isLoggedIn) {
            this.isLoggedIn = true;
            this.showDashboard();
        }

        // Load site status
        const siteStatus = this.getStoredData('siteStatus');
        if (siteStatus !== null) {
            this.siteStatus = siteStatus;
            document.getElementById('site-status').checked = siteStatus;
            this.toggleSiteStatus(siteStatus);
        }

        // Load maintenance mode
        const maintenanceMode = this.getStoredData('maintenanceMode');
        if (maintenanceMode && this.isLoggedIn) {
            this.maintenanceMode = true;
            this.showMaintenance();
        }

        // Load current announcement
        const announcement = this.getStoredData('currentAnnouncement');
        if (announcement) {
            const preview = document.getElementById('announcement-preview');
            const container = document.getElementById('current-announcement');
            
            preview.textContent = announcement.text;
            container.className = `current-announcement ${announcement.type}`;
            container.classList.remove('hidden');
        }

        // Simulate loading bookings and stats
        this.loadStats();
    }

    loadStats() {
        // Simulate real-time stats
        const stats = {
            todayBookings: Math.floor(Math.random() * 20) + 5,
            totalClients: Math.floor(Math.random() * 100) + 100
        };

        document.getElementById('today-bookings').textContent = stats.todayBookings;
        document.getElementById('total-clients').textContent = stats.totalClients;
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});

// Add some utility functions for mobile optimization
function optimizeForMobile() {
    // Prevent zoom on input focus (mobile)
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
        });
        
        input.addEventListener('blur', () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            viewport.setAttribute('content', 'width=device-width, initial-scale=1');
        });
    });
}

// Call mobile optimization
document.addEventListener('DOMContentLoaded', optimizeForMobile);