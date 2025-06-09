document.addEventListener('DOMContentLoaded', () => {

    const app = {
        elements: {
            loginForm: document.getElementById('loginForm'),
            usernameInput: document.getElementById('username'),
            passwordInput: document.getElementById('password'),
            loginButton: document.getElementById('loginButton'),
            formMessage: document.getElementById('formMessage'),
        },

        init() {
            this.elements.loginForm.addEventListener('submit', (event) => {
                this.handleLogin(event);
            });
        },

        setLoading(isLoading) {
            this.elements.loginButton.disabled = isLoading;
            this.elements.loginButton.textContent = isLoading ? 'Logging in...' : 'Login';
        },

        showMessage(message, type = 'error') {
            const el = this.elements.formMessage;
            el.textContent = message;
            el.className = `form-message ${type}`; // Applies .error class for styling
        },

        hideMessage() {
            const el = this.elements.formMessage;
            el.textContent = '';
            el.className = 'form-message';
        },

        async handleLogin(event) {
            event.preventDefault();
            this.hideMessage();

            const username = this.elements.usernameInput.value.trim();
            const password = this.elements.passwordInput.value.trim();

            // Simple client-side validation
            if (!username || !password) {
                this.showMessage('Both username and password are required.');
                return;
            }
            
            this.setLoading(true);

            try {
                // MOCK API CALL - In a real app, this would be a real fetch
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

                // --- MOCK LOGIC ---
                // Replace this with your actual API call.
                // This is just to demonstrate success/failure.
                if (username === "user" && password === "password") {
                    this.showMessage('Login successful! Redirecting...', 'success');
                     setTimeout(() => {
                        // In a real app, you would redirect to a dashboard
                        // window.location.href = 'dashboard.html';
                        alert('Redirecting to dashboard...');
                    }, 1500);
                } else {
                    throw new Error('Invalid username or password.');
                }
                // --- END MOCK LOGIC ---

            } catch (error) {
                this.showMessage(error.message);
                this.setLoading(false); // Only reset loading on error
                console.error('Login Error:', error);
            }
        },
    };

    app.init();
});