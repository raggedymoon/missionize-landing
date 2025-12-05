/**
 * Missionize DevTools Panel
 * Debug tools for developers and demos
 */

const DevTools = {
    isOpen: false,
    requestLog: [],
    maxLogEntries: 50,

    init() {
        this.createPanel();
        this.hookIntoFetch();
        console.log('[DevTools] Initialized');
    },

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'devtools-panel';
        panel.className = 'devtools-panel';
        panel.innerHTML = `
            <div class="devtools-header">
                <span>🛠️ DevTools</span>
                <button class="devtools-close" onclick="DevTools.toggle()">✕</button>
            </div>
            <div class="devtools-content">
                <div class="devtools-section">
                    <h4>API Health</h4>
                    <div id="devtools-health" class="devtools-health">
                        <span class="health-dot loading"></span> Checking...
                    </div>
                </div>
                <div class="devtools-section">
                    <h4>Quick Actions</h4>
                    <div class="devtools-actions">
                        <button onclick="DevTools.checkHealth()">🔄 Check API</button>
                        <button onclick="DevTools.clearStorage()">🗑️ Clear Storage</button>
                        <button onclick="DevTools.exportLogs()">📥 Export Logs</button>
                    </div>
                </div>
                <div class="devtools-section">
                    <h4>Request Log</h4>
                    <div id="devtools-log" class="devtools-log"></div>
                </div>
                <div class="devtools-section">
                    <h4>LocalStorage</h4>
                    <div id="devtools-storage" class="devtools-storage"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Create toggle button
        const toggle = document.createElement('button');
        toggle.id = 'devtools-toggle';
        toggle.className = 'devtools-toggle';
        toggle.innerHTML = '🛠️';
        toggle.title = 'Open DevTools';
        toggle.onclick = () => this.toggle();
        document.body.appendChild(toggle);

        this.checkHealth();
        this.updateStorage();
    },

    toggle() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('devtools-panel');
        panel.classList.toggle('open', this.isOpen);
    },

    async checkHealth() {
        const healthEl = document.getElementById('devtools-health');
        healthEl.innerHTML = '<span class="health-dot loading"></span> Checking...';

        try {
            const start = Date.now();
            const response = await fetch('https://api.missionize.ai/health');
            const elapsed = Date.now() - start;

            if (response.ok) {
                healthEl.innerHTML = `<span class="health-dot healthy"></span> Healthy (${elapsed}ms)`;
            } else {
                healthEl.innerHTML = `<span class="health-dot degraded"></span> Degraded (${response.status})`;
            }
        } catch (e) {
            healthEl.innerHTML = `<span class="health-dot unhealthy"></span> Unreachable`;
        }
    },

    hookIntoFetch() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0];
            const start = Date.now();

            try {
                const response = await originalFetch(...args);
                const elapsed = Date.now() - start;

                if (url.includes('api.missionize.ai')) {
                    this.logRequest({
                        url: url,
                        method: args[1]?.method || 'GET',
                        status: response.status,
                        elapsed: elapsed,
                        timestamp: new Date().toISOString()
                    });
                }
                return response;
            } catch (e) {
                if (url.includes('api.missionize.ai')) {
                    this.logRequest({
                        url: url,
                        method: args[1]?.method || 'GET',
                        status: 'ERROR',
                        error: e.message,
                        timestamp: new Date().toISOString()
                    });
                }
                throw e;
            }
        };
    },

    logRequest(entry) {
        this.requestLog.unshift(entry);
        if (this.requestLog.length > this.maxLogEntries) {
            this.requestLog.pop();
        }
        this.updateLog();
    },

    updateLog() {
        const logEl = document.getElementById('devtools-log');
        if (!logEl) return;

        logEl.innerHTML = this.requestLog.map(entry => `
            <div class="log-entry ${entry.status === 200 ? 'success' : 'error'}">
                <span class="log-method">${entry.method}</span>
                <span class="log-url">${entry.url.split('/').pop()}</span>
                <span class="log-status">${entry.status}</span>
                <span class="log-time">${entry.elapsed || 0}ms</span>
            </div>
        `).join('') || '<div class="log-empty">No requests yet</div>';
    },

    updateStorage() {
        const storageEl = document.getElementById('devtools-storage');
        if (!storageEl) return;

        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('missionize_')) {
                const value = localStorage.getItem(key);
                items.push({ key: key.replace('missionize_', ''), value: value.substring(0, 50) });
            }
        }

        storageEl.innerHTML = items.map(item => `
            <div class="storage-item">
                <span class="storage-key">${item.key}</span>
                <span class="storage-value">${item.value}${item.value.length >= 50 ? '...' : ''}</span>
            </div>
        `).join('') || '<div class="storage-empty">No Missionize data</div>';
    },

    clearStorage() {
        if (confirm('Clear all Missionize localStorage data?')) {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('missionize_')) keys.push(key);
            }
            keys.forEach(k => localStorage.removeItem(k));
            this.updateStorage();
            alert('Storage cleared!');
        }
    },

    exportLogs() {
        const data = JSON.stringify(this.requestLog, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `missionize-logs-${Date.now()}.json`;
        a.click();
    }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DevTools.init());
} else {
    DevTools.init();
}
