# Missionize Architecture Reference

This repo (missionize-landing) is the **FRONTEND WEBSITE**.

## Quick Facts
- **Deploys to**: Vercel → https://missionize.ai
- **Contains**: HTML pages, JavaScript, CSS, static assets
- **Push to deploy**: `git push origin main` → Vercel auto-deploys

## Related Repos
| Repo | Purpose | Deploys To |
|------|---------|------------|
| Missionize | Core engine (source of truth) | Nowhere |
| missionize-api-service | Backend API | Railway |
| **This repo** | Frontend website | Vercel |

## Full Architecture Doc
See: `C:\Users\thepm\Desktop\Missionize\ARCHITECTURE.md`

## Key Pages
- `index.html` - Landing page
- `dashboard.html` - Main dashboard
- `console.html` - AI console
- `login.html` / `signup.html` - Auth pages

## Dashboard Views (js/dashboard/*.js)
| File | Calls Endpoint |
|------|---------------|
| chat.js | /api/chat/send, /api/chat/stream |
| pipeline.js | /missions/pipeline |
| history.js | /missions/history |
| evidence.js | /evidence/sessions |
| patterns.js | /patterns |
| mizzi.js | /mizzi/status, /mizzi/events |
