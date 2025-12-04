/**
 * Evidence View
 * Displays cryptographic evidence for missions
 */

// Mock data - replace with real API calls later
const mockEvidenceData = [
    {
        missionId: 'M-0003',
        summary: 'Generate market analysis report',
        evidenceHash: 'sha256:a3f8b92c1e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        description: 'Consensus evidence from 3 AI agents'
    },
    {
        missionId: 'M-0006',
        summary: 'Customer churn prediction analysis',
        evidenceHash: 'sha256:b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        description: 'Consensus evidence from 3 AI agents'
    },
    {
        missionId: 'M-0007',
        summary: 'Quarterly financial forecasting',
        evidenceHash: 'sha256:c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
        timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
        description: 'Enterprise mode - 5 agent consensus'
    },
    {
        missionId: 'M-0008',
        summary: 'Competitor pricing analysis',
        evidenceHash: 'sha256:d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
        timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
        description: 'Consensus evidence from 3 AI agents'
    },
    {
        missionId: 'M-0010',
        summary: 'Product roadmap validation',
        evidenceHash: 'sha256:e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
        timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
        description: 'Consensus evidence from 3 AI agents'
    }
];

let selectedEvidence = null;

/**
 * Fetch evidence data (async stub for future API integration)
 */
async function fetchEvidenceData(appState) {
    // TODO: Replace with real fetch call
    // const response = await fetch(`${appState.apiBaseUrl}/evidence`);
    // return await response.json();
    return mockEvidenceData;
}

/**
 * Render the evidence view
 */
export async function render(container, appState) {
    const evidence = await fetchEvidenceData(appState);

    container.innerHTML = `
        <div class="evidence-container">
            <div class="evidence-list">
                <h3 style="margin-bottom: 1rem; color: var(--color-text);">Missions with Evidence</h3>
                ${evidence.map(item => renderEvidenceItem(item)).join('')}
            </div>
            <div class="evidence-detail" id="evidence-detail">
                <div style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">🔍</div>
                    <p>Select a mission to view evidence details</p>
                </div>
            </div>
        </div>
    `;

    // Setup event listeners
    setupEvidenceListeners(evidence);
}

/**
 * Render an evidence list item
 */
function renderEvidenceItem(item) {
    const timeAgo = formatTimeAgo(new Date(item.timestamp));

    return `
        <div class="evidence-item" data-mission-id="${item.missionId}">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.25rem;">
                ${item.missionId}
            </div>
            <div style="font-size: 0.875rem; color: var(--color-text); margin-bottom: 0.25rem;">
                ${escapeHtml(item.summary)}
            </div>
            <div style="font-size: 0.7rem; color: var(--color-text-muted);">
                ${timeAgo}
            </div>
        </div>
    `;
}

/**
 * Setup event listeners for evidence items
 */
function setupEvidenceListeners(evidence) {
    document.querySelectorAll('.evidence-item').forEach(item => {
        item.addEventListener('click', () => {
            const missionId = item.dataset.missionId;
            const evidenceData = evidence.find(e => e.missionId === missionId);

            // Remove selected class from all items
            document.querySelectorAll('.evidence-item').forEach(i => {
                i.classList.remove('selected');
            });

            // Add selected class to clicked item
            item.classList.add('selected');

            // Show evidence details
            showEvidenceDetails(evidenceData);
        });
    });
}

/**
 * Show evidence details
 */
function showEvidenceDetails(evidence) {
    selectedEvidence = evidence;
    const container = document.getElementById('evidence-detail');

    container.innerHTML = `
        <div>
            <h3 style="margin-bottom: 1rem; color: var(--color-text);">Evidence Details</h3>

            <div class="detail-row">
                <span class="detail-label">Mission ID</span>
                <span class="detail-value mono">${evidence.missionId}</span>
            </div>

            <div class="detail-row" style="margin-top: 1rem;">
                <span class="detail-label">Summary</span>
                <span class="detail-value">${escapeHtml(evidence.summary)}</span>
            </div>

            <div class="detail-row" style="margin-top: 1rem;">
                <span class="detail-label">Description</span>
                <span class="detail-value">${escapeHtml(evidence.description)}</span>
            </div>

            <div class="detail-row" style="margin-top: 1rem;">
                <span class="detail-label">Timestamp</span>
                <span class="detail-value">${new Date(evidence.timestamp).toLocaleString()}</span>
            </div>

            <div class="detail-row" style="margin-top: 1rem;">
                <span class="detail-label">Evidence Hash</span>
                <div class="evidence-hash" style="margin-top: 0.5rem; padding: 1rem; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 6px;">
                    ${evidence.evidenceHash}
                </div>
            </div>

            <div style="margin-top: 1.5rem;">
                <button class="btn btn-secondary" onclick="alert('View Raw JSON - Not implemented')">
                    View Raw JSON
                </button>
                <button class="btn btn-secondary" onclick="copyToClipboard('${evidence.evidenceHash}')" style="margin-left: 0.5rem;">
                    Copy Hash
                </button>
            </div>

            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--color-bg-tertiary); border-left: 3px solid var(--color-primary); border-radius: 4px;">
                <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">
                    ℹ️ About Evidence
                </div>
                <div style="font-size: 0.85rem; color: var(--color-text); line-height: 1.5;">
                    This cryptographic hash serves as tamper-proof evidence of the mission's execution,
                    including agent consensus, inputs, outputs, and timestamps. The evidence can be
                    independently verified and audited.
                </div>
            </div>
        </div>
    `;
}

/**
 * Copy to clipboard helper
 */
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Hash copied to clipboard!');
    });
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
 * Refresh evidence data
 */
export async function refreshEvidenceData() {
    return await fetchEvidenceData({ apiBaseUrl: localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai' });
}
