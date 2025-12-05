/**
 * API Helper Module
 * Handles all HTTP communication with Missionize backend
 */

/**
 * Get the API base URL from app state or localStorage
 * @param {Object} appState - Application state object
 * @returns {string} API base URL
 */
export function getApiBaseUrl(appState) {
    if (appState && appState.apiBaseUrl) {
        return appState.apiBaseUrl;
    }
    return localStorage.getItem('missionize_api_url') || 'https://api.missionize.ai';
}

/**
 * Get API key from localStorage (if needed for authentication)
 * @returns {string|null} API key or null
 */
function getApiKey() {
    return localStorage.getItem('missionize_api_key') || null;
}

/**
 * Make a POST request with JSON body
 * @param {string} path - API endpoint path (e.g., '/api/chat/send')
 * @param {Object} body - Request body
 * @param {Object} appState - Application state
 * @returns {Promise<Object>} Response JSON
 * @throws {Error} If request fails
 */
export async function postJson(path, body, appState) {
    const baseUrl = getApiBaseUrl(appState);
    const url = `${baseUrl}${path}`;

    const headers = {
        'Content-Type': 'application/json'
    };

    // Add API key if available (Missionize uses X-API-Key header)
    const apiKey = getApiKey();
    if (apiKey) {
        headers['X-API-Key'] = apiKey;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.detail || errorJson.message || errorText;
            } catch (e) {
                errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        // Network error or parsing error
        if (error.message.includes('Failed to fetch')) {
            throw new Error(`Cannot connect to API at ${baseUrl}. Is the backend running?`);
        }
        throw error;
    }
}

/**
 * Make a GET request
 * @param {string} path - API endpoint path
 * @param {Object} appState - Application state
 * @returns {Promise<Object>} Response JSON
 * @throws {Error} If request fails
 */
export async function getJson(path, appState) {
    const baseUrl = getApiBaseUrl(appState);
    const url = `${baseUrl}${path}`;

    const headers = {};

    // Add API key if available (Missionize uses X-API-Key header)
    const apiKey = getApiKey();
    if (apiKey) {
        headers['X-API-Key'] = apiKey;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.detail || errorJson.message || errorText;
            } catch (e) {
                errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        // Network error or parsing error
        if (error.message.includes('Failed to fetch')) {
            throw new Error(`Cannot connect to API at ${baseUrl}. Is the backend running?`);
        }
        throw error;
    }
}

/**
 * Create an EventSource for Server-Sent Events (SSE) streaming
 * @param {string} path - API endpoint path (e.g., '/api/chat/stream')
 * @param {Object} appState - Application state
 * @returns {EventSource} EventSource instance
 */
export function createEventSource(path, appState) {
    const baseUrl = getApiBaseUrl(appState);
    const url = `${baseUrl}${path}`;

    // EventSource doesn't support custom headers directly
    // If auth is needed, include token in URL query params
    const apiKey = getApiKey();
    const finalUrl = apiKey ? `${url}?token=${encodeURIComponent(apiKey)}` : url;

    return new EventSource(finalUrl);
}

/**
 * Create an EventSource for chat streaming with message_id
 * @param {string} messageId - Message ID from /api/chat/send response
 * @param {Object} appState - Application state
 * @returns {EventSource} EventSource instance
 */
export function createChatStream(messageId, appState) {
    const baseUrl = getApiBaseUrl(appState);
    const apiKey = getApiKey();

    // Build URL with message_id parameter
    let url = `${baseUrl}/api/chat/stream?message_id=${encodeURIComponent(messageId)}`;

    // Add API key if available
    if (apiKey) {
        url += `&token=${encodeURIComponent(apiKey)}`;
    }

    return new EventSource(url);
}

/**
 * Test API connectivity
 * @param {Object} appState - Application state
 * @returns {Promise<Object>} Health check response
 */
export async function testConnection(appState) {
    try {
        return await getJson('/health', appState);
    } catch (error) {
        throw new Error(`API connection test failed: ${error.message}`);
    }
}

/**
 * Run a mission through the full consensus engine
 * @param {string} task - The user's task/question
 * @param {Array} messages - Conversation history for context
 * @param {Object} appState - Application state
 * @param {Array} fileContents - Array of file objects with {name, content, type, size}
 * @returns {Promise<Object>} Mission response with evidence
 */
export async function runMission(task, messages, appState, fileContents = []) {
    // Build context from conversation history
    const context = {
        conversation_history: messages.map(m => ({
            role: m.role,
            content: m.content
        }))
    };

    // Add file contents to context if present
    if (fileContents.length > 0) {
        context.attached_files = fileContents.map(f => ({
            name: f.name,
            content: f.content,
            type: f.type
        }));

        // Also append file info to the task
        const fileList = fileContents.map(f => `[Attached: ${f.name}]`).join(' ');
        task = `${task}\n\n${fileList}`;

        console.log('[API] runMission: Including', fileContents.length, 'file(s) in context');
    }

    const payload = {
        task: task,
        context: context,
        execution_mode: "fast", // Use fast mode for responsive UX (2 agents, ~5s)
        require_consensus: true,
        enable_pattern_learning: true
    };

    // Add timeout for long-running consensus (120 seconds)
    const timeoutMs = 120000;
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Mission Mode timeout after ${timeoutMs/1000}s. Consensus pipeline may be taking longer than expected. Try again or use Fast mode.`)), timeoutMs);
    });

    return await Promise.race([
        postJson('/run-custom', payload, appState),
        timeoutPromise
    ]);
}
