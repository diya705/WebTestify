document.addEventListener('DOMContentLoaded', () => {

    const app = {
        elements: {
            registerForm: document.getElementById('registerForm'),
            fullNameInput: document.getElementById('fullName'),
            emailInput: document.getElementById('email'),
            passwordInput: document.getElementById('password'),
            confirmPasswordInput: document.getElementById('confirmPassword'),
            registerButton: document.getElementById('registerButton'),
            formMessage: document.getElementById('formMessage'),
        },

        init() {
            this.elements.registerForm.addEventListener('submit', (event) => {
                this.handleRegistration(event);
            });
        },

        setLoading(isLoading) {
            this.elements.registerButton.disabled = isLoading;
            this.elements.registerButton.textContent = isLoading ? 'Registering...' : 'Register';
        },

        showMessage(message, type = 'error') {
            const el = this.elements.formMessage;
            el.textContent = message;
            el.className = `form-message ${type}`; // Applies .error or .success class for styling
        },

        hideMessage() {
            const el = this.elements.formMessage;
            el.textContent = '';
            el.className = 'form-message';
        },

        validateForm(fullName, email, password, confirmPassword) {
            // Basic regex for email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!fullName || !email || !password || !confirmPassword) {
                this.showMessage('All fields are required.');
                return false;
            }
            if (!emailRegex.test(email)) {
                this.showMessage('Please enter a valid email address.');
                return false;
            }
            if (password.length < 8) {
                this.showMessage('Password must be at least 8 characters long.');
                return false;
            }
            if (password !== confirmPassword) {
                this.showMessage('Passwords do not match.');
                return false;
            }
            return true;
        },

        async handleRegistration(event) {
            event.preventDefault();
            this.hideMessage();

            const fullName = this.elements.fullNameInput.value.trim();
            const email = this.elements.emailInput.value.trim();
            const password = this.elements.passwordInput.value.trim();
            const confirmPassword = this.elements.confirmPasswordInput.value.trim();

            // Perform validation before sending request
            if (!this.validateForm(fullName, email, password, confirmPassword)) {
                return;
            }
            
            this.setLoading(true);

            try {
                const response = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: fullName, email, password }), // username is often the email
                });

                const data = await response.json();

                if (!response.ok) {
                    // Use server-side error message if available
                    throw new Error(data.message || 'Registration failed.');
                }
                
                this.showMessage('Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                this.showMessage(error.message);
                this.setLoading(false); // Only reset loading on error
                console.error('Registration Error:', error);
            }
        },
    };

    app.init();
});