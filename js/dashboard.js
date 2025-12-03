/**
 * Missionize Dashboard
 * Unified dashboard with console, API keys, and profile management
 */

const API_BASE_URL = 'https://api.missionize.ai';
const REQUEST_TIMEOUT_MS = 120000; // 120 seconds

// State
let currentUser = null;
let currentApiKeys = [];
let selectedApiKey = null;
let elapsedTimer = null;
let requestStartTime = null;

// ============================================================
// Initialization
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    await initDashboard();
});

async function initDashboard() {
    // Check auth
    const jwt = localStorage.getItem('missionize_jwt');
    if (!jwt) {
        window.location.href = 'login.html';
        return;
    }

    // Load user profile
    await loadProfile();

    // Load API keys
    await loadApiKeys();

    // Setup event listeners
    setupEventListeners();

    // Select first API key if available
    if (currentApiKeys.length > 0) {
        selectedApiKey = currentApiKeys[0].key_prefix;
    }
}

// ============================================================
// Tab Navigation
// ============================================================

function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Console
    document.getElementById('run-mission-btn').addEventListener('click', handleRunMission);
    document.getElementById('mission-input').addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleRunMission();
        }
    });

    // API Keys
    document.getElementById('create-key-btn').addEventListener('click', () => showModal('create-key-modal'));
    document.getElementById('cancel-create-key').addEventListener('click', () => hideModal('create-key-modal'));
    document.getElementById('confirm-create-key').addEventListener('click', handleCreateKey);
    document.getElementById('close-new-key-modal').addEventListener('click', () => hideModal('new-key-modal'));
    document.getElementById('copy-key-btn').addEventListener('click', handleCopyKey);

    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

function switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// ============================================================
// Profile Management
// ============================================================

async function loadProfile() {
    try {
        const jwt = localStorage.getItem('missionize_jwt');
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        currentUser = await response.json();
        updateProfileUI();
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('Failed to load profile', 'error');
    }
}

function updateProfileUI() {
    if (!currentUser) return;

    // Header
    document.getElementById('user-email').textContent = currentUser.email;

    // Profile tab
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-plan').textContent = currentUser.plan || 'Free';
    document.getElementById('profile-created').textContent = new Date(currentUser.created_at).toLocaleDateString();
}

// ============================================================
// Console Functionality
// ============================================================

async function handleRunMission() {
    const input = document.getElementById('mission-input').value.trim();

    if (!input) {
        showAlert('Please enter a task or JSON payload', 'error');
        return;
    }

    // Get JWT token for authentication
    // Note: We no longer check for missionize_api_key - the backend will resolve it from JWT
    const jwt = localStorage.getItem('missionize_jwt');

    // Parse input
    let missionPayload;
    if (input.startsWith('{')) {
        try {
            missionPayload = JSON.parse(input);
        } catch (e) {
            showAlert(`Invalid JSON: ${e.message}`, 'error');
            return;
        }
    } else {
        missionPayload = {
            task: input,
            require_consensus: true
        };
    }

    // Force FAST mode to prevent timeout
    missionPayload.execution_mode = "fast";

    // Clear previous results
    hideElement('output-empty-state');
    hideElement('response-summary');
    hideElement('response-raw');
    hideAlert();

    // Show loading state
    setLoadingState(true);
    showElement('loading-message');
    showElement('progress-bar-container');
    startElapsedTimer();
    updateProgress(5);

    console.log('[DASHBOARD] → Starting mission:', missionPayload);

    try {
        const response = await fetch(`${API_BASE_URL}/run-custom`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(missionPayload),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });

        const data = await response.json();
        console.log('[DASHBOARD] ← Response:', data);

        if (response.ok) {
            updateProgress(100);
            displaySuccess(data);
            showAlert('Mission completed successfully!', 'success');
        } else {
            displayError(response.status, data);

            // Special handling for "No API key found" error
            if (response.status === 400 && data.detail && data.detail.includes('No API key found')) {
                showAlert('No API key found. Please create an API key in the API Keys tab first.', 'error');
            } else {
                showAlert(`Mission failed: ${data.detail || data.error || 'Unknown error'}`, 'error');
            }
        }
    } catch (error) {
        console.error('[DASHBOARD] ✗ Error:', error);
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            showAlert('⏱️ Request timed out after 2 minutes. Please try a simpler mission or contact support.', 'error');
        } else {
            showAlert(`Network error: ${error.message}`, 'error');
        }
    } finally {
        setLoadingState(false);
        hideElement('loading-message');
        stopElapsedTimer();
        setTimeout(() => {
            hideElement('progress-bar-container');
            updateProgress(0);
        }, 2000);
    }
}

function displaySuccess(data) {
    const summaryContent = document.getElementById('summary-content');
    summaryContent.innerHTML = generateSummaryHTML(data);
    showElement('response-summary');

    const rawJsonContent = document.getElementById('raw-json-content');
    rawJsonContent.textContent = JSON.stringify(data, null, 2);
    showElement('response-raw');
}

function displayError(statusCode, errorData) {
    const rawJsonContent = document.getElementById('raw-json-content');
    rawJsonContent.textContent = `HTTP ${statusCode}\n\n` + JSON.stringify(errorData, null, 2);
    showElement('response-raw');
}

function generateSummaryHTML(data) {
    let html = '<div class="summary-grid">';

    // Status
    const statusClass = data.status === 'completed' ? 'status-success' :
                       data.status === 'failed' ? 'status-error' : 'status-degraded';
    html += `
        <div class="summary-item">
            <strong>Status:</strong>
            <span class="${statusClass}">${data.status || 'Unknown'}</span>
        </div>
    `;

    // Mission ID
    if (data.mission_id) {
        html += `
            <div class="summary-item">
                <strong>Mission ID:</strong>
                <code>${data.mission_id}</code>
            </div>
        `;
    }

    // Confidence
    if (data.confidence_score !== undefined) {
        html += `
            <div class="summary-item">
                <strong>Confidence:</strong>
                ${Math.round(data.confidence_score * 100)}%
            </div>
        `;
    }

    // Execution time
    if (data.execution_time_seconds !== undefined) {
        html += `
            <div class="summary-item">
                <strong>Execution Time:</strong>
                ${data.execution_time_seconds}s
            </div>
        `;
    }

    // Recommendation
    if (data.final_recommendation) {
        html += `
            <div class="summary-item" style="grid-column: 1 / -1;">
                <strong>Recommendation:</strong>
                <div class="recommendation-text">${escapeHtml(data.final_recommendation)}</div>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

// ============================================================
// API Keys Management
// ============================================================

async function loadApiKeys() {
    try {
        const jwt = localStorage.getItem('missionize_jwt');
        const response = await fetch(`${API_BASE_URL}/user/api-keys`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load API keys');
        }

        const data = await response.json();
        currentApiKeys = data.keys || [];
        updateApiKeysUI();
    } catch (error) {
        console.error('Error loading API keys:', error);
        showAlert('Failed to load API keys', 'error');
    }
}

function updateApiKeysUI() {
    const keysList = document.getElementById('api-keys-list');
    const emptyState = document.getElementById('empty-state');

    if (currentApiKeys.length === 0) {
        hideElement('api-keys-list');
        showElement('empty-state');
        return;
    }

    showElement('api-keys-list');
    hideElement('empty-state');

    keysList.innerHTML = currentApiKeys.map(key => `
        <div class="api-key-card">
            <div class="api-key-info">
                <h4>${escapeHtml(key.name || 'Unnamed Key')}</h4>
                <p>Key: ${key.key_prefix}***</p>
                <p style="font-size: 0.8rem; color: var(--color-text-muted);">
                    Created: ${new Date(key.created_at).toLocaleDateString()}
                </p>
            </div>
            <div class="api-key-actions">
                <button class="btn btn-danger btn-sm" onclick="deleteApiKey('${key.key_id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleCreateKey() {
    const keyName = document.getElementById('key-name-input').value.trim();

    if (!keyName) {
        showAlert('Please enter a key name', 'error');
        return;
    }

    try {
        const jwt = localStorage.getItem('missionize_jwt');
        const response = await fetch(`${API_BASE_URL}/user/api-keys`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: keyName })
        });

        if (!response.ok) {
            throw new Error('Failed to create API key');
        }

        const data = await response.json();

        // Save the full API key to localStorage immediately
        localStorage.setItem('missionize_api_key', data.key);

        // Show new key modal
        document.getElementById('new-key-display').textContent = data.key;
        hideModal('create-key-modal');
        showModal('new-key-modal');

        // Clear input
        document.getElementById('key-name-input').value = '';

        // Reload keys
        await loadApiKeys();

        showAlert('API key created successfully!', 'success');
    } catch (error) {
        console.error('Error creating API key:', error);
        showAlert('Failed to create API key', 'error');
    }
}

async function deleteApiKey(keyId) {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
        return;
    }

    try {
        const jwt = localStorage.getItem('missionize_jwt');
        const response = await fetch(`${API_BASE_URL}/user/api-keys/${keyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete API key');
        }

        // Clear the stored API key from localStorage
        localStorage.removeItem('missionize_api_key');

        await loadApiKeys();
        showAlert('API key deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting API key:', error);
        showAlert('Failed to delete API key', 'error');
    }
}

function handleCopyKey() {
    const keyDisplay = document.getElementById('new-key-display');
    navigator.clipboard.writeText(keyDisplay.textContent);
    showAlert('API key copied to clipboard!', 'success');
}

// ============================================================
// Authentication
// ============================================================

function handleLogout() {
    localStorage.removeItem('missionize_jwt');
    window.location.href = 'login.html';
}

// ============================================================
// UI Helpers
// ============================================================

function showAlert(message, type = 'info') {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type} show`;
    setTimeout(() => hideAlert(), 5000);
}

function hideAlert() {
    const alert = document.getElementById('alert');
    alert.classList.remove('show');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'block';
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'none';
}

function setLoadingState(isLoading) {
    const btn = document.getElementById('run-mission-btn');
    const buttonText = btn.querySelector('.button-text');
    const spinner = btn.querySelector('.spinner');

    btn.disabled = isLoading;
    buttonText.style.display = isLoading ? 'none' : 'inline';
    spinner.style.display = isLoading ? 'inline' : 'none';
}

function updateProgress(pct) {
    const progressFill = document.getElementById('progress-bar-fill');
    if (progressFill) {
        progressFill.style.width = pct + '%';
    }
}

function startElapsedTimer() {
    requestStartTime = Date.now();
    let elapsed = 0;

    updateLoadingMessage(elapsed);

    elapsedTimer = setInterval(() => {
        elapsed = Math.floor((Date.now() - requestStartTime) / 1000);
        updateLoadingMessage(elapsed);

        // Increment progress
        const currentProgress = parseInt(document.getElementById('progress-bar-fill').style.width || '5');
        if (currentProgress < 90) {
            updateProgress(Math.min(currentProgress + 5, 90));
        }
    }, 1000);
}

function stopElapsedTimer() {
    if (elapsedTimer) {
        clearInterval(elapsedTimer);
        elapsedTimer = null;
    }
    requestStartTime = null;
}

function updateLoadingMessage(seconds) {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.innerHTML = `⏳ <strong>Processing with AI agents...</strong> (${seconds}s)`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
