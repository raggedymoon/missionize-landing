/**
 * Patterns View
 * Displays the pattern registry and usage statistics
 */

// Mock data - replace with real API calls later
const mockPatternsData = [
    {
        name: 'Market Analysis',
        category: 'Business Intelligence',
        usageCount: 142,
        successRate: 94.4
    },
    {
        name: 'Financial Forecasting',
        category: 'Finance',
        usageCount: 87,
        successRate: 91.2
    },
    {
        name: 'Customer Segmentation',
        category: 'Marketing',
        usageCount: 203,
        successRate: 96.8
    },
    {
        name: 'Risk Assessment',
        category: 'Compliance',
        usageCount: 56,
        successRate: 89.3
    },
    {
        name: 'Product Roadmap Planning',
        category: 'Product',
        usageCount: 34,
        successRate: 88.2
    },
    {
        name: 'Competitor Analysis',
        category: 'Business Intelligence',
        usageCount: 119,
        successRate: 93.5
    },
    {
        name: 'Sentiment Analysis',
        category: 'Marketing',
        usageCount: 267,
        successRate: 97.2
    },
    {
        name: 'Data Quality Validation',
        category: 'Data Engineering',
        usageCount: 178,
        successRate: 92.1
    },
    {
        name: 'Compliance Audit',
        category: 'Compliance',
        usageCount: 45,
        successRate: 86.7
    },
    {
        name: 'Churn Prediction',
        category: 'Analytics',
        usageCount: 91,
        successRate: 90.1
    }
];

/**
 * Fetch patterns data from API
 */
async function fetchPatternsData(appState) {
    try {
        const baseUrl = appState?.apiBaseUrl || localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai';
        const response = await fetch(`${baseUrl}/patterns`, {
            headers: {
                'X-API-Key': localStorage.getItem('missionize_api_key') || ''
            }
        });
        
        if (!response.ok) {
            console.warn('Patterns API returned error, using mock data');
            return mockPatternsData;
        }
        
        const data = await response.json();
        
        // Transform API response to match frontend format
        if (data.patterns && data.patterns.length > 0) {
            return data.patterns.map(p => ({
                name: p.name || p.pattern_id || 'Unknown Pattern',
                category: p.category || p.mission_type || 'General',
                usageCount: p.usage_count || p.execution_count || 0,
                successRate: p.success_rate || (p.score ? p.score * 100 : 0)
            }));
        }
        
        return mockPatternsData;
    } catch (error) {
        console.warn('Failed to fetch patterns data, using mock:', error.message);
        return mockPatternsData;
    }
}

/**
 * Render the patterns view
 */
export async function render(container, appState) {
    const patterns = await fetchPatternsData(appState);

    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <p style="color: var(--color-text-muted); font-size: 0.95rem;">
                Patterns are reusable mission templates that help you quickly execute common tasks.
                Below are the available patterns in your registry.
            </p>
        </div>
        <div class="patterns-grid">
            ${patterns.map(pattern => renderPatternCard(pattern)).join('')}
        </div>
    `;
}

/**
 * Render a pattern card
 */
function renderPatternCard(pattern) {
    const successColor = pattern.successRate >= 95 ? 'var(--color-success)' :
                        pattern.successRate >= 90 ? 'var(--color-primary)' :
                        'var(--color-warning)';

    return `
        <div class="pattern-card">
            <div class="pattern-name">${escapeHtml(pattern.name)}</div>
            <div class="pattern-category">${escapeHtml(pattern.category)}</div>
            <div class="pattern-stats">
                <div>
                    <div style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.25rem;">
                        Usage Count
                    </div>
                    <div style="font-size: 1.25rem; font-weight: 600; color: var(--color-text);">
                        ${pattern.usageCount}
                    </div>
                </div>
                <div>
                    <div style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.25rem;">
                        Success Rate
                    </div>
                    <div style="font-size: 1.25rem; font-weight: 600; color: ${successColor};">
                        ${pattern.successRate}%
                    </div>
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <button class="btn btn-secondary" style="width: 100%;" data-action="use-pattern" data-pattern-name="${escapeHtml(pattern.name)}">
                    Use Pattern
                </button>
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
 * Refresh patterns data
 */
export async function refreshPatternsData() {
    return await fetchPatternsData({ apiBaseUrl: localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai' });
}

// Event delegation for dynamic button actions
document.addEventListener('click', (e) => {
    const action = e.target.dataset.action;

    if (action === 'use-pattern') {
        const patternName = e.target.dataset.patternName;
        alert(`Use Pattern: ${patternName} - Not implemented`);
    }
});
