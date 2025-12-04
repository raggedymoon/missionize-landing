/**
 * Mission History View
 * Displays completed missions in a table format
 */

// Mock data - replace with real API calls later
const mockHistoryMissions = [
    {
        id: 'M-0003',
        summary: 'Generate market analysis report',
        status: 'completed',
        mode: 'Enterprise',
        duration: '15m 32s',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString()
    },
    {
        id: 'M-0005',
        summary: 'Process bulk data transformation',
        status: 'failed',
        mode: 'Fast',
        duration: '5m 12s',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString()
    },
    {
        id: 'M-0006',
        summary: 'Customer churn prediction analysis',
        status: 'completed',
        mode: 'Standard',
        duration: '8m 45s',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString()
    },
    {
        id: 'M-0007',
        summary: 'Quarterly financial forecasting',
        status: 'completed',
        mode: 'Enterprise',
        duration: '22m 18s',
        timestamp: new Date(Date.now() - 180 * 60000).toISOString()
    },
    {
        id: 'M-0008',
        summary: 'Competitor pricing analysis',
        status: 'completed',
        mode: 'Standard',
        duration: '12m 05s',
        timestamp: new Date(Date.now() - 240 * 60000).toISOString()
    },
    {
        id: 'M-0009',
        summary: 'Email campaign effectiveness review',
        status: 'failed',
        mode: 'Fast',
        duration: '3m 22s',
        timestamp: new Date(Date.now() - 300 * 60000).toISOString()
    },
    {
        id: 'M-0010',
        summary: 'Product roadmap validation',
        status: 'completed',
        mode: 'Standard',
        duration: '18m 41s',
        timestamp: new Date(Date.now() - 360 * 60000).toISOString()
    }
];

let selectedHistoryMission = null;

/**
 * Fetch history data (async stub for future API integration)
 */
async function fetchHistoryData(appState) {
    // TODO: Replace with real fetch call
    // const response = await fetch(`${appState.apiBaseUrl}/missions/history`);
    // return await response.json();
    return mockHistoryMissions;
}

/**
 * Render the history view
 */
export async function render(container, appState) {
    const missions = await fetchHistoryData(appState);

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
                <button class="details-close" onclick="this.closest('.mission-details').remove()">&times;</button>
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
                <button class="btn btn-secondary" onclick="alert('View Full Report - Not implemented')">View Full Report</button>
                <button class="btn btn-secondary" onclick="alert('Export Results - Not implemented')">Export Results</button>
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
