document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const connectionStatusDiv = document.getElementById('connectionStatus');
    const statusIndicator = connectionStatusDiv.querySelector('.status-indicator');
    const statusText = connectionStatusDiv.querySelector('span');

    const endValueInput = document.getElementById('endValue');
    const messageListDiv = document.getElementById('messageList');
    const signalActionsDiv = document.getElementById('signalActions');

    const numParamsInput = document.getElementById('numDisplayParameters');
    const paramFormsContainer = document.getElementById('displayParameterForms');
    const paramActionsDiv = document.getElementById('parameterActions');

    const screenNumInput = document.getElementById('screenNumber');
    const screenChangeOutput = document.getElementById('screenChangeOutput');
    
    const dateTimeOutput = document.getElementById('dateTimeOutput');
    const hourInput = document.getElementById('hour');
    const minuteInput = document.getElementById('minute');
    const secondInput = document.getElementById('second');
    const dateInput = document.getElementById('date');
    const monthInput = document.getElementById('month');
    const yearInput = document.getElementById('year');

    const loadingOverlay = document.getElementById('loadingOverlay');
    const toastContainer = document.getElementById('toastContainer');
    
    // --- Mock Serial Port ---
    // This simulates the behavior of connecting to and sending data over a serial port.
    const mockSerial = {
        isConnected: false,
        connect: function() {
            return new Promise((resolve, reject) => {
                showLoading(true, 'Connecting to port...');
                setTimeout(() => {
                    const success = Math.random() > 0.1; // 90% chance of success
                    if (success) {
                        this.isConnected = true;
                        statusIndicator.className = 'status-indicator connected';
                        statusText.textContent = 'Connected';
                        showLoading(false);
                        showToast('success', 'Connected', 'Serial port connected successfully.');
                        resolve();
                    } else {
                        this.isConnected = false;
                        statusIndicator.className = 'status-indicator disconnected';
                        statusText.textContent = 'Connection Failed';
                        showLoading(false);
                        showToast('error', 'Connection Failed', 'Could not connect to the serial port.');
                        reject();
                    }
                }, 1500);
            });
        },
        send: function(data) {
            return new Promise((resolve, reject) => {
                if (!this.isConnected) {
                    showToast('error', 'Not Connected', 'Cannot send data.');
                    return reject('Not Connected');
                }
                showLoading(true);
                setTimeout(() => {
                    console.log('Mock Send:', data);
                    showLoading(false);
                    resolve(data);
                }, 700);
            });
        }
    };

    // --- UI Helper Functions ---
    const showLoading = (show, text = 'Processing request...') => {
        const p = loadingOverlay.querySelector('p');
        p.textContent = text;
        if (show) {
            loadingOverlay.classList.add('show');
        } else {
            loadingOverlay.classList.remove('show');
        }
    };

    const showToast = (type, title, message) => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon"></i>
            <div class="toast-content">
                <p class="toast-title">${title}</p>
                <p class="toast-message">${message}</p>
            </div>
        `;
        toastContainer.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Hide and remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 5000);
    };


    // --- Function Implementations ---
    
    // Signal Control
    window.generateMessages = () => {
        const count = parseInt(endValueInput.value, 10);
        if (isNaN(count) || count < 1 || count > 31) {
            showToast('error', 'Invalid Input', 'Please enter a number between 1 and 31.');
            return;
        }

        messageListDiv.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const messageId = `signal_${i}`;
            const item = document.createElement('div');
            item.className = 'message-item';
            item.innerHTML = `
                <h4><i class="fas fa-rss"></i> Signal #${i}</h4>
                <div class="message-controls">
                    <div class="radio-group" data-signal-id="${i}">
                        <div class="radio-option">
                            <input type="radio" id="${messageId}_on" name="${messageId}" value="1" checked>
                            <label for="${messageId}_on">ON</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="${messageId}_off" name="${messageId}" value="0">
                            <label for="${messageId}_off">OFF</label>
                        </div>
                    </div>
                </div>
            `;
            messageListDiv.appendChild(item);
        }
        signalActionsDiv.style.display = 'flex';
    };

    window.sendMessages = () => {
        const signals = [];
        const items = messageListDiv.querySelectorAll('.radio-group');
        items.forEach(item => {
            const signalId = item.getAttribute('data-signal-id');
            const selectedValue = item.querySelector('input[type="radio"]:checked').value;
            signals.push({ id: parseInt(signalId), state: parseInt(selectedValue) });
        });

        if (signals.length === 0) {
            showToast('warning', 'No Signals', 'Generate signals before sending.');
            return;
        }

        const payload = { command: 'set_signals', data: signals };
        mockSerial.send(payload)
            .then(() => showToast('success', 'Sent', `${signals.length} signals sent successfully.`))
            .catch(err => console.error(err));
    };
    
    window.resetAllSignals = () => {
        messageListDiv.innerHTML = '';
        endValueInput.value = '';
        signalActionsDiv.style.display = 'none';
        showToast('info', 'Reset', 'Signal configuration has been cleared.');
    };

    // Display Parameters
    window.generateDisplayParameters = () => {
        const count = parseInt(numParamsInput.value, 10);
        if (isNaN(count) || count < 1) {
            showToast('error', 'Invalid Input', 'Please enter a valid number of parameters.');
            return;
        }

        paramFormsContainer.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const formHtml = `
                <div class="parameter-form" data-param-id="${i}">
                    <div class="parameter-header">
                        <h3><i class="fas fa-sliders-h"></i> Parameter #${i}</h3>
                    </div>
                    <div class="parameter-fields">
                        <div class="input-field">
                            <label for="paramName${i}">Parameter Name</label>
                            <input type="text" id="paramName${i}" class="form-input" placeholder="e.g., Temperature">
                        </div>
                        <div class="input-field">
                            <label for="paramVal${i}">Default Value</label>
                            <input type="text" id="paramVal${i}" class="form-input" placeholder="e.g., 25.5">
                        </div>
                         <div class="input-field">
                            <label for="paramUnit${i}">Unit</label>
                            <input type="text" id="paramUnit${i}" class="form-input" placeholder="e.g., °C">
                        </div>
                    </div>
                </div>
            `;
            paramFormsContainer.insertAdjacentHTML('beforeend', formHtml);
        }
        paramActionsDiv.style.display = 'flex';
    };

    window.sendAllDisplayParameters = () => {
        const parameters = [];
        const forms = paramFormsContainer.querySelectorAll('.parameter-form');
        let isValid = true;
        
        forms.forEach(form => {
            const id = form.dataset.paramId;
            const name = form.querySelector(`#paramName${id}`).value;
            const value = form.querySelector(`#paramVal${id}`).value;
            const unit = form.querySelector(`#paramUnit${id}`).value;

            if (!name || !value) {
                isValid = false;
            }
            parameters.push({ id, name, value, unit });
        });

        if (!isValid) {
            showToast('error', 'Validation Error', 'Parameter Name and Value are required.');
            return;
        }
        
        if (parameters.length === 0) {
            showToast('warning', 'No Parameters', 'Generate parameter forms before sending.');
            return;
        }

        const payload = { command: 'set_parameters', data: parameters };
        mockSerial.send(payload)
            .then(() => showToast('success', 'Sent', `All display parameters sent.`))
            .catch(err => console.error(err));
    };

    // Screen Control
    window.sendScreenChange = () => {
        const screenNum = parseInt(screenNumInput.value, 10);
        if (isNaN(screenNum) || screenNum < 1) {
            showToast('error', 'Invalid Input', 'Please enter a valid screen number.');
            return;
        }
        const payload = { command: 'set_screen', screen: screenNum };
        mockSerial.send(payload)
            .then(data => {
                screenChangeOutput.textContent = `Sent Command: ${JSON.stringify(data)}`;
                showToast('success', 'Sent', `Request to change to screen ${screenNum} sent.`);
            })
            .catch(err => console.error(err));
    };

    // Date & Time
    window.setCurrentDateTime = () => {
        const now = new Date();
        hourInput.value = String(now.getHours()).padStart(2, '0');
        minuteInput.value = String(now.getMinutes()).padStart(2, '0');
        secondInput.value = String(now.getSeconds()).padStart(2, '0');
        dateInput.value = String(now.getDate()).padStart(2, '0');
        monthInput.value = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        yearInput.value = now.getFullYear();
        showToast('info', 'Time Set', 'Current date and time have been populated.');
    };

    window.sendDateTime = () => {
        const payload = {
            command: 'set_datetime',
            data: {
                hour: parseInt(hourInput.value),
                minute: parseInt(minuteInput.value),
                second: parseInt(secondInput.value),
                day: parseInt(dateInput.value),
                month: parseInt(monthInput.value),
                year: parseInt(yearInput.value),
            }
        };

        // Basic validation
        for (const key in payload.data) {
            if (isNaN(payload.data[key])) {
                showToast('error', 'Invalid Input', 'All date and time fields are required.');
                return;
            }
        }
        
        mockSerial.send(payload)
            .then(data => {
                dateTimeOutput.textContent = `Sent Command: ${JSON.stringify(data)}`;
                showToast('success', 'Sent', 'Date & Time information sent successfully.');
            })
            .catch(err => console.error(err));
    };

    // --- Initial Setup ---
    const initialize = () => {
        signalActionsDiv.style.display = 'none';
        paramActionsDiv.style.display = 'none';
        mockSerial.connect();
    };

    initialize();
});