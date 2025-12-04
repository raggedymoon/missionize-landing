/**
 * Chat View - Main Chat Interface
 * Primary interface for interacting with Missionize AI
 */

import { postJson, getJson, getApiBaseUrl, createChatStream } from './api.js';

// State management
let currentConversation = null;
let conversations = [];
let attachedFiles = [];
let isStreaming = false;
let selectedModel = 'gpt-4o-mini';
let currentAppState = null;

// Available models (will be populated from backend)
let MODELS = [
    // Fallback models if backend is unavailable
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
    { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic' }
];

/**
 * Initialize chat on load
 */
async function initChat() {
    // Load conversations from localStorage
    const stored = localStorage.getItem('missionize_conversations');
    if (stored) {
        try {
            conversations = JSON.parse(stored);
        } catch (e) {
            conversations = [];
        }
    }

    // Load selected model
    const storedModel = localStorage.getItem('missionize_selected_model');
    if (storedModel) {
        selectedModel = storedModel;
    }

    // Fetch available models from backend
    await fetchModels();

    // Create new conversation if none exists
    if (conversations.length === 0) {
        createNewConversation();
    } else {
        currentConversation = conversations[0];
    }
}

/**
 * Fetch available models from backend
 */
async function fetchModels() {
    try {
        const response = await getJson('/api/chat/models', currentAppState);
        if (response && response.models && response.models.length > 0) {
            MODELS = response.models;
            console.log('Loaded models from backend:', MODELS.length);

            // If selected model is not in the list, select the first one
            if (!MODELS.find(m => m.id === selectedModel)) {
                selectedModel = MODELS[0].id;
                localStorage.setItem('missionize_selected_model', selectedModel);
            }
        }
    } catch (error) {
        console.warn('Failed to fetch models, using fallback list:', error.message);
        // Keep fallback models
    }
}

/**
 * Create new conversation
 */
function createNewConversation() {
    currentConversation = {
        id: 'conv-' + Date.now(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    conversations.unshift(currentConversation);
    saveConversations();
}

/**
 * Save conversations to localStorage
 */
function saveConversations() {
    localStorage.setItem('missionize_conversations', JSON.stringify(conversations));
}

/**
 * Render the chat view
 */
export async function render(container, appState) {
    currentAppState = appState; // Store for later use
    await initChat();

    container.innerHTML = `
        <div class="chat-view">
            <!-- Model Selector Bar -->
            <div class="chat-header">
                <div class="model-selector-container">
                    <label class="model-selector-label">Model:</label>
                    <select id="model-selector" class="model-selector">
                        ${MODELS.map(model => `
                            <option value="${model.id}" ${model.id === selectedModel ? 'selected' : ''}>
                                ${model.name}${model.provider ? ` (${model.provider})` : ''}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <button class="btn btn-secondary" id="new-chat-btn">
                    <span>+ New Chat</span>
                </button>
            </div>

            <!-- Messages Container -->
            <div class="chat-messages" id="chat-messages">
                ${renderMessages()}
            </div>

            <!-- Input Container -->
            <div class="chat-input-container">
                <!-- Attached Files -->
                <div class="attached-files" id="attached-files">
                    ${renderAttachedFiles()}
                </div>

                <!-- Drag-drop overlay -->
                <div class="drag-drop-overlay" id="drag-drop-overlay" style="display: none;">
                    <div class="drag-drop-message">
                        <div class="drag-drop-icon">📎</div>
                        <div>Drop files here to attach</div>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="chat-input-wrapper">
                    <button class="btn-icon" id="attach-file-btn" title="Attach file">
                        <span>📎</span>
                    </button>
                    <textarea
                        id="chat-input"
                        class="chat-input"
                        placeholder="Describe your mission..."
                        rows="1"
                    ></textarea>
                    <button class="btn-icon btn-send" id="send-btn" title="Send message">
                        <span>➤</span>
                    </button>
                </div>
                <input type="file" id="file-input" style="display: none;" multiple>
            </div>
        </div>
    `;

    // Setup event listeners
    setupEventListeners(container, appState);

    // Scroll to bottom
    scrollToBottom();
}

/**
 * Render messages
 */
function renderMessages() {
    if (!currentConversation || currentConversation.messages.length === 0) {
        return `
            <div class="chat-empty">
                <div class="chat-empty-icon">💬</div>
                <h3>Start a conversation</h3>
                <p>Ask me anything - I can help with code, analysis, research, and more.</p>
                <div class="chat-suggestions">
                    <button class="suggestion-btn" data-suggestion="Analyze this CSV file for trends">
                        Analyze data
                    </button>
                    <button class="suggestion-btn" data-suggestion="Write a Python function to process user input">
                        Write code
                    </button>
                    <button class="suggestion-btn" data-suggestion="Explain the DMCR routing algorithm">
                        Explain concepts
                    </button>
                </div>
            </div>
        `;
    }

    return currentConversation.messages.map(msg => renderMessage(msg)).join('');
}

/**
 * Render a single message
 */
function renderMessage(msg) {
    const isUser = msg.role === 'user';
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
        <div class="message ${isUser ? 'message-user' : 'message-ai'}">
            <div class="message-header">
                <span class="message-role">${isUser ? '👤 You' : '🤖 Missionize'}</span>
                ${!isUser && msg.model ? `<span class="message-model">(${getModelName(msg.model)})</span>` : ''}
                <span class="message-time">${time}</span>
            </div>
            <div class="message-content">
                ${renderMessageContent(msg.content)}
            </div>
            ${msg.files && msg.files.length > 0 ? `
                <div class="message-files">
                    ${msg.files.map(file => `<span class="file-chip">📎 ${file.name}</span>`).join('')}
                </div>
            ` : ''}
            ${!isUser && msg.mizziStatus ? renderMizziStatus(msg) : ''}
            ${!isUser && msg.evidenceHash ? `
                <div class="message-evidence">
                    <button class="btn-text" onclick="alert('Evidence: ${msg.evidenceHash}')">
                        🔒 View Evidence
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Render Mizzi status chip and mission info
 */
function renderMizziStatus(msg) {
    if (!msg.mizziStatus) return '';

    const statusConfig = {
        'passed': { icon: '✅', label: 'Mizzi Validated', color: '#10b981' },
        'completed': { icon: '✅', label: 'Completed', color: '#10b981' },
        'failed': { icon: '❌', label: 'Mizzi Rejected', color: '#ef4444' },
        'pending': { icon: '⏳', label: 'Mizzi Pending', color: '#f59e0b' },
        'error': { icon: '⚠️', label: 'Error', color: '#f59e0b' }
    };

    const status = statusConfig[msg.mizziStatus] || statusConfig['pending'];

    return `
        <div class="message-status">
            <div class="status-chip" style="background-color: ${status.color}20; color: ${status.color}; border: 1px solid ${status.color}40;">
                ${status.icon} ${status.label}
            </div>
            ${msg.missionId ? `
                <div class="mission-info">
                    <span class="mission-id">Mission: ${msg.missionId}</span>
                    ${msg.filesGenerated ? `<span class="mission-files">${msg.filesGenerated} files</span>` : ''}
                </div>
            ` : ''}
            ${msg.missionId ? `
                <div class="mission-actions">
                    <button class="btn-text" onclick="window.switchViewToMission('${msg.missionId}')">
                        View Mission
                    </button>
                    <button class="btn-text" onclick="window.switchViewToEvidence('${msg.missionId}')">
                        View Evidence
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Render message content (supports markdown)
 */
function renderMessageContent(content) {
    // Simple markdown rendering
    let html = escapeHtml(content);

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'plaintext';
        return `
            <div class="code-block">
                <div class="code-block-header">
                    <span class="code-language">${language}</span>
                    <button class="btn-copy" onclick="copyToClipboard(\`${escapeForJs(code.trim())}\`)">
                        Copy
                    </button>
                </div>
                <pre><code>${escapeHtml(code.trim())}</code></pre>
            </div>
        `;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
}

/**
 * Get model display name
 */
function getModelName(modelId) {
    const model = MODELS.find(m => m.id === modelId);
    return model ? model.name : modelId;
}

/**
 * Render attached files
 */
function renderAttachedFiles() {
    if (attachedFiles.length === 0) return '';

    return `
        <div class="file-chips">
            ${attachedFiles.map((file, index) => `
                <div class="file-chip">
                    <span class="file-icon">📎</span>
                    <span class="file-name">${escapeHtml(file.name)}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                    <button class="file-remove" onclick="window.removeFile(${index})" title="Remove">×</button>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Setup event listeners
 */
function setupEventListeners(container, appState) {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const attachBtn = document.getElementById('attach-file-btn');
    const fileInput = document.getElementById('file-input');
    const modelSelector = document.getElementById('model-selector');
    const newChatBtn = document.getElementById('new-chat-btn');
    const messagesContainer = document.getElementById('chat-messages');

    // Send message
    sendBtn.addEventListener('click', () => sendMessage(appState));

    // Enter to send, Shift+Enter for newline
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(appState);
        }
    });

    // Auto-grow textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 200) + 'px';
    });

    // Attach file button
    attachBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files);
        fileInput.value = ''; // Reset
    });

    // Model selector change
    modelSelector.addEventListener('change', (e) => {
        selectedModel = e.target.value;
        localStorage.setItem('missionize_selected_model', selectedModel);
    });

    // New chat button
    newChatBtn.addEventListener('click', () => {
        createNewConversation();
        render(container, appState);
    });

    // Drag and drop
    const inputContainer = container.querySelector('.chat-input-container');
    const dragOverlay = document.getElementById('drag-drop-overlay');

    inputContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragOverlay.style.display = 'flex';
    });

    inputContainer.addEventListener('dragleave', (e) => {
        if (e.target === inputContainer) {
            dragOverlay.style.display = 'none';
        }
    });

    inputContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        dragOverlay.style.display = 'none';
        handleFileSelect(e.dataTransfer.files);
    });

    // Suggestion buttons
    const suggestionBtns = container.querySelectorAll('.suggestion-btn');
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chatInput.value = btn.dataset.suggestion;
            chatInput.focus();
        });
    });
}

/**
 * Handle file selection
 */
function handleFileSelect(files) {
    Array.from(files).forEach(file => {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
            return;
        }

        attachedFiles.push(file);
    });

    // Update UI
    document.getElementById('attached-files').innerHTML = renderAttachedFiles();
}

/**
 * Remove file
 */
window.removeFile = function(index) {
    attachedFiles.splice(index, 1);
    document.getElementById('attached-files').innerHTML = renderAttachedFiles();
};

/**
 * Send message
 */
async function sendMessage(appState) {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();

    if (!message && attachedFiles.length === 0) return;
    if (isStreaming) return;

    // Add user message
    const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        files: attachedFiles.map(f => ({ name: f.name, size: f.size }))
    };

    currentConversation.messages.push(userMessage);
    currentConversation.updatedAt = new Date().toISOString();

    // Update title if first message
    if (currentConversation.messages.length === 1) {
        currentConversation.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
    }

    saveConversations();

    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    attachedFiles = [];

    // Re-render to show user message
    const container = document.querySelector('.content-container');
    await render(container, appState);

    // Call real backend API
    await sendToBackend(message, appState);
}

/**
 * Send message to backend and handle response
 */
async function sendToBackend(message, appState) {
    isStreaming = true;

    // Create AI message placeholder
    const aiMessage = {
        role: 'assistant',
        content: '⏳ Sending to Missionize backend...',
        timestamp: new Date().toISOString(),
        model: selectedModel,
        missionId: null,
        mizziStatus: null
    };

    currentConversation.messages.push(aiMessage);
    saveConversations();

    // Re-render to show loading message
    const container = document.querySelector('.content-container');
    await render(container, appState);

    try {
        // Build messages array from conversation history
        // Filter out placeholder messages (starting with ⏳) and empty content
        const messages = currentConversation.messages
            .filter(msg => (msg.role === 'user' || msg.role === 'assistant') && msg.content && !msg.content.startsWith('⏳'))
            .map(msg => ({
                role: msg.role,
                content: msg.content
            }));
        
        console.log('[Chat] Sending messages:', messages);

        // Build request payload
        const payload = {
            messages: messages,
            model_id: selectedModel,
            conversation_id: currentConversation.id
        };

        // Call new backend API endpoint
        console.log('[Chat] Calling /api/chat/send with payload:', payload);
        const response = await postJson('/api/chat/send', payload, appState);
        console.log('[Chat] Got response:', response);

        // Check if streaming is available
        if (response.stream_url || response.message_id) {
            console.log('[Chat] Starting SSE stream for message_id:', response.message_id);
            // Use SSE streaming
            const messageId = response.message_id;
            await handleStreamingResponse(messageId, aiMessage, appState, container);
        } else {
            // Fallback to non-streaming response
            handleNonStreamingResponse(response, aiMessage);
        }

        saveConversations();

    } catch (error) {
        // Handle error
        aiMessage.content = `**Error:** ${error.message}\n\nPlease check:\n• Is the backend running?\n• Is the API URL correct? (${getApiBaseUrl(appState)})\n• Check browser console for details`;
        aiMessage.mizziStatus = 'error';
        saveConversations();

        console.error('Backend API error:', error);
    }

    isStreaming = false;

    // Don't re-render here - the streaming handler already updated the DOM
    // and saved to localStorage. Re-rendering would cause a flash/reset.
    // Just scroll to bottom to ensure visibility
    scrollToBottom();
}

/**
 * Handle streaming response via SSE
 */
async function handleStreamingResponse(messageId, aiMessage, appState, container) {
    return new Promise((resolve, reject) => {
        try {
            console.log('[SSE] Creating EventSource for message_id:', messageId);
            const eventSource = createChatStream(messageId, appState);
            console.log('[SSE] EventSource created, URL:', eventSource.url);
            let accumulatedContent = '';

            eventSource.addEventListener('chunk', (event) => {
                console.log('[SSE] Got chunk event:', event.data);
                const data = JSON.parse(event.data);
                if (data.text || data.content) {
                    accumulatedContent += (data.text || data.content);
                    console.log('[SSE] Accumulated content length:', accumulatedContent.length);
                    aiMessage.content = accumulatedContent;
                    
                    // Update the message content directly in the DOM
                    // Find the last .message-ai element and update its content
                    const messageElements = document.querySelectorAll('.message-ai .message-content');
                    if (messageElements.length > 0) {
                        const lastMessageContent = messageElements[messageElements.length - 1];
                        lastMessageContent.innerHTML = accumulatedContent.replace(/\n/g, '<br>');
                    }
                    
                    scrollToBottom();
                }
            });

            eventSource.addEventListener('final', (event) => {
                console.log('[SSE] Got final event:', event.data);
                const data = JSON.parse(event.data);

                // Use accumulated content (NOT data.content which doesn't exist)
                aiMessage.content = accumulatedContent;
                aiMessage.missionId = data.mission_id || null;
                aiMessage.mizziStatus = data.mizzi_status || 'completed';
                aiMessage.filesGenerated = data.files_generated || 0;
                
                console.log('[SSE] Final aiMessage.content length:', aiMessage.content.length);

                eventSource.close();
                saveConversations();
                console.log('[SSE] Saved to localStorage');
                resolve();
            });

            // Listen for backend error events (from the SSE stream)
            eventSource.addEventListener('error', (event) => {
                // Check if this is a data event with error info from backend
                if (event.data) {
                    try {
                        const errorData = JSON.parse(event.data);
                        console.error('SSE backend error:', errorData);
                        aiMessage.content = `**Error from backend:** ${errorData.error || 'Unknown error'}\n\nError code: ${errorData.error_code || 'UNKNOWN'}`;
                        aiMessage.mizziStatus = 'error';
                    } catch (e) {
                        // Not JSON, treat as connection error
                        console.error('SSE error (raw):', event);
                        if (accumulatedContent) {
                            aiMessage.content = accumulatedContent;
                            aiMessage.mizziStatus = 'completed';
                        } else {
                            aiMessage.content = '**Streaming error.** Connection lost.';
                            aiMessage.mizziStatus = 'error';
                        }
                    }
                } else {
                    // Connection error (no data)
                    console.error('SSE connection error:', event);
                    if (accumulatedContent) {
                        aiMessage.content = accumulatedContent;
                        aiMessage.mizziStatus = 'completed';
                    } else {
                        aiMessage.content = '**Streaming error.** Connection lost. Check browser console for details.';
                        aiMessage.mizziStatus = 'error';
                    }
                }
                
                eventSource.close();
                resolve();
            });
            
            // Also handle onerror for connection-level errors
            eventSource.onerror = (event) => {
                console.error('SSE onerror:', event, 'readyState:', eventSource.readyState);
                eventSource.close();
                
                if (accumulatedContent) {
                    aiMessage.content = accumulatedContent;
                    aiMessage.mizziStatus = 'completed';
                } else {
                    aiMessage.content = '**Connection error.** Could not connect to streaming endpoint.';
                    aiMessage.mizziStatus = 'error';
                }
                resolve();
            };

        } catch (error) {
            console.error('Failed to create stream:', error);
            aiMessage.content = '**Streaming failed.** ' + error.message;
            aiMessage.mizziStatus = 'error';
            reject(error);
        }
    });
}

/**
 * Handle non-streaming response
 */
function handleNonStreamingResponse(response, aiMessage) {
    // Update AI message with response
    aiMessage.content = response.content || response.message || 'Response received.';
    aiMessage.missionId = response.mission_id || null;
    aiMessage.mizziStatus = response.mizzi_status || 'completed';
    aiMessage.filesGenerated = response.files_generated || 0;
}

/**
 * Scroll to bottom of messages
 */
function scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Escape for JavaScript
 */
function escapeForJs(text) {
    return text.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

/**
 * Copy to clipboard
 */
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Could add a toast notification here
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
};

/**
 * Get conversations for sidebar (exported for use in dashboard)
 */
export function getConversations() {
    const stored = localStorage.getItem('missionize_conversations');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return [];
        }
    }
    return [];
}

/**
 * Load specific conversation
 */
export function loadConversation(conversationId) {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
        currentConversation = conv;
        return true;
    }
    return false;
}
