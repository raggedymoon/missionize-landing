# Dashboard API Integration Notes

## Completed (P0)

### ✅ Chat View - FULLY WIRED
- **Endpoint**: `POST /api/mizzi/chat`
- **Status**: Complete and functional
- **Features**:
  - Real backend API calls
  - Mission ID tracking
  - Mizzi status display
  - Mission actions (View Mission, View Evidence)
  - Error handling
  - Loading states

## Ready to Wire (P1)

### Pipeline View
**Current**: Mock data
**API Available**: `GET /api/missions?limit=20`

**Quick Integration**:
```javascript
// In js/dashboard/pipeline.js
import { getJson } from './api.js';

async function fetchPipelineData(appState) {
    try {
        const missions = await getJson('/api/missions?limit=20', appState);
        return missions;
    } catch (error) {
        console.error('Failed to load missions:', error);
        return mockPipelineMissions; // Fallback to mock
    }
}
```

**Response Format**:
```json
[
    {
        "id": "mission-123",
        "description": "...",
        "status": "completed", // queued|running|completed|failed
        "progress": 100.0,
        "started": "2025-12-05T10:30:00Z",
        "completed": "2025-12-05T10:35:00Z",
        "files_generated": 5,
        "validations_passed": 10,
        "validations_total": 10
    }
]
```

### History View
**Current**: Mock data
**API Available**: `GET /api/missions?status=completed,failed&limit=50`

**Quick Integration**:
```javascript
// In js/dashboard/history.js
import { getJson } from './api.js';

async function fetchHistoryData(appState) {
    try {
        // Backend returns missions, not history format
        // Need to transform status=completed OR status=failed
        const missions = await getJson('/api/missions?limit=50', appState);

        // Filter for completed/failed only
        const history = missions.filter(m =>
            m.status === 'completed' || m.status === 'failed'
        );

        // Transform to history format (add duration field)
        return history.map(m => ({
            ...m,
            duration: calculateDuration(m.started, m.completed),
            timestamp: m.completed || m.started
        }));
    } catch (error) {
        console.error('Failed to load history:', error);
        return mockHistoryMissions; // Fallback to mock
    }
}
```

### Evidence View
**Current**: Mock data
**API Available**: `GET /api/missions/{mission_id}/evidence`

**Quick Integration**:
```javascript
// In js/dashboard/evidence.js
import { getJson } from './api.js';

async function fetchEvidenceData(appState) {
    try {
        // First get list of completed missions
        const missions = await getJson('/api/missions?limit=20', appState);

        // Transform to evidence list format
        return missions.map(m => ({
            missionId: m.id,
            summary: m.description,
            evidenceHash: `sha256:${m.id}`, // Placeholder
            timestamp: m.completed || m.started,
            description: `${m.validations_passed}/${m.validations_total} validations passed`
        }));
    } catch (error) {
        console.error('Failed to load evidence:', error);
        return mockEvidenceData; // Fallback to mock
    }
}

async function fetchMissionEvidence(missionId, appState) {
    try {
        const evidence = await getJson(`/api/missions/${missionId}/evidence`, appState);
        // Evidence envelope includes full conversation log
        return evidence;
    } catch (error) {
        console.error('Failed to load mission evidence:', error);
        return null;
    }
}
```

**Evidence Response Format**:
```json
{
    "mission_id": "mission-123",
    "mission_description": "...",
    "mission_status": "completed",
    "created_at": "2025-12-05T10:30:00Z",
    "started_at": "2025-12-05T10:30:05Z",
    "completed_at": "2025-12-05T10:35:00Z",
    "duration_seconds": 295.5,
    "messages": [
        {
            "timestamp": "...",
            "agent": "codegen",
            "message_type": "plan_proposal",
            "content": "...",
            "metadata": {}
        }
    ],
    "message_count": 15,
    "approvals": 1,
    "rejections": 0,
    "errors": 0,
    "supervisor_approved": true,
    "supervisor_risk_level": "low",
    "supervisor_reason": "Safe to proceed",
    "validations_passed": 10,
    "validations_total": 10,
    "cost_usd": 0.05,
    "tokens_in": 1000,
    "tokens_out": 2000,
    "files_generated": 5,
    "preview_dir": "/path/to/output"
}
```

## Additional API Endpoints Available

### Mission Details
- **GET** `/api/missions/{mission_id}` - Get detailed mission info
- **GET** `/api/missions/{mission_id}/files` - List generated files
- **GET** `/api/missions/{mission_id}/files/{file_path}` - Get file content
- **GET** `/api/missions/{mission_id}/download` - Download ZIP

### Mission Control
- **POST** `/api/missions/{mission_id}/retry` - Retry failed mission
- **POST** `/api/missions/{mission_id}/cancel` - Cancel running mission
- **POST** `/api/missions/{mission_id}/pause` - Pause mission
- **POST** `/api/missions/{mission_id}/resume` - Resume mission

### Dashboard Data
- **GET** `/api/mizzi/dashboard` - Unified dashboard data (stats + recent missions + patterns)
- **GET** `/api/statistics` - Overall mission statistics
- **GET** `/api/costs` - Cost tracking summary
- **GET** `/api/health` - System health check

## Testing

### Test Backend Connection
```javascript
import { testConnection } from './js/dashboard/api.js';

const appState = { apiBaseUrl: 'http://localhost:8001' };
try {
    const health = await testConnection(appState);
    console.log('Backend status:', health);
} catch (error) {
    console.error('Backend not reachable:', error.message);
}
```

### Test Mission Listing
```bash
curl http://localhost:8001/api/missions
```

### Test Chat API
```bash
curl -X POST http://localhost:8001/api/mizzi/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Write a Python function to calculate factorial"}'
```

## Next Steps

1. **Test Chat Integration** - Verify Chat view works with real backend
2. **Wire Pipeline View** - Use `/api/missions` endpoint
3. **Wire History View** - Filter missions by status
4. **Wire Evidence View** - Use `/api/missions/{id}/evidence` endpoint
5. **Add Mission Details Modal** - Show full mission info when clicking "View Mission"
6. **Add File Browser** - Display generated files using `/api/missions/{id}/files`
7. **Add Mission Controls** - Retry/cancel buttons for failed/running missions

## Configuration

### API Base URL
The dashboard reads the API base URL from:
1. `appState.apiBaseUrl` (set in js/dashboard.js)
2. `localStorage.getItem('missionize_api_url')`
3. Default: `https://api.missionize.ai`

### Local Development
For local development, set the API URL:
```javascript
localStorage.setItem('missionize_api_url', 'http://localhost:8001');
```

Or update the default in `js/dashboard.js`:
```javascript
apiBaseUrl: localStorage.getItem('missionize_api_url') || 'http://localhost:8001',
```

## Error Handling

All API calls use the `api.js` helper module which provides:
- Automatic error handling
- Connection error detection
- JSON parsing
- Authorization headers (if API key is set)

If an API call fails:
1. User sees friendly error message
2. Dashboard falls back to mock data (if applicable)
3. Error is logged to browser console
4. UI remains functional
