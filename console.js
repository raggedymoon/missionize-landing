/**
 * Missionize Console (Beta)
 * Client-side JavaScript for interacting with Missionize API
 */

const API_BASE_URL = 'https://api.missionize.ai';
const DEFAULT_MISSION = {
    task: 'What is 2+2?',
    require_consensus: true
};
const API_KEY_STORAGE_KEY = 'missionize_api_key';
const REQUEST_TIMEOUT_MS = 120000; // 120 seconds

// DOM elements
let apiKeyInput, missionJsonTextarea, runButton, errorDisplay, loadingMessage;
let outputContainer, responseSummary, responseRaw, summaryContent, rawJsonContent;
let progressBarContainer, progressBarFill;

// Timer tracking
let elapsedTimer = null;
let requestStartTime = null;
let abortController = null;

// Progress tracking
let fakeProgressInterval = null;
let fakeProgress = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM references
    apiKeyInput = document.getElementById('api-key');
    missionJsonTextarea = document.getElementById('mission-json');
    runButton = document.getElementById('run-button');
    errorDisplay = document.getElementById('error-display');
    loadingMessage = document.getElementById('loading-message');
    outputContainer = document.getElementById('output-container');
    responseSummary = document.getElementById('response-summary');
    responseRaw = document.getElementById('response-raw');
    summaryContent = document.getElementById('summary-content');
    rawJsonContent = document.getElementById('raw-json-content');
    progressBarContainer = document.getElementById('progress-bar-container');
    progressBarFill = document.getElementById('progress-bar-fill');

    // Load saved API key from localStorage
    loadSavedApiKey();

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
 * Load saved API key from localStorage
 */
function loadSavedApiKey() {
    try {
        const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (savedKey) {
            apiKeyInput.value = savedKey;
            console.log('[CONSOLE] ✓ Loaded API key from localStorage (length:', savedKey.length, ')');
        } else {
            console.log('[CONSOLE] No saved API key found in localStorage');
        }
    } catch (e) {
        console.error('[CONSOLE] ✗ Failed to load saved API key:', e);
    }
}

/**
 * Save API key to localStorage
 */
function saveApiKey(apiKey) {
    try {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        console.log('[CONSOLE] ✓ Saved API key to localStorage (length:', apiKey.length, ')');
    } catch (e) {
        console.error('[CONSOLE] ✗ Failed to save API key:', e);
    }
}

/**
 * Update loading message with elapsed time
 */
function updateLoadingMessage(seconds) {
    if (loadingMessage) {
        loadingMessage.innerHTML = `⏳ <strong>Processing with 5 AI agents...</strong> (${seconds}s)`;
    }
}

/**
 * Start elapsed time counter
 */
function startElapsedTimer() {
    requestStartTime = Date.now();
    let elapsed = 0;

    updateLoadingMessage(elapsed);

    elapsedTimer = setInterval(() => {
        elapsed = Math.floor((Date.now() - requestStartTime) / 1000);
        updateLoadingMessage(elapsed);
    }, 1000);
}

/**
 * Stop elapsed time counter
 */
function stopElapsedTimer() {
    if (elapsedTimer) {
        clearInterval(elapsedTimer);
        elapsedTimer = null;
    }
    requestStartTime = null;
}

/**
 * Update progress bar to specified percentage
 */
function updateProgress(pct) {
    if (progressBarFill) {
        progressBarFill.style.width = pct + '%';
    }
}

/**
 * Start fake progress animation
 * Increments by 10% every 3 seconds, capped at 90%
 */
function startFakeProgress() {
    fakeProgress = 5;  // Start at 5%
    updateProgress(fakeProgress);

    // Show progress bar
    if (progressBarContainer) {
        progressBarContainer.style.display = 'block';
    }

    // Animate fake progress every 3 seconds
    fakeProgressInterval = setInterval(() => {
        if (fakeProgress < 90) {
            fakeProgress = Math.min(fakeProgress + 10, 90);
            updateProgress(fakeProgress);
        }
    }, 3000);
}

/**
 * Stop fake progress animation
 */
function stopFakeProgress() {
    if (fakeProgressInterval) {
        clearInterval(fakeProgressInterval);
        fakeProgressInterval = null;
    }
}

/**
 * Hide progress bar
 */
function hideProgressBar() {
    if (progressBarContainer) {
        progressBarContainer.style.display = 'none';
    }
    updateProgress(0);
    fakeProgress = 0;
}

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

    // Force FAST mode to prevent timeout (reduces response time from 50-75s to ~5s)
    missionPayload.execution_mode = "fast";

    // Clear previous errors and responses
    hideError();
    hideLoadingMessage();
    hideProgressBar();

    // Show loading state
    setLoadingState(true);
    showLoadingMessage();
    startElapsedTimer();
    startFakeProgress();

    console.log('[CONSOLE] → Starting mission:', missionPayload);
    console.log('[CONSOLE] → Calling API:', `${API_BASE_URL}/run-custom`);

    // Create abort controller for timeout
    abortController = new AbortController();
    const timeoutId = setTimeout(() => {
        if (abortController) {
            abortController.abort();
        }
    }, REQUEST_TIMEOUT_MS);

    try {
        // Call API with timeout
        const response = await fetch(`${API_BASE_URL}/run-custom`, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(missionPayload),
            signal: abortController.signal
        });

        // Clear timeout if request completed
        clearTimeout(timeoutId);

        console.log('[CONSOLE] ← API response status:', response.status);

        // Get response data
        const responseData = await response.json();

        console.log('[CONSOLE] ← API response data:', responseData);

        // Handle response
        if (response.ok) {
            console.log('[CONSOLE] ✓ Mission successful');

            // Update progress from backend if available
            if (responseData.progress_events && responseData.progress_events.length > 0) {
                const lastProgress = responseData.progress_events[responseData.progress_events.length - 1];
                stopFakeProgress();
                updateProgress(lastProgress.pct);
            }

            // Set progress to 100% on completion
            stopFakeProgress();
            updateProgress(100);

            displaySuccess(responseData);
            // Save API key on successful request
            saveApiKey(apiKey);
        } else {
            console.error('[CONSOLE] ✗ Mission failed with status:', response.status);
            displayError(response.status, responseData);
        }

    } catch (fetchError) {
        // Clear timeout
        clearTimeout(timeoutId);

        console.error('[CONSOLE] ✗ Fetch error:', fetchError);

        // Handle abort (timeout)
        if (fetchError.name === 'AbortError') {
            console.error('[CONSOLE] ✗ Request timed out after 120 seconds');
            showError(`⏱️ Request timed out after 2 minutes. The AI agents may still be processing — please try again or simplify the mission.`);
        } else {
            console.error('[CONSOLE] ✗ Network error:', fetchError.message);
            showError(`Network error: ${fetchError.message}`);

            // Log to Infra Doctor (non-blocking)
            logInfraErrorToApi(`Console network error: ${fetchError.message}`, {
                error: String(fetchError),
                origin: window.location.origin,
                api_base: API_BASE_URL,
                user_agent: navigator.userAgent
            });
        }
    } finally {
        // Always clean up loading state
        setLoadingState(false);
        hideLoadingMessage();
        stopElapsedTimer();
        stopFakeProgress();
        abortController = null;

        // Hide progress bar after a short delay to show completion
        setTimeout(() => {
            hideProgressBar();
        }, 2000);
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
 * Get status display information based on response data
 */
function getStatusDisplay(response) {
    const status = response?.status;
    const note = response?.note || "";

    // Degraded mode: status="unavailable" + note mentions "degraded single-agent"
    if (status === "unavailable" && note.toLowerCase().includes("degraded single-agent")) {
        return {
            text: "Degraded Mode (Single Agent)",
            className: "status-degraded",
            icon: "⚠️"
        };
    }

    // Full consensus success
    if (status === "completed") {
        return {
            text: "Full Consensus",
            className: "status-success",
            icon: "✅"
        };
    }

    // Failed
    if (status === "failed") {
        return {
            text: "Failed",
            className: "status-error",
            icon: "❌"
        };
    }

    // Blocked
    if (status === "blocked") {
        return {
            text: "Blocked",
            className: "status-error",
            icon: "🚫"
        };
    }

    // Generic unavailable (not degraded mode)
    if (status === "unavailable") {
        return {
            text: "Unavailable",
            className: "status-error",
            icon: "❌"
        };
    }

    // Unknown
    return {
        text: status || "Unknown",
        className: "status-error",
        icon: "❓"
    };
}

/**
 * Generate human-readable summary from response data
 */
function generateSummaryHTML(data) {
    let html = '<div class="summary-grid">';

    // Status - use helper to get styled display
    const statusDisplay = getStatusDisplay(data);

    html += `
        <div class="summary-item">
            <strong>Status:</strong> <span class="${statusDisplay.className}">${statusDisplay.icon} ${statusDisplay.text}</span>
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
 * Show loading message
 */
function showLoadingMessage() {
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }
}

/**
 * Hide loading message
 */
function hideLoadingMessage() {
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
        loadingMessage.textContent = '';
    }
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

/**
 * Log infrastructure errors to the API for Infra Doctor diagnostics
 * Non-blocking - won't break the UI if it fails
 */
async function logInfraErrorToApi(errorMessage, extraContext) {
    try {
        await fetch(`${API_BASE_URL}/infra/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                level: 'ERROR',
                source: 'console',
                event_type: 'CORS_OR_NETWORK_ERROR',
                message: errorMessage,
                context: extraContext || {}
            })
        });
    } catch (e) {
        // Silently fail - don't break the UI
        console.warn('Failed to log infra error:', e);
    }
}
