/**
 * Settings View
 * Dashboard configuration and preferences
 */

/**
 * Load settings from localStorage
 */
function loadSettings() {
    return {
        apiBaseUrl: localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai',
        enableEnterpriseMode: localStorage.getItem('enable_enterprise_mode') === 'true',
        showMultiWorkerView: localStorage.getItem('show_multiworker_view') === 'true',
        enableMizziIndicators: localStorage.getItem('enable_mizzi_indicators') === 'true'
    };
}

/**
 * Save setting to localStorage
 */
function saveSetting(key, value) {
    localStorage.setItem(key, value);
}

/**
 * Render the settings view
 */
export function render(container, appState) {
    const settings = loadSettings();

    container.innerHTML = `
        <div class="settings-container">
            <!-- API Configuration -->
            <div class="settings-section">
                <h3 class="section-title">API Configuration</h3>

                <div class="setting-item">
                    <label class="setting-label" for="api-base-url">
                        API Base URL
                    </label>
                    <input
                        type="text"
                        id="api-base-url"
                        class="setting-input"
                        value="${escapeHtml(settings.apiBaseUrl)}"
                        placeholder="https://api.missionize.ai"
                    >
                    <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.5rem;">
                        The base URL for Missionize API endpoints. Changes will take effect on next page load.
                    </div>
                </div>

                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary" data-action="save-api-url">
                        Save API URL
                    </button>
                </div>
            </div>

            <!-- UI Preferences -->
            <div class="settings-section">
                <h3 class="section-title">UI Preferences</h3>

                <div class="setting-item">
                    <div class="toggle-container">
                        <div>
                            <div class="setting-label" style="margin-bottom: 0.25rem;">
                                Enable Enterprise Mode UI
                            </div>
                            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                                Show advanced features and multi-agent consensus options
                            </div>
                        </div>
                        <div class="toggle-switch ${settings.enableEnterpriseMode ? 'active' : ''}"
                             data-action="toggle"
                             data-setting="enable_enterprise_mode">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="toggle-container">
                        <div>
                            <div class="setting-label" style="margin-bottom: 0.25rem;">
                                Show Multi-Worker Experimental View
                            </div>
                            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                                Display experimental multi-worker pipeline visualization
                            </div>
                        </div>
                        <div class="toggle-switch ${settings.showMultiWorkerView ? 'active' : ''}"
                             data-action="toggle"
                             data-setting="show_multiworker_view">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="toggle-container">
                        <div>
                            <div class="setting-label" style="margin-bottom: 0.25rem;">
                                Enable Mizzi QA Indicators
                            </div>
                            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                                Show Mizzi validation badges and quality indicators on missions
                            </div>
                        </div>
                        <div class="toggle-switch ${settings.enableMizziIndicators ? 'active' : ''}"
                             data-action="toggle"
                             data-setting="enable_mizzi_indicators">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- About -->
            <div class="settings-section">
                <h3 class="section-title">About</h3>

                <div class="setting-item" style="border-bottom: none;">
                    <div style="display: grid; gap: 0.75rem;">
                        <div>
                            <div style="font-size: 0.8rem; color: var(--color-text-muted);">Dashboard Version</div>
                            <div style="font-size: 0.95rem; color: var(--color-text);">v1.0.0</div>
                        </div>
                        <div>
                            <div style="font-size: 0.8rem; color: var(--color-text-muted);">API Version</div>
                            <div style="font-size: 0.95rem; color: var(--color-text);">Compatible with Missionize API v1.x</div>
                        </div>
                        <div>
                            <div style="font-size: 0.8rem; color: var(--color-text-muted);">Documentation</div>
                            <a href="https://docs.missionize.ai" target="_blank" style="color: var(--color-primary); text-decoration: none;">
                                docs.missionize.ai →
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Danger Zone -->
            <div class="settings-section" style="border: 1px solid var(--color-error);">
                <h3 class="section-title" style="color: var(--color-error);">Danger Zone</h3>

                <div class="setting-item" style="border-bottom: none;">
                    <div style="margin-bottom: 0.75rem;">
                        <div class="setting-label">Reset All Settings</div>
                        <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.25rem;">
                            This will clear all dashboard preferences and return to defaults.
                        </div>
                    </div>
                    <button class="btn btn-secondary" data-action="reset-settings" style="border-color: var(--color-error); color: var(--color-error);">
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Escape HTML helper
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Event delegation handler for settings actions
 */
document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    switch (action) {
        case 'save-api-url':
            handleSaveApiUrl();
            break;

        case 'toggle':
            handleToggle(target);
            break;

        case 'reset-settings':
            handleResetSettings();
            break;
    }
});

/**
 * Handle save API URL
 */
function handleSaveApiUrl() {
    const input = document.getElementById('api-base-url');
    const newUrl = input.value.trim();

    if (!newUrl) {
        alert('Please enter a valid API URL');
        return;
    }

    // Basic URL validation
    try {
        new URL(newUrl);
    } catch (e) {
        alert('Invalid URL format. Please enter a valid URL (e.g., https://api.example.com)');
        return;
    }

    // Save to localStorage
    saveSetting('missionize_api_url', newUrl);

    alert('API URL saved successfully! The change will take effect on next page load.');
}

/**
 * Handle toggle switch
 */
function handleToggle(element) {
    const setting = element.dataset.setting;
    const isActive = element.classList.contains('active');
    const newValue = !isActive;

    // Toggle visual state
    element.classList.toggle('active');

    // Save to localStorage
    saveSetting(setting, newValue);

    // Show confirmation
    console.log(`Setting "${setting}" updated to: ${newValue}`);
}

/**
 * Handle reset settings
 */
function handleResetSettings() {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
        return;
    }

    // Clear all dashboard-related settings
    localStorage.removeItem('missionize_api_url');
    localStorage.removeItem('enable_enterprise_mode');
    localStorage.removeItem('show_multiworker_view');
    localStorage.removeItem('enable_mizzi_indicators');

    alert('All settings have been reset to defaults. Reloading page...');

    // Reload page to reflect changes
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}
