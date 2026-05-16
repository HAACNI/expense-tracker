// auth.js
const loggedInUser = localStorage.getItem("loggedInUser");
const currentPath = window.location.pathname.split('/').pop().toLowerCase();
const publicPages = ['login.html', 'signup.html'];

// Handle potential root paths 
const isRootPath = currentPath === '' || currentPath === 'index.html';

// Redirect logic before DOM loads
if (!loggedInUser && (!publicPages.includes(currentPath) && !isRootPath)) {
    window.location.replace('login.html');
} else if (loggedInUser && publicPages.includes(currentPath)) {
    window.location.replace('dashboard.html');
} else if (!loggedInUser && isRootPath) {
    window.location.replace('login.html');
}

// Navbar dynamic render after DOM loads
document.addEventListener("DOMContentLoaded", function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.innerHTML = '';
        
        const logo = document.createElement('img');
        logo.src = 'trackitlogo.png';
        logo.alt = 'TrackIt Logo';
        logo.className = 'logo';
        navbar.appendChild(logo);
        
        if (loggedInUser) {
            const links = [
                { text: 'Home', href: 'home.html' },
                { text: 'Dashboard', href: 'dashboard.html' },
                { text: 'Add Expenses', href: 'addexpenses.html' }
            ];
            
            links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.href;
                a.innerText = link.text;
                navbar.appendChild(a);
            });

            const logout = document.createElement('a');
            logout.href = '#';
            logout.innerText = 'Logout';
            logout.style.cursor = 'pointer';
            logout.onclick = function(e) {
                e.preventDefault();
                localStorage.removeItem('loggedInUser');
                window.location.replace('login.html');
            };
            navbar.appendChild(logout);

        } else {
            const links = [
                { text: 'Login', href: 'login.html' },
                { text: 'Sign Up', href: 'signup.html' }
            ];
            
            links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.href;
                a.innerText = link.text;
                navbar.appendChild(a);
            });
        }
    }
});
