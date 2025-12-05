# Dashboard UX Master Plan - December 5, 2025
## Full AI OS Competitor Analysis vs ChatGPT & Claude

**Status:** 🔴 RED - NOT LAUNCH READY
**Assessment Date:** December 5, 2025
**HN Launch:** December 15, 2025 (10 days away)
**Critical Finding:** Dashboard is a monitoring tool, NOT a ChatGPT/Claude competitor

---

## Executive Summary

### Current State Assessment
The Missionize dashboard at `dashboard.html` is a **monitoring-only interface** that displays mission status, history, evidence, and patterns. It has NO way for users to actually CHAT with AI or RUN MISSIONS from the primary interface.

**The only way to use the product is via the hidden `console.html` page.**

### Biggest Gaps
1. **No chat interface in main dashboard** - Can't send messages or run missions
2. **No real-time interaction** - Everything is read-only status monitoring
3. **No file upload** - Can't attach context
4. **No model selection** - Can't choose GPT-4 vs Claude vs Gemini
5. **Console is hidden** - Actual product entry point is buried

### Competitive Position
| Competitor | Feature Parity | Notes |
|------------|---------------|-------|
| **ChatGPT** | **15%** | Missing: Chat input, file upload, conversation history, streaming, image generation, voice, share links |
| **Claude** | **12%** | Missing: Projects, artifacts panel, file context, conversation tabs, streaming, long context indicator |

### Launch Readiness: 🔴 RED

**Current dashboard cannot compete with ChatGPT/Claude as a primary AI interface.**

---

## Detailed Gap Analysis

### A. BASIC USER EXPERIENCE (Compete with ChatGPT/Claude)

| Capability | Status | Location | Priority |
|------------|--------|----------|----------|
| **Chat input box (always visible)** | ❌ MISSING | None | **P0** |
| **Send message / run mission** | ⚠️ console.html only | Hidden page | **P0** |
| **See AI response streaming** | ❌ MISSING | None | **P0** |
| **Conversation history sidebar** | ⚠️ Partial | History view (table only) | **P0** |
| **File upload (drag-drop)** | ❌ MISSING | None | **P0** |
| **File upload (button)** | ❌ MISSING | None | **P0** |
| **Code blocks with copy button** | ❌ MISSING | None | **P0** |
| **Markdown rendering** | ❌ MISSING | None | P1 |
| **Image display inline** | ❌ MISSING | None | P1 |
| **Voice input** | ❌ MISSING | None | P2 |
| **Share conversation links** | ❌ MISSING | None | P2 |
| **New chat button** | ❌ MISSING | None | **P0** |
| **Model display (which AI responding)** | ❌ MISSING | None | **P0** |

**Verdict:** Dashboard has 0% of basic ChatGPT/Claude features for primary interaction.

---

### B. POWER USER FEATURES (Our Differentiator)

| Capability | Status | Location | Priority |
|------------|--------|----------|----------|
| **Multi-terminal view (Claude Code)** | ❌ MISSING | None | **P0** |
| **Terminal output streaming** | ❌ MISSING | None | **P0** |
| **Switch between terminals** | ❌ MISSING | None | **P0** |
| **Model selector dropdown** | ❌ MISSING | None | **P0** |
| **See which model is responding** | ❌ MISSING | None | **P0** |
| **Consensus mode toggle** | ❌ MISSING | None | P1 |
| **Evidence chain viewer** | ✅ EXISTS | Evidence view | P1 |
| **Debug/raw log view** | ⚠️ Partial | Mission details | P1 |
| **Mission pipeline status** | ✅ EXISTS | Pipeline view | P1 |
| **Pattern library** | ✅ EXISTS | Patterns view | P1 |
| **Mizzi QA monitoring** | ✅ EXISTS | Mizzi view | P1 |

**Verdict:** Monitoring features exist (Evidence, Pipeline, Mizzi), but NO power user execution features.

---

### C. CONFIGURATION & CONNECTORS

| Capability | Status | Location | Priority |
|------------|--------|----------|----------|
| **Add OpenAI API key** | ❌ MISSING | None | **P0** |
| **Add Anthropic API key** | ❌ MISSING | None | **P0** |
| **Add Google AI API key** | ❌ MISSING | None | P1 |
| **Add local model config** | ❌ MISSING | None | P1 |
| **API base URL config** | ✅ EXISTS | Settings view | P1 |
| **Connect GitHub** | ❌ MISSING | None | P1 |
| **Connect Slack** | ❌ MISSING | None | P2 |
| **Connect Google Drive** | ❌ MISSING | None | P2 |
| **MCP server configuration** | ❌ MISSING | None | P1 |

**Verdict:** Basic API URL setting exists, but no model-specific API keys or integrations.

---

### D. ACCOUNT & BILLING

| Capability | Status | Location | Priority |
|------------|--------|----------|----------|
| **View subscription tier** | ❌ MISSING | None | P1 |
| **Usage dashboard (tokens)** | ❌ MISSING | None | P1 |
| **Usage dashboard (missions)** | ⚠️ Partial | History count | P1 |
| **Get user API key** | ❌ MISSING | None | P1 |
| **Upgrade/downgrade plan** | ❌ MISSING | None | P1 |
| **Billing history** | ❌ MISSING | None | P2 |
| **Team management** | ❌ MISSING | None | P2 |

**Verdict:** No account management or billing features.

---

## Critical Problem: User Flow Breakdown

### Current User Journey (BROKEN)
1. User visits `missionize.ai` → Lands on marketing page
2. User clicks "Dashboard" → Opens `dashboard.html`
3. **Dashboard defaults to "Pipeline" view** → Shows EMPTY pipeline (no missions yet!)
4. User confused: "How do I create a mission?"
5. User must discover hidden "Console" button at bottom of sidebar
6. Console button → Navigates to `console.html` (SEPARATE PAGE)
7. User finally can submit a mission in console
8. User must navigate BACK to dashboard to see pipeline status

### ChatGPT User Journey (GOLD STANDARD)
1. User visits `chat.openai.com`
2. **Chat input is immediately visible** with example prompts
3. User types message, hits Enter
4. AI response streams in real-time
5. Conversation history sidebar auto-updates

### Claude User Journey (GOLD STANDARD)
1. User visits `claude.ai`
2. **Chat input is immediately visible** with suggested prompts
3. User types message, attaches files, hits Enter
4. AI response streams in Artifacts panel
5. Conversation tabs show all chats

---

## Competitive Feature Comparison

### What ChatGPT Has That We Don't

| ChatGPT Feature | Missionize Equivalent | Gap Analysis |
|-----------------|----------------------|--------------|
| Chat input box (always visible) | console.html (hidden) | **CRITICAL GAP** |
| Conversation sidebar | History table | Not real-time, no threads |
| File upload (drag-drop) | None | **CRITICAL GAP** |
| Code blocks with copy | None | **CRITICAL GAP** |
| Image generation inline | None | Missing |
| Voice input | None | Missing |
| Multiple GPTs | Patterns view | Read-only, can't execute |
| Share conversation | None | Missing |
| Streaming responses | None | **CRITICAL GAP** |
| Mobile app | None | Roadmap Q2 2026 |

### What Claude Has That We Don't

| Claude Feature | Missionize Equivalent | Gap Analysis |
|----------------|----------------------|--------------|
| Chat input (always visible) | console.html (hidden) | **CRITICAL GAP** |
| Projects with file context | None | Missing |
| Artifacts side panel | None | **CRITICAL GAP** |
| Multiple conversation tabs | None | Missing |
| File upload with preview | None | **CRITICAL GAP** |
| Long context indicator | None | Missing |
| Claude Code terminal | None | Roadmap Q2 2026 (multi-worker) |
| Streaming responses | None | **CRITICAL GAP** |

### What We Have That They Don't (Differentiators)

| Missionize Feature | ChatGPT | Claude | Our Advantage |
|--------------------|---------|--------|---------------|
| **Multi-model routing (DMCR)** | ❌ | ❌ | 🎯 CORE DIFFERENTIATOR |
| **Evidence Chain (cryptographic)** | ❌ | ❌ | 🎯 CORE DIFFERENTIATOR |
| **5-Agent Consensus** | ❌ | ❌ | 🎯 CORE DIFFERENTIATOR |
| **Pre-Execution Validator (PEV)** | ❌ | ❌ | 🎯 CORE DIFFERENTIATOR |
| **Lessons Engine (self-learning)** | ❌ | ❌ | 🎯 CORE DIFFERENTIATOR |
| **Local model fallback** | ❌ | ❌ | 🎯 CORE DIFFERENTIATOR |
| **Mission Pipeline (batch)** | ❌ | ❌ | 🎯 CORE DIFFERENTIATOR |
| **Pattern Registry** | ⚠️ GPTs | ❌ | Competitive advantage |

**THE PROBLEM:** Our differentiators are hidden behind a bad UX that doesn't let users access them easily!

---

## P0 - LAUNCH BLOCKERS (Must Fix Before Dec 15)

These gaps make the dashboard UNUSABLE as a ChatGPT/Claude competitor:

### 1. Chat Input Component ⏱️ 6-8 hours
**Problem:** No way to send messages from main dashboard
**Solution:** Create always-visible chat input at bottom of screen

**Implementation:**
- New file: `js/dashboard/chat.js`
- Add chat input textarea with send button
- Add file attachment button
- Add model selector dropdown
- Wire to backend: `POST /api/chat/send`

**UI Location:** Bottom of main content area (like ChatGPT)

**Files to modify:**
- `dashboard.html` - Add chat input container
- `css/dashboard.css` - Add chat input styles
- `js/dashboard.js` - Register chat as default view
- `js/dashboard/chat.js` - NEW FILE

**Acceptance Criteria:**
- [ ] Chat input visible on page load
- [ ] Can type message and hit Enter to send
- [ ] Can attach files (button + drag-drop)
- [ ] Can select model (GPT-4, Claude, Gemini)
- [ ] Sends to backend API
- [ ] Shows loading indicator while processing

---

### 2. Streaming Chat Response Display ⏱️ 6-8 hours
**Problem:** No way to see AI responses in real-time
**Solution:** Create chat message display with SSE streaming

**Implementation:**
- Display user messages + AI responses in conversation thread
- Use Server-Sent Events (SSE) for streaming: `GET /api/chat/stream`
- Render markdown with syntax highlighting
- Add copy button to code blocks
- Auto-scroll to latest message

**UI Location:** Main content area (conversation thread)

**Files to modify:**
- `js/dashboard/chat.js` - Add message rendering
- `css/dashboard.css` - Add message bubble styles

**Acceptance Criteria:**
- [ ] User messages display instantly
- [ ] AI responses stream word-by-word
- [ ] Markdown renders correctly
- [ ] Code blocks have syntax highlighting
- [ ] Code blocks have copy button
- [ ] Auto-scrolls to latest message

---

### 3. File Upload Component ⏱️ 4-5 hours
**Problem:** No way to attach files to missions
**Solution:** Drag-drop zone + file picker button

**Implementation:**
- Drag-drop zone (like Claude)
- File picker button
- File preview with remove button
- Upload to backend: `POST /api/upload`
- Support: PDF, TXT, CSV, PNG, JPG, MD, JSON, etc.

**UI Location:** Above chat input (collapsible file area)

**Files to modify:**
- `js/dashboard/upload.js` - NEW FILE
- `js/dashboard/chat.js` - Import and use upload component
- `css/dashboard.css` - Add file preview styles

**Acceptance Criteria:**
- [ ] Can drag-drop files onto input area
- [ ] Can click button to select files
- [ ] File preview shows name, size, type
- [ ] Can remove file before sending
- [ ] Uploads to backend successfully
- [ ] Shows upload progress

---

### 4. Model Selector Dropdown ⏱️ 3-4 hours
**Problem:** No way to choose which AI model to use
**Solution:** Dropdown above chat input showing available models

**Implementation:**
- Dropdown showing: GPT-4o, GPT-4, Claude Sonnet, Claude Opus, Gemini Pro, Local LLM
- Fetch available models from: `GET /api/models`
- Show model capabilities (speed, cost, quality indicators)
- Persist selection in localStorage
- Show which model is responding

**UI Location:** Top-right of chat input area

**Files to modify:**
- `js/dashboard/model-selector.js` - NEW FILE
- `js/dashboard/chat.js` - Import and use selector
- `css/dashboard.css` - Add dropdown styles

**Acceptance Criteria:**
- [ ] Dropdown shows all available models
- [ ] Can select model before sending
- [ ] Selection persists across page loads
- [ ] Shows which model is responding
- [ ] Shows model capabilities (speed/quality badges)

---

### 5. Conversation History Sidebar ⏱️ 4-5 hours
**Problem:** No way to see past chat threads
**Solution:** Left sidebar with conversation list (like ChatGPT)

**Implementation:**
- Sidebar showing recent conversations grouped by date (Today, Yesterday, Last 7 Days)
- Click conversation → Load that chat thread
- "New Chat" button at top
- Fetch conversations: `GET /api/conversations`
- Delete conversation button (trash icon)
- Search conversations

**UI Location:** Extend existing sidebar (add section above nav tabs)

**Files to modify:**
- `dashboard.html` - Add conversation list section to sidebar
- `js/dashboard/conversations.js` - NEW FILE
- `js/dashboard/chat.js` - Wire conversation loading
- `css/dashboard.css` - Add conversation list styles

**Acceptance Criteria:**
- [ ] Shows recent conversations with timestamps
- [ ] Grouped by date (Today, Yesterday, etc.)
- [ ] Click conversation → Loads messages
- [ ] "New Chat" button creates fresh conversation
- [ ] Can delete conversations
- [ ] Can search conversations by content

---

### 6. API Key Configuration ⏱️ 3-4 hours
**Problem:** No way to add OpenAI/Anthropic API keys
**Solution:** Extend Settings page with API key inputs

**Implementation:**
- Add secure input fields for API keys:
  - OpenAI API Key
  - Anthropic API Key
  - Google AI API Key
  - Local LM Studio URL
- Save to backend: `POST /api/keys/save`
- Validate keys on save
- Show key status (valid/invalid/not set)

**UI Location:** Settings view → New "API Keys" section

**Files to modify:**
- `js/dashboard/settings.js` - Add API keys section
- `css/dashboard.css` - Add secure input styles

**Acceptance Criteria:**
- [ ] Can enter API keys securely (password input)
- [ ] Keys are validated on save
- [ ] Shows key status (valid/invalid/not set)
- [ ] Keys stored securely (backend handles encryption)
- [ ] Can test key validity with "Test Connection" button

---

## P0 Architecture Changes

### 1. Make Chat the DEFAULT View
**Current:** Dashboard defaults to "Pipeline" (empty, confusing)
**Required:** Dashboard defaults to "Chat" (immediately useful)

**Changes:**
```javascript
// js/dashboard.js
// OLD:
switchView('pipeline');

// NEW:
switchView('chat');
```

**Impact:** Users land on usable chat interface instead of empty monitoring view.

---

### 2. Reorganize Sidebar Navigation
**Current Order:** Pipeline, History, Evidence, Patterns, Mizzi, Settings, Console
**New Order:** Chat, Pipeline, History, Evidence, Settings, [Divider], Mizzi, Patterns

**Rationale:**
- Chat = primary interface
- Pipeline/History = monitoring (secondary)
- Mizzi/Patterns = advanced features (tertiary)

---

### 3. API Endpoints Required

| Endpoint | Method | Purpose | Exists? |
|----------|--------|---------|---------|
| `/api/chat/send` | POST | Send message, get response | ❓ Unknown |
| `/api/chat/stream` | GET (SSE) | Stream AI response | ❓ Unknown |
| `/api/conversations` | GET | List user conversations | ❌ No |
| `/api/conversations/:id` | GET | Load conversation thread | ❌ No |
| `/api/conversations` | POST | Create new conversation | ❌ No |
| `/api/conversations/:id` | DELETE | Delete conversation | ❌ No |
| `/api/upload` | POST | Upload file for context | ❓ Unknown |
| `/api/models` | GET | List available models | ❌ No |
| `/api/keys/save` | POST | Save API keys | ❌ No |
| `/api/keys/validate` | POST | Test API key validity | ❌ No |

**Action Required:** Audit backend API to determine which endpoints exist.

---

## P1 - WEEK 1 AFTER LAUNCH (Dec 16-22)

### 1. Multi-Terminal Grid View ⏱️ 8-10 hours
**What:** 2x2 or 1x4 grid showing multiple Claude Code terminal sessions
**Why:** Our key differentiator over ChatGPT/Claude
**How:** New `terminals.js` view with terminal grid layout

**Files:**
- `js/dashboard/terminals.js` - NEW FILE
- `js/dashboard/terminal-session.js` - NEW FILE (terminal component)

---

### 2. Terminal Session Management ⏱️ 6-8 hours
**What:** Create, rename, close, maximize terminals
**Why:** Power users need multiple parallel work sessions
**How:** Terminal control bar with actions

---

### 3. Consensus Mode Toggle ⏱️ 4-5 hours
**What:** Toggle to enable 5-agent consensus validation
**Why:** Our security differentiator
**How:** Toggle switch in chat input area (Enterprise mode)

**UI:** "Consensus Mode: OFF" → Click → "Consensus Mode: ON (5 agents)"

---

### 4. Evidence Chain Integration ⏱️ 5-6 hours
**What:** Show evidence hash in each chat message
**Why:** Prove cryptographic audit trail
**How:** Small "View Evidence" link under each AI response

**Click → Modal showing:**
- Message hash
- Timestamp
- Model used
- Consensus votes (if applicable)
- Full evidence JSON

---

## P2 - MONTH 1 (Dec 23 - Jan 23)

### 1. Voice Input ⏱️ 8-10 hours
**What:** Voice-to-text input via Web Speech API or Whisper
**Why:** Competitive parity with ChatGPT
**How:** Microphone button in chat input

---

### 2. GitHub/Slack Connectors ⏱️ 10-12 hours
**What:** OAuth integrations for GitHub and Slack
**Why:** Enterprise use cases (sync repos, post to Slack)
**How:** New "Connectors" view

---

### 3. Share Conversation Links ⏱️ 6-8 hours
**What:** Generate shareable link to conversation
**Why:** Collaboration (like ChatGPT share links)
**How:** "Share" button → Generates public link

---

### 4. Usage Dashboard ⏱️ 6-8 hours
**What:** Token usage, mission count, cost tracking
**Why:** Users want to see consumption
**How:** New "Usage" section in Settings

---

## Design Wireframes

### MAIN CHAT VIEW (Default Landing Page)

```
+------------------------------------------------------------------------------+
|  MISSIONIZE                                            [Prod] [Standard] [●] |
+----------+-----------------------------------------------------------+-------+
| SIDEBAR  |                    MAIN CHAT AREA                        |       |
+----------+-----------------------------------------------------------+-------+
|          |  ┌─────────────────────────────────────┐                 |       |
| [New +]  |  | Model: Claude Sonnet 3.5 ▾  [Consensus OFF]           |       |
|          |  └─────────────────────────────────────┘                 |       |
| Today    |                                                           |       |
|  > Chat1 |  ┌──────────────────────────────────────────────────────┐|       |
|  > Chat2 |  | 👤 User                                    10:45 AM  ||       |
|          |  | Analyze this CSV file and find trends                ||       |
| Yester.  |  | 📎 data.csv (2.3 MB)                                 ||       |
|  > Chat3 |  └──────────────────────────────────────────────────────┘|       |
|          |                                                           |       |
| ========|  ┌──────────────────────────────────────────────────────┐|       |
| Pipeline |  | 🤖 Missionize (Claude Sonnet 3.5)      10:45 AM    ||       |
| History  |  | I'll analyze the CSV file for trends. Let me        ||       |
| Evidence |  | process the data...                                  ||       |
| Settings |  |                                                       ||       |
|          |  | ```python                                  [Copy]    ||       |
| ========|  | import pandas as pd                                  ||       |
| Mizzi    |  | df = pd.read_csv('data.csv')                        ||       |
| Patterns |  | ```                                                  ||       |
|          |  |                                                       ||       |
|          |  | Key trends found:                                    ||       |
|          |  | • Revenue increased 23% YoY                         ||       |
|          |  | • Customer churn decreased 8%                       ||       |
|          |  |                                                       ||       |
|          |  | [View Evidence 🔒]                                   ||       |
|          |  └──────────────────────────────────────────────────────┘|       |
|          |                                                           |       |
|          |  ┌──────────────────────────────────────────────────────┐|       |
|          |  | 📎 Attach files (or drag here)                       ||       |
|          |  |                                                       ||       |
|          |  | Type your message... (Markdown supported)            ||       |
|          |  |                                                       ||       |
|          |  |                                         [📎] [🎤] [➤]||       |
|          |  └──────────────────────────────────────────────────────┘|       |
+----------+-----------------------------------------------------------+-------+
```

### Key Elements:
1. **Conversation Sidebar** (left) - Like ChatGPT
2. **Model Selector** (top) - Choose GPT-4, Claude, etc.
3. **Consensus Toggle** (top-right) - Enable 5-agent validation
4. **Message Thread** (center) - User + AI messages
5. **Evidence Links** (under AI messages) - Cryptographic proof
6. **Chat Input** (bottom) - Always visible, file attach, send
7. **Status Indicators** (top-right) - Environment, mode, API status

---

### MULTI-TERMINAL VIEW (Power Users)

```
+------------------------------------------------------------------------------+
|  MISSIONIZE                                   [Terminals] [Prod] [●]         |
+----------+-----------------------------------------------------------+-------+
| SIDEBAR  |              TERMINAL GRID (4 Claude Code Instances)     |       |
+----------+-----------------------------------------------------------+-------+
|          |  ┌────────────────────────┐ ┌────────────────────────┐  |       |
| [Chat]   |  | Terminal A             | | Terminal B             |  |       |
| [Terminals]| Patent Filing [×] [□] | | Dashboard Build [×] [□]|  |       |
|          |  |                        | |                        |  |       |
| Active:  |  | $ python patent_gen.py | | $ npm run dev          |  |       |
|  A: Patent| | Running USPTO filing... | | Server started on 8080 |  |       |
|  B: Dash |  | [output streaming...]  | | [output streaming...]  |  |       |
|  C: (off)|  |                        | |                        |  |       |
|  D: (off)|  | [Terminal output]      | | [Terminal output]      |  |       |
|          |  |                        | |                        |  |       |
| [+] New  |  └────────────────────────┘ └────────────────────────┘  |       |
|          |  ┌────────────────────────┐ ┌────────────────────────┐  |       |
| Pipeline |  | Terminal C             | | Terminal D             |  |       |
| History  |  | [Click to start]       | | [Click to start]       |  |       |
| Settings |  |                        | |                        |  |       |
|          |  |                        | |                        |  |       |
|          |  |                        | |                        |  |       |
|          |  |                        | |                        |  |       |
|          |  └────────────────────────┘ └────────────────────────┘  |       |
|          |                                                           |       |
|          |  ┌──────────────────────────────────────────────────────┐|       |
|          |  | Send to: [All] [A] [B] [C] [D]                       ||       |
|          |  | Execute command... (sent to selected terminals)      ||       |
|          |  |                                                 [Execute]     |
|          |  └──────────────────────────────────────────────────────┘|       |
+----------+-----------------------------------------------------------+-------+
```

### Key Elements:
1. **Terminal Grid** - 2x2 or 1x4 layout
2. **Terminal Controls** - Close, maximize, minimize
3. **Terminal Sidebar** - Active sessions list
4. **Broadcast Input** - Send command to all terminals
5. **New Terminal Button** - Spawn new Claude Code instance

---

### CONNECTORS PAGE (API Keys & Integrations)

```
+------------------------------------------------------------------------------+
|  MISSIONIZE                                            Settings > Connectors |
+----------+-----------------------------------------------------------+-------+
| SIDEBAR  |                    CONNECTORS & INTEGRATIONS              |       |
+----------+-----------------------------------------------------------+-------+
|          |  AI Models                                                |       |
| Chat     |  ┌─────────────────┐ ┌─────────────────┐                  |       |
| Pipeline |  | OpenAI          | | Anthropic       |                  |       |
| History  |  | GPT-4o, GPT-4   | | Claude 3.5      |                  |       |
| Evidence |  | [API Key: Set ✓]| | [API Key: Set ✓]|                  |       |
| Settings |  | [Configure]     | | [Configure]     |                  |       |
| > API    |  └─────────────────┘ └─────────────────┘                  |       |
| > Usage  |                                                           |       |
| > Billing|  ┌─────────────────┐ ┌─────────────────┐                  |       |
|          |  | Google AI       | | Local LLM       |                  |       |
| Mizzi    |  | Gemini 2.0      | | LM Studio       |                  |       |
| Patterns |  | [API Key: None] | | [URL: Not set]  |                  |       |
|          |  | [Connect]       | | [Configure]     |                  |       |
|          |  └─────────────────┘ └─────────────────┘                  |       |
|          |                                                           |       |
|          |  Developer Tools                                          |       |
|          |  ┌─────────────────┐ ┌─────────────────┐                  |       |
|          |  | GitHub          | | Slack           |                  |       |
|          |  | [Connect OAuth] | | [Connect OAuth] |                  |       |
|          |  └─────────────────┘ └─────────────────┘                  |       |
|          |                                                           |       |
|          |  MCP Servers                                              |       |
|          |  ┌──────────────────────────────────────────────────────┐|       |
|          |  | [+ Add MCP Server]                                   ||       |
|          |  |                                                       ||       |
|          |  | No MCP servers configured yet.                       ||       |
|          |  └──────────────────────────────────────────────────────┘|       |
+----------+-----------------------------------------------------------+-------+
```

### Key Elements:
1. **AI Model Cards** - OpenAI, Anthropic, Google, Local
2. **API Key Status** - Visual indicator (Set ✓ / None)
3. **OAuth Connectors** - GitHub, Slack
4. **MCP Server Config** - Add custom MCP servers

---

## Effort Estimates

### P0 - Launch Blockers (Must Complete Before Dec 15)

| Task | Effort | Dependencies | Blocker? |
|------|--------|--------------|----------|
| 1. Chat Input Component | 6-8h | Backend API | ✅ YES |
| 2. Streaming Response Display | 6-8h | SSE endpoint | ✅ YES |
| 3. File Upload Component | 4-5h | Upload API | ✅ YES |
| 4. Model Selector Dropdown | 3-4h | Models API | ✅ YES |
| 5. Conversation History Sidebar | 4-5h | Conversations API | ✅ YES |
| 6. API Key Configuration | 3-4h | Keys API | ✅ YES |
| **P0 Total** | **26-34 hours** | **3-4 days** | **YES** |

### P1 - Week 1 After Launch (Dec 16-22)

| Task | Effort | Dependencies |
|------|--------|--------------|
| 1. Multi-Terminal Grid View | 8-10h | Terminal API |
| 2. Terminal Session Management | 6-8h | Session API |
| 3. Consensus Mode Toggle | 4-5h | Consensus API |
| 4. Evidence Chain Integration | 5-6h | Evidence API |
| **P1 Total** | **23-29 hours** | **3-4 days** |

### P2 - Month 1 (Dec 23 - Jan 23)

| Task | Effort | Dependencies |
|------|--------|--------------|
| 1. Voice Input | 8-10h | Web Speech API / Whisper |
| 2. GitHub/Slack Connectors | 10-12h | OAuth setup |
| 3. Share Conversation Links | 6-8h | Public share API |
| 4. Usage Dashboard | 6-8h | Usage tracking API |
| **P2 Total** | **30-38 hours** | **4-5 days** |

---

## Files to Create/Modify

### New Files Required

| File | Purpose | Lines (Est.) |
|------|---------|--------------|
| `js/dashboard/chat.js` | Main chat interface | 300-400 |
| `js/dashboard/upload.js` | File upload component | 150-200 |
| `js/dashboard/model-selector.js` | Model dropdown | 100-150 |
| `js/dashboard/conversations.js` | Conversation history | 200-250 |
| `js/dashboard/terminals.js` | Multi-terminal view | 250-300 |
| `js/dashboard/terminal-session.js` | Single terminal component | 150-200 |
| `js/dashboard/connectors.js` | API keys & integrations | 200-250 |
| **Total New Files** | **7 files** | **~1,500 lines** |

### Files to Modify

| File | Changes | Impact |
|------|---------|--------|
| `dashboard.html` | Add chat input, conversation sidebar | +50 lines |
| `css/dashboard.css` | Chat styles, message bubbles, file upload | +200 lines |
| `js/dashboard.js` | Change default view to 'chat', register new views | +30 lines |
| `js/dashboard/settings.js` | Add API keys section | +100 lines |
| **Total Modifications** | **4 files** | **~380 lines** |

---

## Critical Recommendations

### Recommendation 1: PIVOT DASHBOARD FOCUS
**Current:** Dashboard = monitoring tool
**Required:** Dashboard = ChatGPT competitor with monitoring features

**Action:** Make Chat the default view, hide Pipeline/Evidence/Mizzi in secondary nav.

---

### Recommendation 2: DELAY HN LAUNCH
**Current:** December 15 (10 days away)
**Problem:** 26-34 hours of P0 work remaining
**Risk:** Launching with non-competitive UX damages brand

**Options:**
1. **Delay to December 22** (+7 days) - Allows P0 completion
2. **Delay to December 29** (+14 days) - Allows P0 + P1 completion
3. **Launch with console.html only** - Market as "developer tool" not "ChatGPT competitor"

---

### Recommendation 3: UNIFY CONSOLE + DASHBOARD
**Current:** console.html is separate page
**Problem:** Splits user experience, confusing navigation

**Action:** Merge console.html into dashboard.html as the Chat view.

**Migration:**
1. Copy console.html input/output logic → `js/dashboard/chat.js`
2. Deprecate console.html page
3. Redirect console.html → dashboard.html#chat

---

### Recommendation 4: BACKEND API AUDIT
**Problem:** Unknown which endpoints exist
**Action:** Audit backend to determine:
- ✅ Which P0 endpoints are already built
- ❌ Which P0 endpoints must be built
- ⏱️ Backend effort required

**Critical:** Frontend work blocked without backend API clarity.

---

## Launch Strategy Options

### Option A: Launch As-Is (NOT RECOMMENDED)
**Date:** December 15
**Positioning:** Developer monitoring tool
**Risk:** Users expect ChatGPT competitor, get confused monitoring dashboard
**HN Reception:** Likely negative ("where's the chat interface?")

---

### Option B: Pivot to Console-Only Launch (RECOMMENDED)
**Date:** December 15
**Positioning:** "AI OS for developers - beta console"
**Focus:** Promote console.html as primary interface
**Add:** Prominent "Launch Console" button on landing page
**Risk:** Lower, manages expectations
**HN Reception:** Positive if console experience is strong

---

### Option C: Delay & Build Chat Interface (IDEAL)
**Date:** December 22-29
**Positioning:** "AI OS with ChatGPT-like interface + power features"
**Work:** Complete P0 tasks (26-34 hours)
**Risk:** Delay impacts momentum
**HN Reception:** Positive, competitive UX

---

## Success Metrics

### Pre-Launch (Dec 15 if unchanged)
- [ ] **P0 Task Completion:** 0/6 complete ❌
- [ ] **Competitive Parity:** 15% vs ChatGPT ❌
- [ ] **Usability:** Dashboard is read-only ❌
- [ ] **User Flow:** Requires discovering hidden console ❌

### Post-P0 (After 26-34 hours)
- [ ] **P0 Task Completion:** 6/6 complete ✅
- [ ] **Competitive Parity:** 60% vs ChatGPT ✅
- [ ] **Usability:** Chat + file upload + model selection ✅
- [ ] **User Flow:** Immediately useful on landing ✅

### Post-P1 (After Week 1)
- [ ] **P0 + P1 Completion:** 10/10 tasks ✅
- [ ] **Competitive Parity:** 75% vs ChatGPT ✅
- [ ] **Differentiators:** Multi-terminal, consensus, evidence visible ✅
- [ ] **Power Users:** Can execute parallel work ✅

---

## Next Steps (Priority Order)

### TODAY (December 5)
1. **Backend API Audit** - Determine which endpoints exist (2 hours)
2. **Stakeholder Decision** - Delay launch vs. launch with console.html (1 hour)
3. **Merge console.html → dashboard** - If proceeding with Option B (4-6 hours)

### TOMORROW (December 6)
1. **Start P0 Task 1** - Chat Input Component (6-8 hours)

### NEXT 3 DAYS (December 7-9)
1. **P0 Tasks 2-6** - Streaming, upload, model selector, history, API keys (20-26 hours)

### FINAL 5 DAYS (December 10-14)
1. **Testing & polish** - Fix bugs, improve UX (20 hours)
2. **HN post draft** - Write launch post (2 hours)
3. **Demo video** - Record product demo (4 hours)

---

## Appendix: Backend API Requirements

### Required Endpoints for P0 Launch

```
POST /api/chat/send
Body: { conversation_id, message, files[], model }
Response: { message_id, response_text, evidence_hash }

GET /api/chat/stream?message_id=<id>
Response: SSE stream of response tokens

GET /api/conversations
Response: [{ id, title, last_message_at, message_count }]

GET /api/conversations/:id
Response: { id, title, messages: [{ role, content, timestamp, evidence_hash }] }

POST /api/conversations
Body: { title }
Response: { id, title, created_at }

DELETE /api/conversations/:id
Response: { success: true }

POST /api/upload
Body: FormData with file
Response: { file_id, filename, size, url }

GET /api/models
Response: [{ id, name, provider, speed, cost, capabilities[] }]

POST /api/keys/save
Body: { provider, api_key }
Response: { success: true, key_status: 'valid' }

POST /api/keys/validate
Body: { provider, api_key }
Response: { valid: true, message: 'Key validated successfully' }
```

---

## Conclusion

### Current Status: 🔴 RED - NOT LAUNCH READY

The Missionize dashboard is a **well-designed monitoring tool** but lacks the **primary interaction features** needed to compete with ChatGPT and Claude. Users cannot chat, cannot upload files, cannot select models, and must discover a hidden console page to actually use the product.

### Critical Path: 26-34 Hours to Minimum Viable Competitor

Completing P0 tasks will transform the dashboard from a **monitoring tool** into a **ChatGPT competitor with unique differentiators** (multi-model routing, evidence chain, consensus validation).

### Recommended Action: Option C (Delay & Build)

**Delay HN launch to December 22-29** to complete P0 tasks and launch with a competitive, usable interface. Launching on December 15 with current state risks negative HN reception and brand damage.

### Alternative: Option B (Console-Only Launch)

If delay is unacceptable, **pivot messaging** to position console.html as primary interface and call it a "developer beta." This manages expectations and reduces risk of negative reception.

---

**Document Status:** COMPLETE ✅
**Assessment Date:** December 5, 2025
**Total Effort to Launch-Ready:** 26-34 hours (P0), 49-63 hours (P0+P1)
**Recommendation:** Delay launch by 1-2 weeks to complete P0 tasks

---

*For technical implementation details, see:*
- `DASHBOARD_BUILD_SUMMARY_DEC5.md` (current state)
- `AI_OPERATING_SYSTEM_VISION_DEC4.md` (strategic vision)
- Backend API specification (TBD - requires audit)

---

**END OF MASTER PLAN**
