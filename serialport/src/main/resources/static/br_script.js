// browser.js
document.addEventListener('DOMContentLoaded', () => {

    const app = {
        elements: {
            outputButton: document.getElementById('outputButton'),
            historyButton: document.getElementById('historyButton'),
            historyContainer: document.getElementById('historyContainer'),
            inputText: document.getElementById('inputText'),
            formMessage: document.getElementById('formMessage'),
        },

        init() {
            this.elements.outputButton.addEventListener('click', () => this.processOutput());
            this.elements.historyButton.addEventListener('click', () => this.toggleHistory());
        },

        setLoadingState(isLoading) {
            this.elements.outputButton.disabled = isLoading;
            this.elements.historyButton.disabled = isLoading;
            this.elements.outputButton.textContent = isLoading ? 'Processing...' : 'Generate Output';
        },

        showMessage(message, type = 'error') {
            this.elements.formMessage.textContent = message;
            this.elements.formMessage.className = `form-message ${type}`;
        },

        hideMessage() {
            this.elements.formMessage.className = 'form-message';
        },

        async processOutput() {
            this.hideMessage();
            const text = this.elements.inputText.value;
            if (!text.trim()) {
                this.showMessage('Please enter some text before generating output.');
                return;
            }

            this.setLoadingState(true);

            try {
                const response = await fetch('/api/output', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text }),
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.statusText}`);
                }

                const result = await response.text();
                window.open(`output.html?text=${encodeURIComponent(result)}`, '_blank');

            } catch (error) {
                console.error('Error:', error);
                this.showMessage(`Failed to get output: ${error.message}`);
            } finally {
                this.setLoadingState(false);
            }
        },
        
        async toggleHistory() {
            const isHidden = this.elements.historyContainer.hidden;
            if (isHidden) {
                this.elements.historyContainer.hidden = false;
                await this.fetchHistory();
            } else {
                this.elements.historyContainer.hidden = true;
            }
        },

        async fetchHistory() {
            this.elements.historyContainer.innerHTML = '<h2>Output History</h2><p>Loading...</p>';
            this.setLoadingState(true);

            try {
                const response = await fetch('/api/history/output');
                if (!response.ok) {
                    throw new Error(`Server error: ${response.statusText}`);
                }
                const data = await response.json();
                
                let content = '<h2>Output History</h2>';
                if (data && data.length > 0) {
                    content += data.map(item => `<div class="history-item">${item.text}</div>`).join('');
                } else {
                    content += '<p>No history found.</p>';
                }
                this.elements.historyContainer.innerHTML = content;

            } catch (error) {
                console.error('Error:', error);
                this.elements.historyContainer.innerHTML = `<h2>Error</h2><p>Could not load history: ${error.message}</p>`;
            } finally {
                this.setLoadingState(false);
            }
        }
    };

    app.init();
});