// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.userSession || !window.userSession.token) {
        //window.location.href = 'index.html';
        return;
    }

    // Initialize theme toggle
    initThemeToggle();
    
    // Load user data
    loadUserProfile();
    
    // Navigation handling
    setupNavigation();
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Profile image upload
    document.getElementById('change-avatar-btn').addEventListener('click', function() {
        document.getElementById('avatar-upload').click();
    });
    
    document.getElementById('avatar-upload').addEventListener('change', handleAvatarUpload);
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get the section to show
            const sectionId = this.getAttribute('data-section') + '-section';
            
            // Hide all sections
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected section
            document.getElementById(sectionId).classList.add('active');
            
            // Update dashboard title
            document.getElementById('dashboard-title').textContent = this.querySelector('span').textContent;
        });
    });
}

async function loadUserProfile() {
    try {
        // Fetch user data from server
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${window.userSession.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        const user = data.user;
        
        // Update header
        document.getElementById('header-user-name').textContent = user.name;
        document.getElementById('header-user-role').textContent = user.role;
        
        // Update profile section
        document.getElementById('profile-name').textContent = user.name;
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-role').textContent = user.role;
        
        // Format dates
        const createdDate = new Date(user.createdAt).toLocaleDateString();
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'First login';
        
        document.getElementById('profile-created').textContent = createdDate;
        document.getElementById('profile-last-login').textContent = lastLogin;
        
        // Load avatar (if exists)
        loadAvatar(user.email);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load user profile');
    }
}

async function loadAvatar(email) {
    try {
        // In a real app, you would fetch the avatar from your server
        // For now, we'll use a placeholder or Gravatar as an example
        const avatarUrl = `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?d=identicon&s=150`;
        
        // Set avatar images
        document.getElementById('avatar-image').src = avatarUrl;
        document.getElementById('profile-avatar-image').src = avatarUrl;
        
    } catch (error) {
        console.error('Error loading avatar:', error);
        // Fallback to placeholder
        document.getElementById('avatar-image').src = 'https://via.placeholder.com/150';
        document.getElementById('profile-avatar-image').src = 'https://via.placeholder.com/150';
    }
}

async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        // In a real app, you would upload this to your server
        // For now, we'll just display it locally
        const reader = new FileReader();
        
        reader.onload = function(event) {
            document.getElementById('avatar-image').src = event.target.result;
            document.getElementById('profile-avatar-image').src = event.target.result;
            
            // Here you would typically send the image to your server
            // uploadAvatarToServer(file, window.userSession.user.email);
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload avatar');
    }
}

// Simple MD5 function for Gravatar (not cryptographically secure)
function md5(string) {
    return CryptoJS.MD5(string).toString();
}

// Theme toggle (reused from script.js)
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            window.themePreference = newTheme;
        });
        
        // Set default theme
        const defaultTheme = window.themePreference || 'light';
        document.documentElement.setAttribute('data-theme', defaultTheme);
    }
}

// Logout function (reused from script.js)
function logout() {
    window.userSession = null;
    window.location.href = 'index.html';
}