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
 * Fetch Mizzi status from API
 */
async function fetchMizziStatus(appState) {
    try {
        const baseUrl = appState?.apiBaseUrl || localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai';
        const response = await fetch(`${baseUrl}/mizzi/status`, {
            headers: {
                'X-API-Key': localStorage.getItem('missionize_api_key') || ''
            }
        });
        
        if (!response.ok) {
            console.warn('Mizzi status API returned error, using mock data');
            return mockMizziStatus;
        }
        
        const data = await response.json();
        
        // Transform API response to match frontend format
        return {
            status: data.mode === 'active' ? 'Monitoring' : (data.status === 'healthy' ? 'Idle' : 'Paused'),
            lastDiagnostic: data.last_heartbeat,
            activeTasks: 0,  // Could be derived from running missions
            totalValidations: data.missions_validated || 0,
            rejectedMissions: data.missions_blocked || 0
        };
    } catch (error) {
        console.warn('Failed to fetch Mizzi status, using mock:', error.message);
        return mockMizziStatus;
    }
}

/**
 * Fetch Mizzi events from API
 */
async function fetchMizziEvents(appState) {
    try {
        const baseUrl = appState?.apiBaseUrl || localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai';
        const response = await fetch(`${baseUrl}/mizzi/events?limit=20`, {
            headers: {
                'X-API-Key': localStorage.getItem('missionize_api_key') || ''
            }
        });
        
        if (!response.ok) {
            console.warn('Mizzi events API returned error, using mock data');
            return mockMizziEvents;
        }
        
        const data = await response.json();
        
        // Transform API response to match frontend format
        return data.events.map(e => ({
            message: e.message,
            type: mapSeverityToType(e.severity),
            timestamp: e.timestamp
        }));
    } catch (error) {
        console.warn('Failed to fetch Mizzi events, using mock:', error.message);
        return mockMizziEvents;
    }
}

/**
 * Map API severity to frontend type
 */
function mapSeverityToType(severity) {
    const map = {
        'info': 'info',
        'warning': 'warning',
        'error': 'error',
        'critical': 'error'
    };
    return map[severity] || 'success';
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
window.handleMizziAction = async function(action) {
    if (action === 'diagnostics') {
        await runMizziDiagnostics();
    } else if (action === 'logs') {
        alert('Opening full Mizzi event log...\n\nThis would display the complete event history.');
    } else if (action === 'settings') {
        alert('Opening Mizzi settings...\n\nHere you could configure validation rules, thresholds, and monitoring preferences.');
    }
};

/**
 * Run comprehensive system diagnostics
 */
async function runMizziDiagnostics() {
    const results = {
        api: { status: 'checking', latency: null, error: null },
        storage: { status: 'checking', items: 0, size: '0 KB' },
        mode: localStorage.getItem('missionize_chat_mode') || 'fast',
        conversations: 0
    };

    // Test API
    const startTime = Date.now();
    try {
        const baseUrl = localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai';
        const response = await fetch(`${baseUrl}/health`, {
            headers: {
                'X-API-Key': localStorage.getItem('missionize_api_key') || ''
            }
        });
        results.api.latency = Date.now() - startTime;
        results.api.status = response.ok ? 'healthy' : 'degraded';

        if (response.ok) {
            const data = await response.json();
            results.api.version = data.version || 'unknown';
        }
    } catch (e) {
        results.api.status = 'offline';
        results.api.error = e.message;
        results.api.latency = Date.now() - startTime;
    }

    // Check localStorage
    try {
        const missionizeKeys = Object.keys(localStorage).filter(k => k.startsWith('missionize_'));
        results.storage.items = missionizeKeys.length;

        // Calculate approximate size
        let totalSize = 0;
        missionizeKeys.forEach(key => {
            const value = localStorage.getItem(key) || '';
            totalSize += key.length + value.length;
        });
        results.storage.size = totalSize < 1024 ? `${totalSize} B` :
                              totalSize < 1024 * 1024 ? `${(totalSize / 1024).toFixed(1)} KB` :
                              `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
        results.storage.status = 'ok';
    } catch (e) {
        results.storage.status = 'error';
        results.storage.error = e.message;
    }

    // Count conversations
    try {
        const conversations = JSON.parse(localStorage.getItem('missionize_conversations') || '[]');
        results.conversations = conversations.length;
    } catch {
        results.conversations = 0;
    }

    showDiagnosticsResults(results);
}

/**
 * Show diagnostics results in a modal
 */
function showDiagnosticsResults(results) {
    const statusClass = results.api.status === 'healthy' ? 'healthy' :
                       results.api.status === 'degraded' ? 'degraded' : 'offline';

    const modal = document.createElement('div');
    modal.className = 'mizzi-diagnostics-modal';
    modal.innerHTML = `
        <div class="diagnostics-content">
            <div class="diagnostics-header">
                <h4>🔍 System Diagnostics</h4>
                <button class="diagnostics-close" onclick="this.closest('.mizzi-diagnostics-modal').remove()">✕</button>
            </div>
            <div class="diagnostics-body">
                <div class="diag-row">
                    <span class="diag-label">API Status:</span>
                    <span class="diag-value ${statusClass}">
                        ${results.api.status} ${results.api.latency ? `(${results.api.latency}ms)` : ''}
                    </span>
                </div>
                ${results.api.error ? `
                    <div class="diag-row">
                        <span class="diag-label">Error:</span>
                        <span class="diag-value error">${escapeHtml(results.api.error)}</span>
                    </div>
                ` : ''}
                ${results.api.version ? `
                    <div class="diag-row">
                        <span class="diag-label">API Version:</span>
                        <span class="diag-value">${results.api.version}</span>
                    </div>
                ` : ''}
                <div class="diag-row">
                    <span class="diag-label">Current Mode:</span>
                    <span class="diag-value mode-${results.mode}">${results.mode === 'fast' ? '⚡ Fast' : '🔒 Mission'}</span>
                </div>
                <div class="diag-row">
                    <span class="diag-label">Conversations:</span>
                    <span class="diag-value">${results.conversations}</span>
                </div>
                <div class="diag-row">
                    <span class="diag-label">Local Storage:</span>
                    <span class="diag-value">${results.storage.items} items (${results.storage.size})</span>
                </div>
                <div class="diag-row">
                    <span class="diag-label">Storage Status:</span>
                    <span class="diag-value ${results.storage.status}">${results.storage.status}</span>
                </div>
            </div>
            <div class="diagnostics-footer">
                <button class="btn btn-secondary" onclick="this.closest('.mizzi-diagnostics-modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

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

/**
 * =======================================================================
 * MIZZI SIDECAR WIDGET (WOW PACK V3)
 * Floating Guardian Angel assistant with system status and quick tips
 * =======================================================================
 */

const MizziWidget = {
    isOpen: false,
    lastHealthCheck: null,
    healthCheckInterval: null,

    init() {
        this.createWidget();
        this.refreshStatus();
        this.startHealthCheckInterval();
        console.log('[Mizzi Widget] Guardian Angel initialized');
    },

    createWidget() {
        // Create FAB button
        const fab = document.createElement('button');
        fab.id = 'mizzi-fab';
        fab.className = 'mizzi-fab';
        fab.innerHTML = '😇';
        fab.title = 'Mizzi - Your Guardian Angel';
        fab.onclick = () => this.toggle();
        document.body.appendChild(fab);

        // Create widget panel
        const widget = document.createElement('div');
        widget.id = 'mizzi-widget';
        widget.className = 'mizzi-widget';
        widget.innerHTML = this.getWidgetHTML();
        document.body.appendChild(widget);
    },

    getWidgetHTML() {
        return `
            <div class="mizzi-header">
                <div class="mizzi-title">
                    <span class="mizzi-icon">😇</span>
                    <span>Mizzi</span>
                </div>
                <button class="mizzi-close" onclick="MizziWidget.toggle()">✕</button>
            </div>
            <div class="mizzi-content">
                <div class="mizzi-status-section">
                    <h5>System Status</h5>
                    <div id="mizzi-api-status" class="mizzi-status-item">
                        <span class="status-label">API</span>
                        <span class="status-badge loading">Checking...</span>
                    </div>
                    <div id="mizzi-mode-status" class="mizzi-status-item">
                        <span class="status-label">Mode</span>
                        <span class="status-badge" id="mizzi-current-mode">Fast</span>
                    </div>
                    <div id="mizzi-chat-count" class="mizzi-status-item">
                        <span class="status-label">Chats</span>
                        <span class="status-badge" id="mizzi-chat-count-value">0</span>
                    </div>
                </div>
                <div class="mizzi-mission-section" id="mizzi-mission-section" style="display: none;">
                    <h5>Last Mission</h5>
                    <div class="mizzi-mission-info">
                        <div class="mission-status" id="mizzi-mission-status">No missions yet</div>
                        <div class="mission-trust" id="mizzi-mission-trust" style="display: none;">
                            Trust Score: <strong id="mizzi-trust-score">-</strong>
                        </div>
                    </div>
                </div>
                <div class="mizzi-tips-section">
                    <h5>💡 Tip</h5>
                    <div class="mizzi-tip" id="mizzi-contextual-tip">
                        <span class="tip-text">Loading...</span>
                    </div>
                </div>
                <div class="mizzi-actions">
                    <button onclick="MizziWidget.newChat()" class="mizzi-action-btn">
                        ✏️ New Chat
                    </button>
                    <button onclick="MizziWidget.toggleMode()" class="mizzi-action-btn" id="mizzi-mode-toggle-btn">
                        🔒 Mission Mode
                    </button>
                    <button onclick="MizziWidget.goToEvidence()" class="mizzi-action-btn">
                        🔍 Evidence
                    </button>
                    <button onclick="MizziWidget.openDevTools()" class="mizzi-action-btn">
                        🛠️ DevTools
                    </button>
                </div>
            </div>
        `;
    },

    toggle() {
        this.isOpen = !this.isOpen;
        const widget = document.getElementById('mizzi-widget');
        const fab = document.getElementById('mizzi-fab');

        if (this.isOpen) {
            widget.classList.add('open');
            fab.style.opacity = '0';
            this.refreshStatus();
        } else {
            widget.classList.remove('open');
            fab.style.opacity = '1';
        }
    },

    async refreshStatus() {
        await this.checkSystemHealth();
        this.updateModeDisplay();
        this.updateChatCount();
        await this.getLastMissionStatus();
        this.updateContextualTip();
    },

    async checkSystemHealth() {
        const statusEl = document.getElementById('mizzi-api-status');
        if (!statusEl) return;

        const badge = statusEl.querySelector('.status-badge');

        try {
            const baseUrl = localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai';
            const response = await fetch(`${baseUrl}/health`, {
                headers: {
                    'X-API-Key': localStorage.getItem('missionize_api_key') || ''
                }
            });
            if (response.ok) {
                badge.className = 'status-badge healthy';
                badge.textContent = '✓ Online';
            } else {
                badge.className = 'status-badge degraded';
                badge.textContent = '⚠ Degraded';
            }
            this.lastHealthCheck = new Date();
        } catch (e) {
            badge.className = 'status-badge unhealthy';
            badge.textContent = '✕ Offline';
        }
    },

    updateModeDisplay() {
        const modeEl = document.getElementById('mizzi-current-mode');
        const toggleBtn = document.getElementById('mizzi-mode-toggle-btn');
        if (!modeEl) return;

        // Check current mode from chat
        const chatMode = localStorage.getItem('missionize_chat_mode') || 'fast';

        if (chatMode === 'mission') {
            modeEl.textContent = '🔒 Mission';
            modeEl.className = 'status-badge mission-mode';
            if (toggleBtn) {
                toggleBtn.innerHTML = '⚡ Fast Mode';
            }
        } else {
            modeEl.textContent = '⚡ Fast';
            modeEl.className = 'status-badge fast-mode';
            if (toggleBtn) {
                toggleBtn.innerHTML = '🔒 Mission Mode';
            }
        }
    },

    updateChatCount() {
        const countEl = document.getElementById('mizzi-chat-count-value');
        if (!countEl) return;

        const count = this.getChatCount();
        countEl.textContent = count;
    },

    getChatCount() {
        try {
            const conversations = JSON.parse(localStorage.getItem('missionize_conversations') || '[]');
            return conversations.length;
        } catch {
            return 0;
        }
    },

    async getLastMissionStatus() {
        const sectionEl = document.getElementById('mizzi-mission-section');
        const statusEl = document.getElementById('mizzi-mission-status');
        const trustEl = document.getElementById('mizzi-mission-trust');
        const trustScoreEl = document.getElementById('mizzi-trust-score');

        if (!sectionEl || !statusEl) return;

        try {
            // Try to get last mission from history
            const baseUrl = localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai';
            const response = await fetch(`${baseUrl}/api/missions/history?limit=1`, {
                headers: {
                    'X-API-Key': localStorage.getItem('missionize_api_key') || ''
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.missions && data.missions.length > 0) {
                    const mission = data.missions[0];
                    sectionEl.style.display = 'block';
                    statusEl.textContent = `${mission.id}: ${mission.status}`;

                    if (mission.trust_score !== undefined && mission.trust_score !== null) {
                        trustEl.style.display = 'block';
                        trustScoreEl.textContent = `${(mission.trust_score * 100).toFixed(0)}%`;
                    } else {
                        trustEl.style.display = 'none';
                    }
                } else {
                    sectionEl.style.display = 'none';
                }
            } else {
                sectionEl.style.display = 'none';
            }
        } catch (e) {
            sectionEl.style.display = 'none';
        }
    },

    updateContextualTip() {
        const tipEl = document.getElementById('mizzi-contextual-tip');
        if (!tipEl) return;

        const tip = this.getContextualTip();
        tipEl.innerHTML = `<span class="tip-text">${tip}</span>`;
    },

    getContextualTip() {
        const chatMode = localStorage.getItem('missionize_chat_mode') || 'fast';
        const chatCount = this.getChatCount();

        // Define all tips with conditions
        const tips = [
            {
                condition: () => chatCount === 0,
                tip: 'Start with <strong>Fast Mode</strong> for quick answers, then try <strong>Mission Mode</strong> for verified responses.',
                priority: 10
            },
            {
                condition: () => chatMode === 'mission',
                tip: 'Mission Mode gives you cryptographic proof. Check the <strong>Evidence</strong> tab after responses!',
                priority: 9
            },
            {
                condition: () => chatMode === 'fast' && chatCount >= 3,
                tip: 'Try <strong>Mission Mode</strong> for high-stakes decisions with multi-agent consensus and cryptographic proof.',
                priority: 8
            },
            {
                condition: () => true,
                tip: 'Attach files using 📎 to analyze documents, CSVs, JSON, or code.',
                priority: 5
            },
            {
                condition: () => true,
                tip: 'Use Demo Scenarios dropdown for pre-built prompts and examples.',
                priority: 4
            },
            {
                condition: () => true,
                tip: 'Press <strong>Ctrl+D</strong> to toggle DevTools panel for debugging.',
                priority: 3
            },
            {
                condition: () => true,
                tip: 'Click the 😇 icon anytime for system health and quick actions.',
                priority: 2
            },
            {
                condition: () => chatCount > 0,
                tip: 'Use the sidebar to switch between conversations or start a new one.',
                priority: 6
            }
        ];

        // Find first matching tip by priority
        const matching = tips
            .filter(t => t.condition())
            .sort((a, b) => b.priority - a.priority);

        if (matching.length > 0) {
            // Rotate through matching tips based on current second
            const index = Math.floor(Date.now() / 10000) % matching.length;
            return matching[index].tip;
        }

        // Fallback
        return 'Use <strong>Fast Mode</strong> for quick queries, <strong>Mission Mode</strong> for critical decisions requiring proof.';
    },

    startHealthCheckInterval() {
        // Auto-refresh health every 30 seconds
        this.healthCheckInterval = setInterval(() => {
            if (this.isOpen) {
                this.checkSystemHealth();
            }
        }, 30000);
    },

    // Quick Actions
    newChat() {
        const btnNewChat = document.getElementById('btn-new-chat');
        if (btnNewChat) {
            btnNewChat.click();
        }
        this.toggle();
    },

    toggleMode() {
        const chatMode = localStorage.getItem('missionize_chat_mode') || 'fast';
        const targetMode = chatMode === 'fast' ? 'mission' : 'fast';
        const modeBtn = document.querySelector(`.mode-option[data-mode="${targetMode}"]`);
        if (modeBtn) {
            modeBtn.click();
        }
        this.toggle();
    },

    goToEvidence() {
        const evidenceTab = document.querySelector('.nav-tab[data-view="evidence"]');
        if (evidenceTab) {
            evidenceTab.click();
        }
        this.toggle();
    },

    openDevTools() {
        if (window.DevTools) {
            DevTools.toggle();
        }
        this.toggle();
    }
};

// Auto-init Mizzi Widget when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MizziWidget.init());
} else {
    MizziWidget.init();
}

// Expose globally for inline onclick handlers
window.MizziWidget = MizziWidget;
