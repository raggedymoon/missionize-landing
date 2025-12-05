# Missionize Landing & Dashboard

**Frontend website for the Missionize AI orchestration platform.**

> **🏗️ MULTI-REPO PROJECT:** This is the **Frontend** repo. See [ARCHITECTURE_REFERENCE.md](ARCHITECTURE_REFERENCE.md) for how the three repos work together.

## Deployment

- **Production URL:** https://missionize.ai
- **Hosted on:** Vercel
- **Auto-deploy:** Push to `main` branch

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` or `/index.html` | Marketing landing page |
| Dashboard | `/dashboard.html` | Main application dashboard |
| Console | `/console.html` | AI console interface |
| Login | `/login.html` | User authentication |
| Signup | `/signup.html` | New user registration |

## Dashboard Views

The dashboard has multiple tabs, each powered by a JavaScript module:

| Tab | JS File | Backend Endpoint |
|-----|---------|-----------------|
| Chat | `js/dashboard/chat.js` | `/api/chat/send`, `/api/chat/stream` |
| Pipeline | `js/dashboard/pipeline.js` | `/missions/pipeline` |
| History | `js/dashboard/history.js` | `/missions/history` |
| Evidence | `js/dashboard/evidence.js` | `/evidence/sessions` |
| Patterns | `js/dashboard/patterns.js` | `/patterns` |
| Mizzi | `js/dashboard/mizzi.js` | `/mizzi/status`, `/mizzi/events` |

## Local Development

```bash
# Start a local server
cd C:\Users\thepm\Desktop\missionize-landing
python -m http.server 8080

# Visit http://localhost:8080
```

For full functionality, also run the backend API locally:
```bash
cd C:\Users\thepm\Desktop\Missionize_service_api
python -m uvicorn api.main:app --reload --port 8000
```

## Project Structure

```
missionize-landing/
├── index.html              # Landing page
├── dashboard.html          # Main dashboard
├── console.html            # AI console
├── login.html              # Login page
├── signup.html             # Signup page
├── js/
│   ├── dashboard/          # Dashboard JavaScript modules
│   │   ├── api.js          # API helper functions
│   │   ├── chat.js         # Chat view
│   │   ├── pipeline.js     # Pipeline view
│   │   ├── history.js      # History view
│   │   ├── evidence.js     # Evidence view
│   │   ├── patterns.js     # Patterns view
│   │   └── mizzi.js        # Mizzi sidecar view
│   └── ...
├── css/                    # Stylesheets
├── images/                 # Static images
└── ARCHITECTURE_REFERENCE.md  # Quick architecture guide
```

## Related Repositories

| Repo | Purpose | Deploys To |
|------|---------|------------|
| [Missionize](../Missionize) | Core engine (source of truth) | Not deployed |
| [Missionize_service_api](../Missionize_service_api) | Backend API | Railway |
| **This repo** | Frontend website | Vercel |

## License

Proprietary - Commissionze Inc
