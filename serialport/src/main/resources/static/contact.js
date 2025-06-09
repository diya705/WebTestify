document.addEventListener('DOMContentLoaded', () => {

    const app = {
        elements: {
            contactForm: document.getElementById('contactForm'),
            fullNameInput: document.getElementById('fullName'),
            emailInput: document.getElementById('email'),
            messageInput: document.getElementById('message'),
            submitButton: document.getElementById('submitButton'),
            formMessage: document.getElementById('formMessage'),
        },

        init() {
            if (this.elements.contactForm) {
                this.elements.contactForm.addEventListener('submit', (event) => {
                    this.handleSubmit(event);
                });
            }
        },

        setLoading(isLoading) {
            this.elements.submitButton.disabled = isLoading;
            this.elements.submitButton.textContent = isLoading ? 'Sending...' : 'Send Message';
        },

        showMessage(message, type) {
            const el = this.elements.formMessage;
            el.textContent = message;
            el.className = `form-message ${type}`; // Applies .error or .success
        },

        hideMessage() {
            const el = this.elements.formMessage;
            el.className = 'form-message';
        },
        
        validateForm(name, email, message) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!name || !email || !message) {
                this.showMessage('Please fill out all fields.', 'error');
                return false;
            }

            if (!emailRegex.test(email)) {
                this.showMessage('Please enter a valid email address.', 'error');
                return false;
            }
            return true;
        },

        async handleSubmit(event) {
            event.preventDefault();
            this.hideMessage();

            const fullName = this.elements.fullNameInput.value.trim();
            const email = this.elements.emailInput.value.trim();
            const message = this.elements.messageInput.value.trim();

            if (!this.validateForm(fullName, email, message)) {
                return;
            }
            
            this.setLoading(true);

            try {
                // In a real app, this would be a real fetch call
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
                
                // const response = await fetch('/api/contact', { ... });
                // if (!response.ok) throw new Error('Network response was not ok.');
                
                this.showMessage('Your message has been sent successfully! We will get back to you shortly.', 'success');
                this.elements.contactForm.reset(); // Clear the form

            } catch (error) {
                this.showMessage('There was an error sending your message. Please try again.', 'error');
                console.error('Submit Error:', error);
            } finally {
                this.setLoading(false);
            }
        },
    };

    app.init();
});