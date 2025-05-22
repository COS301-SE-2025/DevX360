// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme preference or use system preference
const currentTheme = localStorage.getItem('theme') || 
                     (prefersDarkScheme.matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);

// Update the toggle icon based on current theme
updateToggleIcon();

themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
    updateToggleIcon();
});

function updateToggleIcon() {
    const theme = document.documentElement.getAttribute('data-theme');
    const icon = themeToggle.querySelector('svg');
    if (theme === 'dark') {
        icon.innerHTML = `
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
    } else {
        icon.innerHTML = `
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
    }
}

// Tab switching functionality
function switchTab(tabName) {
    // Switch tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().includes(tabName)) {
            tab.classList.add('active');
        }
    });
    
    // Show corresponding form
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
        if (form.id.includes(tabName)) {
            form.classList.add('active');
        }
    });
    
    // Show invite field if it's signup and we're in invite-only mode
    if (tabName === 'signup' && isInviteOnlyMode()) {
        document.getElementById('invite-field').classList.add('show');
    } else {
        document.getElementById('invite-field').classList.remove('show');
    }
}

function isInviteOnlyMode() {
    // In a real app, this would check your configuration
    return false; // Change to true for invite-only mode
}

// Form submission handlers
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // In a real app, you would handle login here
    console.log('Login submitted');
    
    // For demo: Show MFA prompt (would be conditional in real app)
    document.getElementById('mfa-prompt').classList.add('show');
});

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // In a real app, you would handle registration here
    console.log('Registration submitted');
    
    // In a real app, you would send verification email here
    alert('Verification email sent! Please check your inbox.');
});