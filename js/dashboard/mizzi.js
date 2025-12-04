/**
 * Mizzi Panel View
 * Displays the Mizzi QA agent status and recent events
 */

// Mock data - replace with real API calls later
const mockMizziStatus = {
    status: 'Monitoring',
    lastDiagnostic: new Date(Date.now() - 10 * 60000).toISOString(),
    activeTasks: 2,
    totalValidations: 1847,
    rejectedMissions: 12
};

const mockMizziEvents = [
    {
        message: 'Validated mission M-0001',
        type: 'success',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
        message: 'Rejected mission M-0002: missing required claims',
        type: 'warning',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
        message: 'Consensus verification passed for M-0003',
        type: 'success',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString()
    },
    {
        message: 'Pattern validation completed for Market Analysis',
        type: 'info',
        timestamp: new Date(Date.now() - 35 * 60000).toISOString()
    },
    {
        message: 'Diagnostic check completed - all systems nominal',
        type: 'success',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString()
    },
    {
        message: 'Evidence hash verification completed for M-0006',
        type: 'success',
        timestamp: new Date(Date.now() - 55 * 60000).toISOString()
    }
];

/**
 * Fetch Mizzi status (async stub for future API integration)
 */
async function fetchMizziStatus(appState) {
    // TODO: Replace with real fetch call
    // const response = await fetch(`${appState.apiBaseUrl}/mizzi/status`);
    // return await response.json();
    return mockMizziStatus;
}

/**
 * Fetch Mizzi events (async stub for future API integration)
 */
async function fetchMizziEvents(appState) {
    // TODO: Replace with real fetch call
    // const response = await fetch(`${appState.apiBaseUrl}/mizzi/events`);
    // return await response.json();
    return mockMizziEvents;
}

/**
 * Render the Mizzi view
 */
export async function render(container, appState) {
    const status = await fetchMizziStatus(appState);
    const events = await fetchMizziEvents(appState);

    container.innerHTML = `
        <div class="mizzi-container">
            <div style="margin-bottom: 1.5rem;">
                <p style="color: var(--color-text-muted); font-size: 0.95rem;">
                    Mizzi is your AI quality assurance agent that monitors mission execution,
                    validates consensus, and ensures evidence integrity.
                </p>
            </div>

            <!-- Status Section -->
            <div class="mizzi-status">
                <h3 style="margin-bottom: 1rem; color: var(--color-text);">Mizzi Status</h3>

                <div class="status-row">
                    <span class="status-label">Current Status</span>
                    <span class="status-value" style="color: ${getStatusColor(status.status)};">
                        ${status.status}
                    </span>
                </div>

                <div class="status-row">
                    <span class="status-label">Last Diagnostic</span>
                    <span class="status-value">${formatTimeAgo(new Date(status.lastDiagnostic))}</span>
                </div>

                <div class="status-row">
                    <span class="status-label">Active Tasks</span>
                    <span class="status-value">${status.activeTasks}</span>
                </div>

                <div class="status-row">
                    <span class="status-label">Total Validations</span>
                    <span class="status-value">${status.totalValidations.toLocaleString()}</span>
                </div>

                <div class="status-row">
                    <span class="status-label">Rejected Missions</span>
                    <span class="status-value">${status.rejectedMissions}</span>
                </div>
            </div>

            <!-- Recent Events -->
            <div class="mizzi-events">
                <h3 style="margin-bottom: 1rem; color: var(--color-text);">Recent Events</h3>
                <div class="event-list">
                    ${events.map(event => renderEvent(event)).join('')}
                </div>
            </div>

            <!-- Actions -->
            <div class="mizzi-actions">
                <button class="btn btn-primary" onclick="handleMizziAction('diagnostics')">
                    Run Diagnostics
                </button>
                <button class="btn btn-secondary" onclick="handleMizziAction('logs')">
                    View Full Log
                </button>
                <button class="btn btn-secondary" onclick="handleMizziAction('settings')">
                    Mizzi Settings
                </button>
            </div>
        </div>
    `;
}

/**
 * Render an event item
 */
function renderEvent(event) {
    const icon = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    }[event.type] || 'ℹ️';

    return `
        <div class="event-item">
            <span>${icon}</span>
            <span>${escapeHtml(event.message)}</span>
            <span class="event-time">${formatTimeAgo(new Date(event.timestamp))}</span>
        </div>
    `;
}

/**
 * Get status color
 */
function getStatusColor(status) {
    const colors = {
        'Idle': 'var(--color-text-muted)',
        'Monitoring': 'var(--color-primary)',
        'Repairing': 'var(--color-warning)',
        'Paused': 'var(--color-text-muted)'
    };
    return colors[status] || 'var(--color-text)';
}

/**
 * Handle Mizzi actions
 */
window.handleMizziAction = function(action) {
    const messages = {
        diagnostics: 'Running Mizzi diagnostics...\n\nThis would trigger a comprehensive system check.',
        logs: 'Opening full Mizzi event log...\n\nThis would display the complete event history.',
        settings: 'Opening Mizzi settings...\n\nHere you could configure validation rules, thresholds, and monitoring preferences.'
    };

    alert(messages[action] || 'Action not implemented');
};

/**
 * Format time ago helper
 */
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
 * Refresh Mizzi data
 */
export async function refreshMizziData() {
    const status = await fetchMizziStatus({ apiBaseUrl: localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai' });
    const events = await fetchMizziEvents({ apiBaseUrl: localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai' });
    return { status, events };
}
