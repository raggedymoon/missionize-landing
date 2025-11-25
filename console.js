/**
 * Missionize Console (Beta)
 * Client-side JavaScript for interacting with Missionize API
 */

const API_BASE_URL = 'https://api.missionize.ai';
const DEFAULT_MISSION = {
    task: 'What is 2+2?',
    require_consensus: true
};

// DOM elements
let apiKeyInput, missionJsonTextarea, runButton, errorDisplay;
let outputContainer, responseSummary, responseRaw, summaryContent, rawJsonContent;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM references
    apiKeyInput = document.getElementById('api-key');
    missionJsonTextarea = document.getElementById('mission-json');
    runButton = document.getElementById('run-button');
    errorDisplay = document.getElementById('error-display');
    outputContainer = document.getElementById('output-container');
    responseSummary = document.getElementById('response-summary');
    responseRaw = document.getElementById('response-raw');
    summaryContent = document.getElementById('summary-content');
    rawJsonContent = document.getElementById('raw-json-content');

    // Attach event listeners
    runButton.addEventListener('click', handleRunMission);

    // Allow Ctrl+Enter to run mission from textarea
    missionJsonTextarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleRunMission();
        }
    });

    console.log('Missionize Console initialized');
});

/**
 * Main handler for running a mission
 */
async function handleRunMission() {
    const apiKey = apiKeyInput.value.trim();

    // Validation
    if (!apiKey) {
        showError('Please enter your API key');
        return;
    }

    // Parse mission payload
    let missionPayload;
    const missionText = missionJsonTextarea.value.trim();

    if (missionText === '') {
        // Use default mission
        missionPayload = DEFAULT_MISSION;
    } else if (missionText.startsWith('{')) {
        // User provided JSON - parse it
        try {
            missionPayload = JSON.parse(missionText);
        } catch (parseError) {
            showError(`Invalid JSON: ${parseError.message}`);
            return;
        }
    } else {
        // User provided natural language - wrap it
        missionPayload = {
            task: missionText,
            require_consensus: true
        };
    }

    // Clear previous errors
    hideError();

    // Show loading state
    setLoadingState(true);

    try {
        // Call API
        const response = await fetch(`${API_BASE_URL}/run-custom`, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(missionPayload)
        });

        // Get response data
        const responseData = await response.json();

        // Handle response
        if (response.ok) {
            displaySuccess(responseData);
        } else {
            displayError(response.status, responseData);
        }

    } catch (fetchError) {
        showError(`Network error: ${fetchError.message}`);
        console.error('Fetch error:', fetchError);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Display successful mission response
 */
function displaySuccess(data) {
    // Hide empty state
    outputContainer.style.display = 'none';

    // Show summary
    responseSummary.style.display = 'block';
    summaryContent.innerHTML = generateSummaryHTML(data);

    // Show raw JSON
    responseRaw.style.display = 'block';
    rawJsonContent.textContent = JSON.stringify(data, null, 2);

    // Scroll to output
    responseSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Display error response from API
 */
function displayError(statusCode, errorData) {
    outputContainer.style.display = 'none';
    responseSummary.style.display = 'none';

    // Show raw error
    responseRaw.style.display = 'block';
    rawJsonContent.textContent = `HTTP ${statusCode}\n\n` + JSON.stringify(errorData, null, 2);

    // Show error message
    showError(`API returned ${statusCode}: ${errorData.detail || errorData.error || 'Unknown error'}`);
}

/**
 * Generate human-readable summary from response data
 */
function generateSummaryHTML(data) {
    let html = '<div class="summary-grid">';

    // Status
    const statusIcon = data.status === 'completed' ? '✅' :
                       data.status === 'failed' ? '❌' :
                       data.status === 'unavailable' ? '⚠️' : '❓';

    html += `
        <div class="summary-item">
            <strong>Status:</strong> ${statusIcon} ${data.status || 'Unknown'}
        </div>
    `;

    // Mission ID
    if (data.mission_id) {
        html += `
            <div class="summary-item">
                <strong>Mission ID:</strong> <code>${data.mission_id}</code>
            </div>
        `;
    }

    // Confidence
    if (data.confidence_score !== undefined) {
        const confidencePercent = Math.round(data.confidence_score * 100);
        html += `
            <div class="summary-item">
                <strong>Confidence:</strong> ${confidencePercent}%
            </div>
        `;
    }

    // Execution time
    if (data.execution_time_seconds !== undefined) {
        html += `
            <div class="summary-item">
                <strong>Execution Time:</strong> ${data.execution_time_seconds}s
            </div>
        `;
    }

    // Final recommendation
    if (data.final_recommendation) {
        html += `
            <div class="summary-item full-width">
                <strong>Recommendation:</strong>
                <div class="recommendation-text">${escapeHtml(data.final_recommendation)}</div>
            </div>
        `;
    }

    // Agent decisions summary
    if (data.agent_decisions && Object.keys(data.agent_decisions).length > 0) {
        html += `
            <div class="summary-item full-width">
                <strong>Agent Decisions:</strong>
                <ul class="agent-list">
        `;

        for (const [agent, decision] of Object.entries(data.agent_decisions)) {
            html += `<li><strong>${capitalizeFirst(agent)}:</strong> `;
            if (decision.recommendation) {
                html += escapeHtml(decision.recommendation.substring(0, 100));
                if (decision.recommendation.length > 100) html += '...';
            } else if (decision.critique) {
                html += escapeHtml(decision.critique.substring(0, 100));
                if (decision.critique.length > 100) html += '...';
            } else if (decision.final_decision) {
                html += escapeHtml(decision.final_decision.substring(0, 100));
                if (decision.final_decision.length > 100) html += '...';
            } else if (decision.decision) {
                html += escapeHtml(decision.decision);
            } else {
                html += '(see raw JSON)';
            }
            html += '</li>';
        }

        html += `
                </ul>
            </div>
        `;
    }

    // Error message
    if (data.error) {
        html += `
            <div class="summary-item full-width error-box">
                <strong>Error:</strong> ${escapeHtml(data.error)}
            </div>
        `;
    }

    // Note (for simulated mode)
    if (data.note) {
        html += `
            <div class="summary-item full-width note-box">
                <strong>Note:</strong> ${escapeHtml(data.note)}
            </div>
        `;
    }

    html += '</div>';
    return html;
}

/**
 * Show error message
 */
function showError(message) {
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError() {
    errorDisplay.style.display = 'none';
}

/**
 * Set loading state for button
 */
function setLoadingState(isLoading) {
    const buttonText = runButton.querySelector('.button-text');
    const spinner = runButton.querySelector('.spinner');

    if (isLoading) {
        runButton.disabled = true;
        runButton.classList.add('loading');
        buttonText.style.display = 'none';
        spinner.style.display = 'inline';
    } else {
        runButton.disabled = false;
        runButton.classList.remove('loading');
        buttonText.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

/**
 * Utility: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Utility: Capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
