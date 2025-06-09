document.addEventListener('DOMContentLoaded', function() {
    const actionsContainer = document.getElementById('actions-container');
    const actionTemplate = document.querySelector('.action').outerHTML;

    // Add action button
    document.getElementById('add-action').addEventListener('click', function() {
        const newAction = document.createElement('div');
        newAction.innerHTML = actionTemplate;
        newAction.querySelector('.action').querySelectorAll('input').forEach(input => input.value = '');
        actionsContainer.appendChild(newAction);
    });

    // Remove action buttons
    actionsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-action')) {
            const actions = document.querySelectorAll('.action');
            if (actions.length > 1) {
                e.target.closest('.action').remove();
            } else {
                alert('You need at least one test action');
            }
        }
    });

    // Run test button
    document.getElementById('run-test').addEventListener('click', function() {
        const url = document.getElementById('websiteUrl').value.trim();
        if (!url) {
            alert('Please enter a website URL');
            return;
        }

        const actions = [];
        let isValid = true;

        document.querySelectorAll('.action').forEach(actionEl => {
            const actionType = actionEl.querySelector('.action-type').value;
            const elementSelector = actionEl.querySelector('.element-selector').value.trim();
            const inputValue = actionEl.querySelector('.input-value').value.trim();

            // For VERIFY_URL, we don't need element selector
                if (actionType === 'VERIFY_URL') {
                    actions.push({
                        actionType: actionType,
                        inputValue: inputValue  // This will be the expected URL
                    });
                }

            else if (actionType !== 'NAVIGATE' && !elementSelector) {
                alert('Please enter a CSS selector for all actions except "Navigate To URL"');
                isValid = false;
                return;
            } else{
                 actions.push({
                           actionType: actionType,
                           elementSelector: elementSelector,
                           inputValue: inputValue
                       });
            }


        });

        if (!isValid) return;

        const runBtn = document.getElementById('run-test');
        runBtn.disabled = true;
        runBtn.textContent = 'Running Test...';

        fetch('/api/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                actions: actions
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            loadTestResults();
            alert('Test completed successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error running test: ' + error.message);
        })
        .finally(() => {
            runBtn.disabled = false;
            runBtn.textContent = 'Run Test';
        });
    });

    // Load test results
    function loadTestResults() {
        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = '<p>Loading test results...</p>';

        fetch('/api/results')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Expected array but got ' + typeof data);
                }

                if (data.length === 0) {
                    resultsList.innerHTML = '<p>No test results found.</p>';
                    return;
                }

                resultsList.innerHTML = '';

                data.forEach(result => {
                    const resultEl = document.createElement('div');
                    resultEl.className = 'result-item';

                    const title = document.createElement('h3');
                    title.textContent = result.websiteUrl + ' - ' + new Date(result.testDate).toLocaleString();

                    const downloadBtn = document.createElement('button');
                    downloadBtn.className = 'download-btn';
                    downloadBtn.textContent = 'Download Text Report';
                    downloadBtn.addEventListener('click', () => {
                        window.location.href = `/api/tests/results/${result.id}/textfile`;
                    });

                    resultEl.appendChild(title);
                    resultEl.appendChild(downloadBtn);

                    const stepsList = document.createElement('div');
                    stepsList.className = 'steps-container';

                    if (result.steps && Array.isArray(result.steps)) {
                        result.steps.forEach((step, index) => {
                            const stepEl = document.createElement('div');
                            stepEl.className = 'step';

                            const stepHeader = document.createElement('h4');
                            stepHeader.textContent = `Step ${index + 1}: ${step.action}`;

                            const stepDetails = document.createElement('div');

                            // Special handling for VERIFY_URL
                            if (step.action === 'VERIFY_URL') {
                                stepDetails.innerHTML = `
                                    <p><strong>Expected URL:</strong> ${step.input || 'N/A'}</p>
                                    <p><strong>Result:</strong> ${step.output}</p>
                                `;
                            } else {
                                stepDetails.innerHTML = `
                                    <p><strong>Element:</strong> ${step.input || 'N/A'}</p>
                                    <p><strong>Result:</strong> ${step.output}</p>
                                    ${step.timestamp ? `<p><strong>Time:</strong> ${new Date(step.timestamp).toLocaleTimeString()}</p>` : ''}
                                `;
                            }

                            stepEl.appendChild(stepHeader);
                            stepEl.appendChild(stepDetails);
                            stepsList.appendChild(stepEl);
                        });
                    }

                    resultEl.appendChild(stepsList);
                    resultsList.appendChild(resultEl);
                });
            })
            .catch(error => {
                console.error('Error loading results:', error);
                resultsList.innerHTML = `<p>Error loading test results: ${error.message}</p>`;
            });
    }

    // Initial load of test results
    loadTestResults();
});