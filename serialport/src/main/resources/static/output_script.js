window.addEventListener('DOMContentLoaded', () => {
    const outputElement = document.getElementById('outputText');
    
    // Create a URLSearchParams object from the current URL
    const params = new URLSearchParams(window.location.search);
    
    // Get the 'text' parameter
    const text = params.get('text');
    
    if (text) {
        // Decode the text from the URL and display it
        outputElement.textContent = decodeURIComponent(text);
    } else {
        outputElement.textContent = 'No output received.';
    }
});