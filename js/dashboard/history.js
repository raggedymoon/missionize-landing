/**
 * Mission History View
 * Displays completed missions in a table format
 */

let selectedHistoryMission = null;

/**
 * Fetch history data from API
 */
async function fetchHistoryData(appState) {
    try {
        const baseUrl = appState?.apiBaseUrl || localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai';
        const response = await fetch(`${baseUrl}/missions/history`, {
            headers: {
                'X-API-Key': localStorage.getItem('missionize_api_key') || ''
            }
        });

        if (!response.ok) {
            console.warn('History API returned error, no missions to display');
            return [];
        }

        const data = await response.json();

        // Transform API response to match frontend format
        if (!data.missions || data.missions.length === 0) {
            return [];
        }

        return data.missions.map(m => ({
            id: m.id,
            summary: m.summary,
            status: m.status,
            mode: m.mode,
            duration: calculateDuration(m.submitted_at, m.last_update),
            timestamp: m.last_update || m.submitted_at
        }));
    } catch (error) {
        console.warn('Failed to fetch history data:', error.message);
        return [];
    }
}

/**
 * Calculate duration between two timestamps
 */
function calculateDuration(start, end) {
    if (!start || !end) return 'N/A';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}

/**
 * Render the history view
 */
export async function render(container, appState) {
    const missions = await fetchHistoryData(appState);

    // Show empty state if no missions
    if (missions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📜</div>
                <h3 class="empty-state-title">No Mission History Yet</h3>
                <p class="empty-state-description">
                    Your completed missions will appear here. Start using <strong>Mission Mode</strong> in the chat to run missions through the full consensus engine with cryptographic evidence.
                </p>
                <div class="empty-state-actions">
                    <button class="btn btn-primary" data-action="go-to-chat">
                        Go to Chat
                    </button>
                    <button class="btn btn-secondary" data-action="learn-more">
                        Learn More
                    </button>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Summary</th>
                    <th>Status</th>
                    <th>Mode</th>
                    <th>Duration</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                ${missions.map(mission => renderHistoryRow(mission)).join('')}
            </tbody>
        </table>
        <div id="history-details-container"></div>
    `;

    // Setup event listeners for rows
    setupRowEventListeners(missions);
}

/**
 * Render a history table row
 */
function renderHistoryRow(mission) {
    return `
        <tr class="history-row" data-mission-id="${mission.id}">
            <td><code>${mission.id}</code></td>
            <td>${escapeHtml(mission.summary)}</td>
            <td><span class="status-badge ${mission.status}">${mission.status}</span></td>
            <td>${mission.mode}</td>
            <td>${mission.duration}</td>
            <td>${new Date(mission.timestamp).toLocaleString()}</td>
        </tr>
    `;
}

/**
 * Setup event listeners for table rows
 */
function setupRowEventListeners(missions) {
    document.querySelectorAll('.history-row').forEach(row => {
        row.addEventListener('click', () => {
            const missionId = row.dataset.missionId;
            const mission = missions.find(m => m.id === missionId);
            showHistoryDetails(mission);
        });
    });
}

/**
 * Show mission details panel
 */
function showHistoryDetails(mission) {
    selectedHistoryMission = mission;
    const container = document.getElementById('history-details-container');

    container.innerHTML = `
        <div class="mission-details" style="margin-top: 1.5rem;">
            <div class="details-header">
                <h3 class="details-title">Mission Details: ${mission.id}</h3>
                <button class="details-close" data-action="close-details">&times;</button>
            </div>
            <div class="details-content">
                <div class="detail-row">
                    <span class="detail-label">Mission ID</span>
                    <span class="detail-value mono">${mission.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Summary</span>
                    <span class="detail-value">${escapeHtml(mission.summary)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">
                        <span class="status-badge ${mission.status}">${mission.status}</span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Mode</span>
                    <span class="detail-value">${mission.mode}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration</span>
                    <span class="detail-value">${mission.duration}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Completed At</span>
                    <span class="detail-value">${new Date(mission.timestamp).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Final Output</span>
                    <div class="log-output">
                        ${mission.status === 'completed'
                            ? 'Mission completed successfully. Final recommendations and analysis are available in the evidence section.'
                            : 'Mission failed. See error logs for details.'}
                    </div>
                </div>
            </div>
            <div class="details-actions">
                <button class="btn btn-secondary" data-action="view-full-report">View Full Report</button>
                <button class="btn btn-secondary" data-action="export-results">Export Results</button>
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
 * Refresh history data
 */
export async function refreshHistoryData() {
    return await fetchHistoryData({ apiBaseUrl: localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai' });
}

/**
 * Event delegation for all data-action handlers
 */
document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    switch (action) {
        case 'go-to-chat':
            document.querySelector('.nav-tab[data-view=\'chat\']')?.click();
            break;

        case 'learn-more':
            alert('Mission Mode provides:\n\n✓ Multi-agent consensus\n✓ Cryptographic proof (PEV)\n✓ Trust scores\n✓ Evidence envelopes\n\nSwitch to Mission Mode in the chat to try it!');
            break;

        case 'close-details':
            target.closest('.mission-details')?.remove();
            break;

        case 'view-full-report':
            alert('View Full Report - Not implemented');
            break;

        case 'export-results':
            alert('Export Results - Not implemented');
            break;
    }
});
