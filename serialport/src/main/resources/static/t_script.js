// Wrap all logic in a DOMContentLoaded event listener to ensure the HTML is loaded.
document.addEventListener('DOMContentLoaded', () => {

    /**
     * The main application object.
     * Encapsulates all properties and methods to keep the global scope clean.
     */
    const app = {
        // Cache DOM elements to avoid repeated lookups
        elements: {
            inputText: document.getElementById('inputText'),
            sendButton: document.getElementById('sendButton'),
            terminalOutput: document.getElementById('terminalOutput'),
            historyButton: document.getElementById('historyButton'),
            historyContainer: document.getElementById('historyContainer'),
        },

        /**
         * Initializes the application by setting up event listeners.
         */
        init() {
            this.elements.sendButton.addEventListener('click', () => this.sendText());
            this.elements.historyButton.addEventListener('click', () => this.fetchHistory());
        },

        /**
         * Toggles the disabled state of buttons to provide user feedback during API calls.
         * @param {boolean} isLoading - True if an API call is in progress.
         */
        setLoadingState(isLoading) {
            this.elements.sendButton.disabled = isLoading;
            this.elements.historyButton.disabled = isLoading;
        },

        /**
         * Sends the text from the textarea to the backend API and displays the result.
         */
        async sendText() {
            const text = this.elements.inputText.value;
            if (!text.trim()) {
                this.elements.terminalOutput.textContent = "Please enter a command.";
                return;
            }

            this.setLoadingState(true);
            this.elements.terminalOutput.textContent = 'Processing...';

            try {
                const response = await fetch('/api/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text }),
                });

                if (!response.ok) {
                    // Handle HTTP errors like 404 or 500
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.text();
                this.elements.terminalOutput.textContent = result;

            } catch (error) {
                console.error('Error sending text:', error);
                this.elements.terminalOutput.textContent = `Error: ${error.message}`;
            } finally {
                this.setLoadingState(false);
            }
        },

        /**
         * Fetches command history from the API and renders it to the page.
         */
        async fetchHistory() {
            this.setLoadingState(true);
            this.elements.historyContainer.innerHTML = '<p>Loading history...</p>';

            try {
                const response = await fetch('/api/history/process');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                
                // Check if history is empty
                if (data && data.length > 0) {
                    const historyHtml = data.map(item => `<p>${item.text}</p>`).join('');
                    this.elements.historyContainer.innerHTML = historyHtml;
                } else {
                    this.elements.historyContainer.innerHTML = '<p>No history found.</p>';
                }
            } catch (error) {
                console.error('Error fetching history:', error);
                this.elements.historyContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            } finally {
                this.setLoadingState(false);
            }
        },
    };

    // Start the application
    app.init();
});