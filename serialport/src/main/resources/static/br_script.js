const outputButton = document.getElementById('outputButton');
const historyButton = document.getElementById('historyButton');
const historyContainer = document.getElementById('historyContainer');
outputButton.addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value;
    fetch('/api/output', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText})
    })
    .then(response => response.text())
    .then(data => {
        window.open('output.html?text=' + data, '_blank');
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

historyButton.addEventListener('click', () => {
    fetch('/api/history/output')
    .then(response => response.json())
    .then(data => {
        historyContainer.innerHTML = '<h2>Output History</h2>' + data.map(item => `<p>${item.text}</p>`).join('');
    })
    .catch(error => {
        console.error('Error:', error);
    });
});