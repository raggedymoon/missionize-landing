/**
 * Chat View - Main Chat Interface
 * Primary interface for interacting with Missionize AI
 */

import { postJson, getJson, getApiBaseUrl, createChatStream, runMission } from './api.js';

// State management
let currentConversation = null;
let conversations = [];
let attachedFiles = [];
let isStreaming = false;
let selectedModel = 'gpt-4o-mini';
let currentAppState = null;
let chatMode = 'fast'; // 'fast' or 'mission'
let currentBuildTraceData = null;

// Available models (will be populated from backend)
let MODELS = [
    // Fallback models if backend is unavailable
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
    { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic' }
];

// Demo scenarios for easy testing
const DEMO_SCENARIOS = [
    {
        id: '1',
        label: 'Missionize vs Competitors (LangChain, AutoGen, CrewAI, LangSmith)',
        prompt: 'Explain Missionize vs LangChain, AutoGen, CrewAI, LangSmith – focus on proof and auditability.'
    },
    {
        id: '2',
        label: 'Executive One-Pager for CISO',
        prompt: 'Generate an executive one-pager for a CISO evaluating Missionize for their AI governance.'
    },
    {
        id: '3',
        label: 'EU AI Act Article 19 Compliance',
        prompt: 'Design an EU AI Act Article 19 compliance implementation using Missionize evidence envelopes.'
    },
    {
        id: '4',
        label: 'Debug Hallucinating AI Workflow',
        prompt: 'Debug a failing AI workflow: agent keeps hallucinating. Propose a safer pattern with consensus validation.'
    },
    {
        id: '5',
        label: 'VC-Ready Talking Points (Patent Moat)',
        prompt: 'Create 5 VC-ready talking points emphasizing our patent moat ($1.5B-$2.5B portfolio) and trust graph.'
    },
    {
        id: '6',
        label: 'Technical Blog Post: Proof Beats Observability',
        prompt: 'Write a technical blog post about why "proof beats observability" for enterprise AI.'
    },
    {
        id: '7',
        label: 'Competitive Battlecard vs LangChain',
        prompt: 'Generate a competitive battlecard for sales team facing LangChain in a deal.'
    }
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

    // Load chat mode
    const storedMode = localStorage.getItem('missionize_chat_mode');
    if (storedMode === 'mission' || storedMode === 'fast') {
        chatMode = storedMode;
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
            <!-- Chat Header with Mode Toggle -->
            <div class="chat-header">
                <div class="mode-toggle-container">
                    <div class="mode-toggle">
                        <button class="mode-option ${chatMode === 'fast' ? 'active' : ''}" data-mode="fast">
                            ⚡ Fast
                        </button>
                        <button class="mode-option ${chatMode === 'mission' ? 'active' : ''}" data-mode="mission">
                            🔒 Mission Mode
                        </button>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--color-text-muted);">
                        ${chatMode === 'fast' ? 'Quick responses, no evidence' : 'Full consensus + cryptographic proof'}
                    </span>
                </div>
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
                <!-- Demo Scenarios -->
                <div class="demo-scenarios-container">
                    <label class="demo-scenarios-label">🎯 Demo Scenarios</label>
                    <select class="demo-scenarios-select" id="demo-scenarios-select">
                        <option value="">Choose a scenario...</option>
                        ${DEMO_SCENARIOS.map(scenario => `
                            <option value="${scenario.id}">${scenario.label}</option>
                        `).join('')}
                    </select>
                </div>

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

        <!-- Build Trace Side Panel -->
        <div class="build-trace-panel" id="build-trace-panel">
            <div class="build-trace-header">
                <h3 class="build-trace-title">🔍 Build Trace</h3>
                <button class="build-trace-close" id="build-trace-close">×</button>
            </div>
            <div class="build-trace-content" id="build-trace-content">
                <p style="color: var(--color-text-muted);">Select a Mission Mode message to view its build trace.</p>
            </div>
            <div class="build-trace-footer">
                <button class="btn-view-raw" id="btn-view-raw">View Raw Evidence JSON</button>
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
            ${!isUser && msg.evidenceData ? renderMiniPipeline(msg.evidenceData.agent_decisions) : ''}
            ${!isUser && msg.evidenceData ? renderEvidencePanel(msg) : ''}
            ${!isUser && msg.mizziStatus && !msg.evidenceData ? renderMizziStatus(msg) : ''}
            ${!isUser && msg.evidenceHash && !msg.evidenceData ? `
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

    // Mode toggle
    const modeOptions = container.querySelectorAll('.mode-option');
    modeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const newMode = option.dataset.mode;

            // Guard: Don't do anything if already in this mode
            if (chatMode === newMode) {
                return;
            }

            chatMode = newMode;
            localStorage.setItem('missionize_chat_mode', chatMode);

            // Update active state
            modeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // Update description text
            const descText = container.querySelector('.mode-toggle-container span');
            if (descText) {
                descText.textContent = chatMode === 'fast'
                    ? 'Quick responses, no evidence'
                    : 'Full consensus + cryptographic proof';
            }

            console.log(`[Chat] Switched to ${chatMode} mode`);
        });
    });

    // Demo scenarios dropdown
    const demoSelect = document.getElementById('demo-scenarios-select');
    if (demoSelect) {
        demoSelect.addEventListener('change', (e) => {
            const scenarioId = e.target.value;
            if (scenarioId) {
                const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
                if (scenario) {
                    chatInput.value = scenario.prompt;
                    chatInput.focus();
                }
                // Reset select
                e.target.value = '';
            }
        });
    }

    // Build trace panel close button
    const buildTraceClose = document.getElementById('build-trace-close');
    if (buildTraceClose) {
        buildTraceClose.addEventListener('click', () => {
            document.getElementById('build-trace-panel').classList.remove('open');
        });
    }

    // View raw evidence button
    const btnViewRaw = document.getElementById('btn-view-raw');
    if (btnViewRaw) {
        btnViewRaw.addEventListener('click', () => {
            if (currentBuildTraceData) {
                const jsonWindow = window.open('', '_blank');
                jsonWindow.document.write('<html><head><title>Evidence JSON</title></head><body>');
                jsonWindow.document.write('<pre>' + JSON.stringify(currentBuildTraceData, null, 2) + '</pre>');
                jsonWindow.document.write('</body></html>');
            } else {
                alert('No evidence data available');
            }
        });
    }
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
        content: chatMode === 'mission' ? '⏳ Running consensus pipeline...' : '⏳ Sending to Missionize backend...',
        timestamp: new Date().toISOString(),
        model: selectedModel,
        missionId: null,
        mizziStatus: null,
        evidenceData: null
    };

    currentConversation.messages.push(aiMessage);
    saveConversations();

    // Re-render to show loading message
    const container = document.querySelector('.content-container');
    await render(container, appState);

    // IMPORTANT: Get fresh reference to aiMessage after render() reloads from localStorage
    // The render() call above triggers initChat() which reloads currentConversation,
    // making the original aiMessage variable a stale reference
    const aiMessageRef = currentConversation.messages[currentConversation.messages.length - 1];

    try {
        // Build messages array from conversation history
        // Filter out placeholder messages (starting with ⏳) and empty content
        const messages = currentConversation.messages
            .filter(msg => (msg.role === 'user' || msg.role === 'assistant') && msg.content && !msg.content.startsWith('⏳'))
            .map(msg => ({
                role: msg.role,
                content: msg.content
            }));

        console.log(`[Chat] ${chatMode.toUpperCase()} MODE - Sending messages:`, messages.length);

        // ROUTING: Check chatMode and call appropriate backend
        if (chatMode === 'mission') {
            // ====== MISSION MODE: Full consensus pipeline ======
            console.log('[Chat] MISSION MODE: Calling /run-custom with task:', message);
            console.log('[Chat] MISSION MODE: Conversation history:', messages.length, 'messages');

            const startTime = Date.now();
            const response = await runMission(message, messages, appState);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log(`[Chat] MISSION MODE: Got response in ${elapsed}s:`, response);

            // Extract evidence data (use fresh reference aiMessageRef)
            aiMessageRef.evidenceData = {
                mission_id: response.mission_id,
                status: response.status,
                agent_decisions: response.agent_decisions || {},
                evidence_hash: response.evidence_hash,
                trust_score: response.trust_score,
                confidence_score: response.confidence_score,
                timestamp: response.timestamp,
                guardian_approved: response.guardian_approved
            };

            // Set message content - check if blocked and format accordingly
            if (response.guardian_approved === false || response.status === 'blocked') {
                aiMessageRef.content = formatBlockedResponse(response);
            } else {
                aiMessageRef.content = response.final_recommendation || response.message || 'Mission completed.';
            }
            aiMessageRef.missionId = response.mission_id;
            aiMessageRef.mizziStatus = response.guardian_approved ? 'passed' : 'failed';

            console.log('[Chat] MISSION MODE: Evidence data stored:', aiMessageRef.evidenceData);
            console.log('[Chat] MISSION MODE: Re-rendering to show evidence panel...');

            // Save and re-render to show the completed mission with evidence
            saveConversations();
            await render(container, appState);

        } else {
            // ====== FAST MODE: Direct LLM calls (existing logic) ======
            console.log('[Chat] FAST MODE: Calling /api/chat/send');

            const payload = {
                messages: messages,
                model_id: selectedModel,
                conversation_id: currentConversation.id
            };

            const response = await postJson('/api/chat/send', payload, appState);
            console.log('[Chat] FAST MODE: Got response:', response);

            // Check if streaming is available
            if (response.stream_url || response.message_id) {
                console.log('[Chat] FAST MODE: Starting SSE stream for message_id:', response.message_id);
                const messageId = response.message_id;
                await handleStreamingResponse(messageId, aiMessageRef, appState, container);
            } else {
                // Fallback to non-streaming response
                handleNonStreamingResponse(response, aiMessageRef);
            }
        }

        saveConversations();

    } catch (error) {
        // Handle error
        console.error(`[Chat] ${chatMode.toUpperCase()} MODE ERROR:`, error);

        let errorDetails = '';
        if (chatMode === 'mission') {
            errorDetails = '\n\n**Mission Mode Details:**\n• Consensus pipeline may take 30-60 seconds\n• Check Network tab for /run-custom request\n• Verify API key is set in localStorage';
        } else {
            errorDetails = '\n\n**Fast Mode Details:**\n• Check Network tab for /api/chat/send request\n• Verify SSE streaming is working';
        }

        aiMessageRef.content = `**Error:** ${error.message}\n\nPlease check:\n• Is the backend running?\n• Is the API URL correct? (${getApiBaseUrl(appState)})\n• Check browser console for full error details${errorDetails}`;
        aiMessageRef.mizziStatus = 'error';
        aiMessageRef.evidenceData = null;
        saveConversations();

        // Re-render to show error message
        await render(container, appState);
    }

    isStreaming = false;
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
 * Format a blocked response into user-friendly HTML
 * @param {Object} response - Backend response with guardian_approved=false
 * @returns {string} Formatted HTML for blocked message
 */
function formatBlockedResponse(response) {
    const confidence = response.confidence_score || 0;
    const trust = response.trust_score || 0;
    const decisions = response.agent_decisions || {};

    const issues = [];
    if (confidence < 0.70) {
        issues.push(`Confidence: ${(confidence * 100).toFixed(0)}% (needs 70%)`);
    }
    if (trust < 0.60) {
        issues.push(`Trust: ${(trust * 100).toFixed(0)}% (needs 60%)`);
    }
    if (decisions.arbiter?.risk_level === 'HIGH') {
        issues.push('Risk Level: HIGH');
    }
    if (decisions.challenger?.objections?.length > 0) {
        issues.push(`${decisions.challenger.objections.length} unresolved objections`);
    }
    if (issues.length === 0) {
        issues.push(response.blocked_reason || 'Quality thresholds not met');
    }

    return `<div class="message-blocked">
        <div class="blocked-header">🛑 Mission Blocked by Guardian</div>
        <div class="blocked-explanation">Your request didn't meet quality thresholds:</div>
        <ul class="blocked-issues-list">${issues.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
        <div class="blocked-explanation"><strong>Try:</strong> Add more context, break into smaller steps, or check the evidence panel below.</div>
    </div>`;
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
 * Render mini consensus pipeline
 */
function renderMiniPipeline(agentDecisions) {
    if (!agentDecisions) return '';

    const agents = [
        { key: 'proposer', letter: 'P', label: 'Proposer' },
        { key: 'challenger', letter: 'C', label: 'Challenger' },
        { key: 'arbiter', letter: 'A', label: 'Arbiter' },
        { key: 'devils_advocate', letter: 'D', label: 'Devil\'s Advocate' },
        { key: 'guardian_angel', letter: 'G', label: 'Guardian' }
    ];

    return `
        <div class="mini-pipeline">
            ${agents.map((agent, index) => {
                // Determine agent status
                let status = 'pending';
                if (agentDecisions[agent.key]) {
                    const decision = agentDecisions[agent.key];
                    if (decision.approved || decision.status === 'passed') {
                        status = 'passed';
                    } else if (decision.status === 'failed' || decision.approved === false) {
                        status = 'failed';
                    }
                }

                return `
                    <div class="pipeline-agent">
                        <div class="pipeline-icon ${status}">
                            ${agent.letter}
                        </div>
                        <div class="pipeline-label">${agent.label}</div>
                    </div>
                    ${index < agents.length - 1 ? '<div class="pipeline-arrow">→</div>' : ''}
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Render evidence panel
 */
function renderEvidencePanel(msg) {
    if (!msg.evidenceData) return '';

    const { mission_id, evidence_hash, timestamp, status, trust_score, guardian_approved } = msg.evidenceData;
    const consensus_status = guardian_approved ? 'passed' : (status === 'completed' ? 'passed' : 'failed');

    return `
        <div class="evidence-panel" id="evidence-${msg.timestamp}">
            <div class="evidence-header" onclick="window.toggleEvidence('${msg.timestamp}')">
                <div class="evidence-title">
                    🔒 Cryptographic Evidence
                    <span class="evidence-expand-icon">▼</span>
                </div>
            </div>
            <div class="evidence-content">
                <div class="evidence-row">
                    <span class="evidence-label">Mission ID</span>
                    <span class="evidence-value">${mission_id || 'N/A'}</span>
                </div>
                <div class="evidence-row">
                    <span class="evidence-label">Consensus Status</span>
                    <span class="evidence-value">
                        ${consensus_status === 'passed' ? '✅ Passed' :
                          consensus_status === 'failed' ? '❌ Failed' : '⚠️ Partial'}
                    </span>
                </div>
                <div class="evidence-row">
                    <span class="evidence-label">Trust Score</span>
                    <span class="evidence-value">${trust_score ? (trust_score * 100).toFixed(1) + '%' : 'N/A'}</span>
                </div>
                <div class="evidence-row">
                    <span class="evidence-label">Evidence Hash (SHA-256)</span>
                    <div class="evidence-hash-display">
                        <span class="evidence-hash-text">${evidence_hash ? evidence_hash.substring(0, 16) + '...' : 'N/A'}</span>
                        ${evidence_hash ? `<button class="btn-copy-hash" onclick="window.copyHashToClipboard('${evidence_hash}')">Copy</button>` : ''}
                    </div>
                </div>
                <div class="evidence-row">
                    <span class="evidence-label">Timestamp</span>
                    <span class="evidence-value">${timestamp || new Date().toISOString()}</span>
                </div>
                ${msg.evidenceData.agent_decisions ? `
                <div style="margin-top: 1rem;">
                    <button class="btn-show-trace" onclick="window.showBuildTrace(${escapeForJs(JSON.stringify(msg.evidenceData))})">
                        🔍 Show build trace
                    </button>
                </div>
                ` : ''}
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
                    <details>
                        <summary style="cursor: pointer; color: var(--color-primary); font-weight: 600; font-size: 0.875rem;">
                            Why you can trust this
                        </summary>
                        <div style="margin-top: 0.75rem; font-size: 0.85rem; line-height: 1.6; color: var(--color-text-muted);">
                            <ul style="margin: 0.5rem 0 0 1.25rem; padding: 0;">
                                <li>Every agent decision is recorded and hashed</li>
                                <li>SHA-256 + HMAC-SHA256 cryptographic sealing</li>
                                <li>Evidence envelopes are immutable and timestamped</li>
                                <li>Full audit trail for compliance (EU AI Act, SOC 2, HIPAA)</li>
                                <li>Deterministic replay allows exact verification</li>
                            </ul>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    `;
}

/**
 * Toggle evidence panel expansion
 */
window.toggleEvidence = function(timestamp) {
    const panel = document.getElementById(`evidence-${timestamp}`);
    if (panel) {
        panel.classList.toggle('expanded');
    }
};

/**
 * Copy evidence hash to clipboard
 */
window.copyHashToClipboard = function(hash) {
    navigator.clipboard.writeText(hash).then(() => {
        alert('Evidence hash copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy hash:', err);
    });
};

/**
 * Show build trace panel
 */
window.showBuildTrace = function(evidenceData) {
    currentBuildTraceData = evidenceData;
    populateBuildTrace(evidenceData.agent_decisions);
    document.getElementById('build-trace-panel').classList.add('open');
};

/**
 * Populate build trace panel with agent data
 */
function populateBuildTrace(agentDecisions) {
    if (!agentDecisions) {
        document.getElementById('build-trace-content').innerHTML = '<p style="color: var(--color-text-muted);">No agent data available.</p>';
        return;
    }

    const agents = [
        { key: 'proposer', name: 'Proposer', icon: 'P' },
        { key: 'challenger', name: 'Challenger', icon: 'C' },
        { key: 'arbiter', name: 'Arbiter', icon: 'A' },
        { key: 'devils_advocate', name: 'Devil\'s Advocate', icon: 'D' },
        { key: 'guardian_angel', name: 'Guardian Angel', icon: 'G' }
    ];

    let html = '';

    agents.forEach(agent => {
        const decision = agentDecisions[agent.key];
        if (!decision) return;

        html += `
            <div class="trace-agent-section">
                <div class="trace-agent-header">
                    <div class="trace-agent-icon">${agent.icon}</div>
                    <div class="trace-agent-name">${agent.name}</div>
                    <div class="trace-agent-time">${decision.timestamp || 'N/A'}</div>
                </div>
                <div class="trace-agent-output">
                    ${formatAgentOutput(decision)}
                </div>
            </div>
        `;
    });

    document.getElementById('build-trace-content').innerHTML = html || '<p>No agent data available.</p>';
}

/**
 * Format agent output for display
 */
function formatAgentOutput(decision) {
    if (typeof decision === 'string') {
        return `<p>${escapeHtml(decision)}</p>`;
    }

    let output = [];

    if (decision.reasoning) {
        output.push(`<p><strong>Reasoning:</strong> ${escapeHtml(decision.reasoning)}</p>`);
    }

    if (decision.decision) {
        output.push(`<p><strong>Decision:</strong> ${escapeHtml(decision.decision)}</p>`);
    }

    if (decision.objections && Array.isArray(decision.objections)) {
        output.push(`<p><strong>Objections:</strong></p><ul>${decision.objections.map(obj => `<li>${escapeHtml(obj)}</li>`).join('')}</ul>`);
    }

    if (decision.edge_cases && Array.isArray(decision.edge_cases)) {
        output.push(`<p><strong>Edge Cases:</strong></p><ul>${decision.edge_cases.map(ec => `<li>${escapeHtml(ec)}</li>`).join('')}</ul>`);
    }

    if (decision.approved !== undefined) {
        output.push(`<p><strong>Approved:</strong> ${decision.approved ? '✅ Yes' : '❌ No'}</p>`);
    }

    if (decision.confidence !== undefined) {
        output.push(`<p><strong>Confidence:</strong> ${(decision.confidence * 100).toFixed(1)}%</p>`);
    }

    return output.join('') || '<p>No details available.</p>';
}

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
