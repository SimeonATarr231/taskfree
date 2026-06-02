/* Tab switching */
const tabBtns = document.querySelectorAll('.tab-btn');
const formPanels = document.querySelectorAll('.form-panel');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        formPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(target).classList.add('active');
    });
});

/* Help show message */
const showMessage = (elementId, text, type) => {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.className = `message ${type}`;
};

/* Login */
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    if (!email || !password) {
        return showMessage('login-message', 'Please fill in all fields', 'error');
    }

    btn.disabled = true;
    btn.textContent = 'Logging in...';

    try {
        const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage('login-message', data.error, 'error');
        } else {
            showMessage('login-message', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 800);
        }

    } catch (error) {
        showMessage('login-message', 'Could not connect to server', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Login';
    }
});

/* Register */
document.getElementById('register-btn').addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const btn = document.getElementById('register-btn');

    if (!username || !email || !password) {
        return showMessage('register-message', 'Please fill in all fields', 'error');
    }

    btn.disabled = true;
    btn.textContent = 'Creating account...';

    try {
        const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
        showMessage('register-message', data.error, 'error');
        } else {
        showMessage('register-message', 'Account created! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 800);
        }

    } catch (error) {
        showMessage('register-message', 'Could not connect to server', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Create Account';
    }
});

/* This Logic check if user is already logged in */
const checkAuth = async () => {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.loggedIn) {
        window.location.href = '/dashboard.html';
        }
    } catch (error) {
        // Server unreachable — stay on login page
    }
};

checkAuth();