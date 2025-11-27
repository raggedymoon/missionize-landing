/**
 * Missionize Authentication JavaScript
 * Handles JWT tokens, API calls, route guards, and dashboard status
 */

const API_BASE_URL = 'https://api.missionize.ai';
const TOKEN_KEY = 'missionize_jwt';

// ============================================================================
// JWT Utilities
// ============================================================================

/**
 * Get JWT token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save JWT token to localStorage
 * @param {string} token - JWT token to save
 */
function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clear JWT token from localStorage
 */
function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean} True if token exists
 */
function isAuthenticated() {
    return getToken() !== null;
}

// ============================================================================
// Route Guards
// ============================================================================

/**
 * Redirect to login if user is not authenticated
 * Call this on protected pages like dashboard.html
 */
function redirectIfNotAuthenticated() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

/**
 * Redirect to dashboard if user is already authenticated
 * Call this on login.html and register.html
 */
function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = 'dashboard.html';
    }
}

// ============================================================================
// API Wrapper
// ============================================================================

/**
 * Make authenticated API call to Missionize backend
 * @param {string} endpoint - API endpoint (e.g., '/auth/me')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} Response JSON or throws error
 */
async function apiCall(endpoint, options = {}) {
    const token = getToken();

    // Build headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Make request
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
            clearToken();
            window.location.href = 'login.html';
            throw new Error('Unauthorized - redirecting to login');
        }

        // Parse JSON response
        const data = await response.json();

        // Check if response is OK
        if (!response.ok) {
            throw new Error(data.detail || data.message || `HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        // Re-throw network or parsing errors
        throw error;
    }
}

// ============================================================================
// Status Bar Logic
// ============================================================================

/**
 * Check API status by calling /health endpoint
 * @returns {Promise<string>} 'online' or 'offline'
 */
async function checkApiStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            timeout: 5000
        });

        if (response.ok) {
            return 'online';
        } else {
            return 'offline';
        }
    } catch (error) {
        console.error('API health check failed:', error);
        return 'offline';
    }
}

/**
 * Check Mizzi status (hardcoded to 'standby' for US-2a)
 * Future: Will read from SENTINEL_STATUS.json
 * @returns {Promise<string>} 'standby', 'online', or 'offline'
 */
async function checkMizziStatus() {
    // US-2a: Hardcoded to standby
    // Future US-2b: Will fetch from /mizzi/status or SENTINEL_STATUS.json
    return 'standby';
}

/**
 * Update status bar indicators and text
 * Called on page load and every 30 seconds
 */
async function updateStatusBar() {
    const apiStatusElement = document.getElementById('api-status');
    const mizziStatusElement = document.getElementById('mizzi-status');
    const apiIndicator = document.getElementById('api-indicator');
    const mizziIndicator = document.getElementById('mizzi-indicator');
    const apiStatusText = document.getElementById('api-status-text');
    const mizziStatusText = document.getElementById('mizzi-status-text');

    // Check API status
    const apiStatus = await checkApiStatus();
    if (apiIndicator) {
        apiIndicator.className = `status-indicator ${apiStatus}`;
    }
    if (apiStatusText) {
        apiStatusText.textContent = apiStatus.charAt(0).toUpperCase() + apiStatus.slice(1);
    }

    // Check Mizzi status
    const mizziStatus = await checkMizziStatus();
    if (mizziIndicator) {
        mizziIndicator.className = `status-indicator ${mizziStatus}`;
    }
    if (mizziStatusText) {
        mizziStatusText.textContent = mizziStatus.charAt(0).toUpperCase() + mizziStatus.slice(1);
    }
}

// ============================================================================
// Dashboard Bootstrap
// ============================================================================

/**
 * Initialize dashboard on page load
 * Loads user profile and API keys
 */
async function initDashboard() {
    // Redirect if not authenticated
    redirectIfNotAuthenticated();

    // Update status bar immediately
    await updateStatusBar();

    // Set up status bar auto-refresh every 30 seconds
    setInterval(updateStatusBar, 30000);

    // Load user profile
    await loadUserProfile();

    // Load API keys
    await loadApiKeys();
}

/**
 * Load user profile from /auth/me endpoint
 */
async function loadUserProfile() {
    try {
        const profile = await apiCall('/auth/me');

        // Update user email in header
        const userEmailElement = document.getElementById('user-email');
        if (userEmailElement) {
            userEmailElement.textContent = profile.email;
        }

        // Update profile section
        const profileEmailElement = document.getElementById('profile-email');
        const profilePlanElement = document.getElementById('profile-plan');
        const profileCreatedElement = document.getElementById('profile-created');

        if (profileEmailElement) {
            profileEmailElement.textContent = profile.email;
        }
        if (profilePlanElement) {
            profilePlanElement.textContent = profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1);
        }
        if (profileCreatedElement && profile.created_at) {
            const date = new Date(profile.created_at);
            profileCreatedElement.textContent = date.toLocaleDateString();
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
        showAlert('Failed to load profile: ' + error.message, 'error');
    }
}

/**
 * Load API keys from /user/api-keys endpoint
 */
async function loadApiKeys() {
    try {
        const response = await apiCall('/user/api-keys');
        const keys = response.keys || [];

        const apiKeysListElement = document.getElementById('api-keys-list');
        const emptyStateElement = document.getElementById('empty-state');

        if (keys.length === 0) {
            // Show empty state
            if (apiKeysListElement) {
                apiKeysListElement.style.display = 'none';
            }
            if (emptyStateElement) {
                emptyStateElement.style.display = 'block';
            }
        } else {
            // Hide empty state
            if (emptyStateElement) {
                emptyStateElement.style.display = 'none';
            }
            if (apiKeysListElement) {
                apiKeysListElement.style.display = 'grid';
                apiKeysListElement.innerHTML = '';

                // Render each key
                keys.forEach(key => {
                    const keyItem = createApiKeyItem(key);
                    apiKeysListElement.appendChild(keyItem);
                });
            }
        }
    } catch (error) {
        console.error('Failed to load API keys:', error);
        showAlert('Failed to load API keys: ' + error.message, 'error');
    }
}

/**
 * Create DOM element for an API key item
 * @param {object} key - API key object from backend
 * @returns {HTMLElement} DOM element for the key
 */
function createApiKeyItem(key) {
    const item = document.createElement('div');
    item.className = 'api-key-item';

    const keyInfo = document.createElement('div');
    keyInfo.className = 'key-info';

    const keyName = document.createElement('h4');
    keyName.textContent = key.name;

    const keyPrefix = document.createElement('div');
    keyPrefix.className = 'key-prefix';
    keyPrefix.textContent = `${key.key_prefix}***`;

    const keyMeta = document.createElement('div');
    keyMeta.className = 'key-meta';
    const createdDate = new Date(key.created_at).toLocaleDateString();
    const lastUsedText = key.last_used_at
        ? `Last used: ${new Date(key.last_used_at).toLocaleDateString()}`
        : 'Never used';
    keyMeta.textContent = `Created: ${createdDate} • ${lastUsedText}`;

    keyInfo.appendChild(keyName);
    keyInfo.appendChild(keyPrefix);
    keyInfo.appendChild(keyMeta);

    const keyActions = document.createElement('div');
    keyActions.className = 'key-actions';

    const revokeButton = document.createElement('button');
    revokeButton.className = 'btn btn-danger';
    revokeButton.textContent = 'Revoke';
    revokeButton.onclick = () => revokeApiKey(key.key_id);

    keyActions.appendChild(revokeButton);

    item.appendChild(keyInfo);
    item.appendChild(keyActions);

    return item;
}

/**
 * Create new API key
 * Called when "Create New Key" button is clicked
 */
async function createApiKey() {
    const modal = document.getElementById('create-key-modal');
    const keyNameInput = document.getElementById('key-name-input');
    const createBtn = document.getElementById('confirm-create-key');

    if (!keyNameInput || !keyNameInput.value.trim()) {
        showAlert('Please enter a key name', 'error');
        return;
    }

    const keyName = keyNameInput.value.trim();

    // Disable button during request
    if (createBtn) {
        createBtn.disabled = true;
        createBtn.textContent = 'Creating...';
    }

    try {
        const response = await apiCall('/user/api-keys', {
            method: 'POST',
            body: JSON.stringify({ name: keyName })
        });

        // Close modal
        if (modal) {
            modal.classList.remove('show');
        }

        // Show the full API key (only shown once!)
        showNewApiKeyModal(response.api_key, response.key_prefix);

        // Reload API keys list
        await loadApiKeys();

        // Clear input
        if (keyNameInput) {
            keyNameInput.value = '';
        }

        showAlert('API key created successfully!', 'success');
    } catch (error) {
        console.error('Failed to create API key:', error);
        showAlert('Failed to create API key: ' + error.message, 'error');
    } finally {
        // Re-enable button
        if (createBtn) {
            createBtn.disabled = false;
            createBtn.textContent = 'Create Key';
        }
    }
}

/**
 * Show modal with newly created API key (one-time display)
 * @param {string} apiKey - Full API key
 * @param {string} keyPrefix - Key prefix for display
 */
function showNewApiKeyModal(apiKey, keyPrefix) {
    const modal = document.getElementById('new-key-modal');
    const codeDisplay = document.getElementById('new-key-display');

    if (codeDisplay) {
        codeDisplay.textContent = apiKey;
    }

    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Revoke (delete) an API key
 * @param {string} keyId - API key ID to revoke
 */
async function revokeApiKey(keyId) {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
        return;
    }

    try {
        await apiCall(`/user/api-keys/${keyId}`, {
            method: 'DELETE'
        });

        showAlert('API key revoked successfully', 'success');

        // Reload API keys list
        await loadApiKeys();
    } catch (error) {
        console.error('Failed to revoke API key:', error);
        showAlert('Failed to revoke API key: ' + error.message, 'error');
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showAlert('Failed to copy to clipboard', 'error');
    });
}

/**
 * Logout user (clear token and redirect to login)
 */
function logout() {
    clearToken();
    window.location.href = 'login.html';
}

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type ('error', 'success', 'warning')
 */
function showAlert(message, type = 'error') {
    const alertElement = document.getElementById('alert');
    if (!alertElement) {
        console.error('Alert element not found');
        return;
    }

    alertElement.textContent = message;
    alertElement.className = `alert alert-${type} show`;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertElement.classList.remove('show');
    }, 5000);
}

/**
 * Hide alert message
 */
function hideAlert() {
    const alertElement = document.getElementById('alert');
    if (alertElement) {
        alertElement.classList.remove('show');
    }
}

// ============================================================================
// Event Listeners
// ============================================================================

// Modal management
document.addEventListener('DOMContentLoaded', () => {
    // Create Key Modal - Open
    const createKeyBtn = document.getElementById('create-key-btn');
    if (createKeyBtn) {
        createKeyBtn.addEventListener('click', () => {
            const modal = document.getElementById('create-key-modal');
            if (modal) {
                modal.classList.add('show');
            }
        });
    }

    // Create Key Modal - Cancel
    const cancelCreateBtn = document.getElementById('cancel-create-key');
    if (cancelCreateBtn) {
        cancelCreateBtn.addEventListener('click', () => {
            const modal = document.getElementById('create-key-modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    }

    // Create Key Modal - Confirm
    const confirmCreateBtn = document.getElementById('confirm-create-key');
    if (confirmCreateBtn) {
        confirmCreateBtn.addEventListener('click', createApiKey);
    }

    // New Key Modal - Close
    const closeNewKeyBtn = document.getElementById('close-new-key-modal');
    if (closeNewKeyBtn) {
        closeNewKeyBtn.addEventListener('click', () => {
            const modal = document.getElementById('new-key-modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    }

    // New Key Modal - Copy button
    const copyKeyBtn = document.getElementById('copy-key-btn');
    if (copyKeyBtn) {
        copyKeyBtn.addEventListener('click', () => {
            const codeDisplay = document.getElementById('new-key-display');
            if (codeDisplay) {
                copyToClipboard(codeDisplay.textContent);
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Status bar refresh button
    const refreshStatusBtn = document.getElementById('refresh-status-btn');
    if (refreshStatusBtn) {
        refreshStatusBtn.addEventListener('click', async () => {
            refreshStatusBtn.disabled = true;
            refreshStatusBtn.textContent = 'Refreshing...';

            await updateStatusBar();

            refreshStatusBtn.disabled = false;
            refreshStatusBtn.textContent = 'Refresh';
        });
    }

    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
});
