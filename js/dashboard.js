/**
 * Missionize Dashboard - Main Entry Point
 * Handles view routing and app state management
 */

import { render as renderChat } from './dashboard/chat.js';
import { render as renderPipeline } from './dashboard/pipeline.js';
import { render as renderHistory } from './dashboard/history.js';
import { render as renderEvidence } from './dashboard/evidence.js';
import { render as renderPatterns } from './dashboard/patterns.js';
import { render as renderMizzi } from './dashboard/mizzi.js';
import { render as renderSettings } from './dashboard/settings.js';

// Application state
const appState = {
    apiBaseUrl: localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai',
    currentView: 'chat',
    selectedMissionId: null
};

// View registry
const views = {
    chat: renderChat,
    pipeline: renderPipeline,
    history: renderHistory,
    evidence: renderEvidence,
    patterns: renderPatterns,
    mizzi: renderMizzi,
    settings: renderSettings
};

// DOM Elements
let mainViewContainer = null;
let pageTitleElement = null;
let navTabs = [];

/**
 * Initialize dashboard on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

/**
 * Main initialization function
 */
function initDashboard() {
    // Cache DOM elements
    mainViewContainer = document.getElementById('main-view');
    pageTitleElement = document.querySelector('.page-title');
    navTabs = Array.from(document.querySelectorAll('.nav-tab'));

    // Setup event listeners
    setupNavigation();

    // Load initial view (chat by default)
    switchView('chat');
}

/**
 * Setup navigation event listeners
 */
function setupNavigation() {
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const viewName = tab.dataset.view;
            switchView(viewName);
        });
    });

    // Setup console navigation (separate page)
    const consoleNav = document.getElementById('console-nav');
    if (consoleNav) {
        consoleNav.addEventListener('click', () => {
            window.location.href = 'console.html';
        });
    }
}

/**
 * Switch to a different view
 * @param {string} viewName - Name of the view to switch to
 */
function switchView(viewName) {
    if (!views[viewName]) {
        console.error(`View "${viewName}" not found`);
        return;
    }

    // Update app state
    appState.currentView = viewName;

    // Update active tab
    navTabs.forEach(tab => {
        if (tab.dataset.view === viewName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update page title
    const titles = {
        chat: 'Chat',
        pipeline: 'Mission Pipeline',
        history: 'Mission History',
        evidence: 'Evidence',
        patterns: 'Patterns',
        mizzi: 'Mizzi',
        settings: 'Settings'
    };
    pageTitleElement.textContent = titles[viewName] || viewName;

    // Clear and render new view
    mainViewContainer.innerHTML = '';
    views[viewName](mainViewContainer, appState);
}

/**
 * Refresh current view
 */
export function refreshCurrentView() {
    switchView(appState.currentView);
}

/**
 * Update app state and optionally refresh
 * @param {Object} updates - State updates to apply
 * @param {boolean} refresh - Whether to refresh the current view
 */
export function updateAppState(updates, refresh = false) {
    Object.assign(appState, updates);
    if (refresh) {
        refreshCurrentView();
    }
}

/**
 * Get current app state
 * @returns {Object} Current app state
 */
export function getAppState() {
    return { ...appState };
}

/**
 * Switch to pipeline view and highlight specific mission
 * @param {string} missionId - Mission ID to highlight
 */
window.switchViewToMission = function(missionId) {
    appState.selectedMissionId = missionId;
    switchView('pipeline');
};

/**
 * Switch to evidence view and select specific mission
 * @param {string} missionId - Mission ID to show evidence for
 */
window.switchViewToEvidence = function(missionId) {
    appState.selectedMissionId = missionId;
    switchView('evidence');
};
