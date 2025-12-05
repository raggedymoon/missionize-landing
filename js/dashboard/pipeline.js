/**
 * Mission Pipeline View
 * Displays missions in Queued, Running, Completed, and Failed lanes
 */

// Mock data - replace with real API calls later
const mockPipelineMissions = [
    {
        id: 'M-0001',
        summary: 'Analyze quarterly revenue trends',
        status: 'running',
        mode: 'Standard',
        submittedAt: new Date(Date.now() - 5 * 60000).toISOString(),
        lastUpdate: new Date(Date.now() - 1 * 60000).toISOString(),
        progress: 65,
        needsHumanInput: false,
        logs: ['Fetching data...', 'Processing with AI agents...', 'Generating insights...']
    },
    {
        id: 'M-0002',
        summary: 'Review customer feedback sentiment',
        status: 'queued',
        mode: 'Fast',
        submittedAt: new Date(Date.now() - 2 * 60000).toISOString(),
        lastUpdate: new Date(Date.now() - 2 * 60000).toISOString(),
        progress: 0,
        needsHumanInput: false,
        logs: []
    },
    {
        id: 'M-0003',
        summary: 'Generate market analysis report',
        status: 'completed',
        mode: 'Enterprise',
        submittedAt: new Date(Date.now() - 30 * 60000).toISOString(),
        lastUpdate: new Date(Date.now() - 10 * 60000).toISOString(),
        progress: 100,
        needsHumanInput: false,
        logs: ['Completed successfully']
    },
    {
        id: 'M-0004',
        summary: 'Validate compliance requirements',
        status: 'running',
        mode: 'Standard',
        submittedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        lastUpdate: new Date(Date.now() - 3 * 60000).toISOString(),
        progress: 45,
        needsHumanInput: true,
        logs: ['Awaiting human input for clarification...']
    },
    {
        id: 'M-0005',
        summary: 'Process bulk data transformation',
        status: 'failed',
        mode: 'Fast',
        submittedAt: new Date(Date.now() - 60 * 60000).toISOString(),
        lastUpdate: new Date(Date.now() - 55 * 60000).toISOString(),
        progress: 30,
        needsHumanInput: false,
        logs: ['Error: Timeout exceeded', 'Retry limit reached']
    }
];

let selectedMission = null;

/**
 * Fetch pipeline data from API
 */
async function fetchPipelineData(appState) {
    try {
        const baseUrl = appState?.apiBaseUrl || localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai';
        const response = await fetch(`${baseUrl}/missions/pipeline`, {
            headers: {
                'X-API-Key': localStorage.getItem('missionize_api_key') || ''
            }
        });
        
        if (!response.ok) {
            console.warn('Pipeline API returned error, using mock data');
            return mockPipelineMissions;
        }
        
        const data = await response.json();
        
        // Transform API response to match frontend format
        const missions = [
            ...data.queued.map(m => ({...m, status: 'queued', submittedAt: m.submitted_at, lastUpdate: m.last_update, needsHumanInput: m.needs_human_input})),
            ...data.running.map(m => ({...m, status: 'running', submittedAt: m.submitted_at, lastUpdate: m.last_update, needsHumanInput: m.needs_human_input})),
            ...data.completed.map(m => ({...m, status: 'completed', submittedAt: m.submitted_at, lastUpdate: m.last_update, needsHumanInput: m.needs_human_input})),
            ...data.failed.map(m => ({...m, status: 'failed', submittedAt: m.submitted_at, lastUpdate: m.last_update, needsHumanInput: m.needs_human_input}))
        ];
        
        return missions;
    } catch (error) {
        console.warn('Failed to fetch pipeline data, using mock:', error.message);
        return mockPipelineMissions;
    }
}

/**
 * Render the pipeline view
 */
export async function render(container, appState) {
    const missions = await fetchPipelineData(appState);

    // Group missions by status
    const grouped = {
        queued: missions.filter(m => m.status === 'queued'),
        running: missions.filter(m => m.status === 'running'),
        completed: missions.filter(m => m.status === 'completed'),
        failed: missions.filter(m => m.status === 'failed')
    };

    container.innerHTML = `
        <div class="pipeline-container">
            ${renderLane('Queued', grouped.queued, 'queued')}
            ${renderLane('Running', grouped.running, 'running')}
            ${renderLane('Completed', grouped.completed, 'completed')}
            ${renderLane('Failed', grouped.failed, 'failed')}
        </div>
        <div id="mission-details-container"></div>
    `;

    // Setup event listeners for mission cards
    setupCardEventListeners(missions);
}

/**
 * Render a pipeline lane
 */
function renderLane(title, missions, statusClass) {
    return `
        <div class="pipeline-lane">
            <div class="lane-header">
                <h3 class="lane-title">${title}</h3>
                <span class="lane-count">${missions.length}</span>
            </div>
            <div class="mission-cards">
                ${missions.map(mission => renderMissionCard(mission)).join('')}
            </div>
        </div>
    `;
}

/**
 * Render a mission card
 */
function renderMissionCard(mission) {
    const timeAgo = formatTimeAgo(new Date(mission.lastUpdate));
    const submittedAgo = formatTimeAgo(new Date(mission.submittedAt));

    return `
        <div class="mission-card" data-mission-id="${mission.id}">
            <div class="mission-header">
                <span class="mission-id">${mission.id}</span>
                <span class="status-badge ${mission.status}">${mission.status}</span>
            </div>
            <div class="mission-summary">${escapeHtml(mission.summary)}</div>
            <div class="mission-meta">
                <div>Submitted: ${submittedAgo}</div>
                <div>Updated: ${timeAgo}</div>
            </div>
            ${mission.status === 'running' ? `
                <div class="mission-progress">
                    <div class="mission-progress-fill" style="width: ${mission.progress}%"></div>
                </div>
            ` : ''}
            ${mission.needsHumanInput ? `
                <div class="needs-input-badge">⚠️ Needs Input</div>
            ` : ''}
        </div>
    `;
}

/**
 * Setup event listeners for mission cards
 */
function setupCardEventListeners(missions) {
    document.querySelectorAll('.mission-card').forEach(card => {
        card.addEventListener('click', () => {
            const missionId = card.dataset.missionId;
            const mission = missions.find(m => m.id === missionId);

            // Remove selected class from all cards
            document.querySelectorAll('.mission-card').forEach(c => {
                c.classList.remove('selected');
            });

            // Add selected class to clicked card
            card.classList.add('selected');

            // Show mission details
            showMissionDetails(mission);
        });
    });
}

/**
 * Show mission details panel
 */
function showMissionDetails(mission) {
    selectedMission = mission;
    const container = document.getElementById('mission-details-container');

    container.innerHTML = `
        <div class="mission-details">
            <div class="details-header">
                <h3 class="details-title">${escapeHtml(mission.summary)}</h3>
                <button class="details-close" data-action="close-details">&times;</button>
            </div>
            <div class="details-content">
                <div class="detail-row">
                    <span class="detail-label">Mission ID</span>
                    <span class="detail-value mono">${mission.id}</span>
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
                    <span class="detail-label">Submitted</span>
                    <span class="detail-value">${new Date(mission.submittedAt).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Last Update</span>
                    <span class="detail-value">${new Date(mission.lastUpdate).toLocaleString()}</span>
                </div>
                ${mission.progress > 0 ? `
                    <div class="detail-row">
                        <span class="detail-label">Progress</span>
                        <span class="detail-value">${mission.progress}%</span>
                    </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Recent Logs</span>
                    <div class="log-output">
                        ${mission.logs.length > 0 ? mission.logs.map(log => escapeHtml(log)).join('\n') : 'No logs available'}
                    </div>
                </div>
            </div>
            <div class="details-actions">
                <button class="btn btn-secondary" data-action="view-evidence">View Evidence</button>
                <button class="btn btn-secondary" data-action="view-history">View History</button>
            </div>
        </div>
    `;
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
 * Refresh pipeline data
 */
export async function refreshPipelineData() {
    // This would be called externally to refresh the view
    return await fetchPipelineData({ apiBaseUrl: localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai' });
}

// Event delegation for dynamic button actions
document.addEventListener('click', (e) => {
    const action = e.target.dataset.action;

    if (action === 'close-details') {
        const detailsPanel = e.target.closest('.mission-details');
        if (detailsPanel) {
            detailsPanel.remove();
        }
    } else if (action === 'view-evidence') {
        alert('View Evidence - Not implemented');
    } else if (action === 'view-history') {
        alert('View History - Not implemented');
    }
});
