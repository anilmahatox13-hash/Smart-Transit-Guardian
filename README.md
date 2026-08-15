# Smart Transit Guardian

AI-Assisted Smart Bus Management, Safety, Real-Time Telemetry & Predictive Transportation Platform.

## Architecture
- **Frontend:** React 18 + Vite + Tailwind CSS + Leaflet (OpenStreetMap)
- **Backend:** Node.js + Express.js (REST API + RBAC)
- **Database:** MongoDB Atlas (M0 Free Tier) + Mongoose
- **AI/ML Service:** Python + FastAPI + scikit-learn
- **Real-Time:** Polling (5s) fallback / Socket.IO

## Monorepo Layout
- `/client` - React frontend SPA
- `/server` - Express backend API
- `/ai-service` - FastAPI predictive analytics service
- `/tests` - Integration, E2E, and security test suites
- `/docs` - Architecture and API contract documentation
- `/scripts` - Database seeders and route simulators
