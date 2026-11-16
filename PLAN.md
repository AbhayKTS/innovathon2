# PLAN.md — AAPDA Grid Project Plan

> Sprint plan for the hackathon day. Living document — update as the sprint progresses.

---

## 1. MVP Scope

### In Scope ✅
- **AAPDA Lens Dashboard** — incident list, duplicate-detection flagging UI, evidence/location/timestamp consistency display, uncertainty score display, human review queue with approve/reject actions
- **MargRakshak Dashboard** — road closure map (Leaflet + OSM), alternate route suggestions, disconnected settlement indicators, facility access status
- **RahatGrid Dashboard** — relief request list, inventory status, AI-generated priority allocation recommendations, feasible delivery tracking panel
- **Overview / Home Dashboard** — cross-module summary cards, alert count, map overview
- **Public Report Form** — citizen-facing incident submission form (name, location, description, photo upload placeholder)
- **Mock API Layer** — `frontend/lib/api/mock-adapter.ts` returning realistic static data for all three modules
- **Responsive Layout** — works on mobile (375px), tablet (768px), and desktop (1440px)
- **shadcn/ui Component Library** — consistent design system throughout
- **DEMO/SIMULATED data badges** on all data-displaying pages

### Out of Scope ❌
- Real-time push / WebSockets / SSE
- Authentication & authorization (login, roles, sessions)
- Payment or procurement flows
- Production AI/ML backend inference
- Database persistence (no real DB in demo)
- SMS/email notification dispatch
- Offline PWA support
- Multi-language / i18n
- End-to-end encryption of field communications

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│                                                         │
│  Next.js 15 App Router (TypeScript)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  AAPDA Lens │  │ MargRakshak  │  │   RahatGrid   │  │
│  │  Dashboard  │  │  Map Module  │  │   Dashboard   │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│         │                │                  │           │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Zustand State Store                   │   │
│  └──────────────────────────────────────────────────┘   │
│         │                │                  │           │
│  ┌──────────────────────────────────────────────────┐   │
│  │       frontend/lib/api/  (typed clients)         │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  mock-adapter.ts  (demo) │  real client    │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
              │  NEXT_PUBLIC_API_BASE_URL
              ▼
     [Real Backend — not in demo scope]
     REST API (Node/Express or FastAPI)
     PostgreSQL / PostGIS
     AI/ML inference service
```

### Key Architectural Decisions
| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 App Router | SSR/SSG, file-based routing, React Server Components |
| Language | TypeScript 5 strict | Type safety, team coordination |
| Styling | Tailwind CSS 4 + shadcn/ui | Rapid UI, consistent design system |
| Maps | Leaflet + react-leaflet + OSM | Free tiles, no API key needed for demo |
| State | Zustand | Lightweight, TypeScript-friendly, no boilerplate |
| Data fetching | @tanstack/react-query | Caching, loading/error states |
| Validation | Zod | Runtime type safety for API responses |
| Icons | Lucide React | Consistent, tree-shakeable |
| Mock data | mock-adapter.ts | Swappable with real API without changing components |

---

## 3. Tech Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-badge": "latest",
    "@radix-ui/react-tooltip": "latest",
    "lucide-react": "latest",
    "leaflet": "^1.9.0",
    "react-leaflet": "^4.2.0",
    "@types/leaflet": "latest",
    "zustand": "^5.0.0",
    "zod": "^3.0.0",
    "@tanstack/react-query": "^5.0.0",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@types/node": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest"
  }
}
```

---

## 4. Milestones (Day-of Sprint)

### M1 — Foundation (0–2h)
**Goal:** Everyone can run the project locally.

| Task | Owner | Done When |
|---|---|---|
| Git repo + branch setup | Dev D | `feature/frontend-dashboard` branch exists |
| All doc files written | Dev A | RULES.md, PLAN.md, TASKS.md, COMPLETED_AND_REMAINING.md committed |
| Next.js 15 scaffold | Dev A | `npx create-next-app` complete, TypeScript + Tailwind configured |
| shadcn/ui init | Dev A | `npx shadcn-ui@latest init` complete |
| Backend project init | Dev B | Express/FastAPI project boots |
| AI/data env setup | Dev C | Python venv or Node env ready |

### M2 — Core Layout + Data Types (2–5h)
**Goal:** Shell of the app navigable; all TypeScript types defined.

| Task | Owner | Done When |
|---|---|---|
| App shell: sidebar, top nav | Dev A | Navigation between all three modules works |
| Overview dashboard | Dev A | 4 summary cards visible with DEMO badges |
| All TypeScript types | Dev A | `frontend/types/` covers Incident, Road, ReliefRequest, etc. |
| API_CONTRACT.md draft | Dev B | All endpoints documented with req/res schemas |
| Mock adapter skeleton | Dev A | Returns typed empty arrays for all endpoints |
| Database schema | Dev C | `docs/DATABASE_SCHEMA.md` populated |

### M3 — AAPDA Lens + MargRakshak (5–8h)
**Goal:** Two of three modules fully demoed with mock data.

| Task | Owner | Done When |
|---|---|---|
| AAPDA Lens: incident list | Dev A | Table with severity, location, timestamp, duplicate flag |
| AAPDA Lens: review queue | Dev A | Approve/Reject buttons with human confirmation modal |
| AAPDA Lens: uncertainty scores | Dev A | Score displayed with SIMULATED badge |
| MargRakshak: Leaflet map | Dev A | Map renders with road closure markers |
| MargRakshak: closure sidebar | Dev A | List of closures with alternate route suggestion |
| MargRakshak: settlement access | Dev A | Disconnected settlements shown as map layer |
| Deduplication logic stub | Dev C | Returns duplicate candidates for mock incidents |

### M4 — RahatGrid + Public Report Form (8–11h)
**Goal:** All three modules functional; citizen form live.

| Task | Owner | Done When |
|---|---|---|
| RahatGrid: request list | Dev A | Table of relief requests with priority scores |
| RahatGrid: inventory panel | Dev A | Inventory table with stock levels |
| RahatGrid: allocation recommendations | Dev A | AI suggestions with SIMULATED badge + human confirm |
| RahatGrid: delivery tracking | Dev A | List of in-flight deliveries with status |
| Public report form | Dev A | Form validates and shows success confirmation |
| Priority scoring stub | Dev C | Returns sorted priority list from mock requests |
| Backend endpoints live | Dev B | /incidents, /roads, /relief-requests respond |
| Integration test | Dev D | Frontend hits real backend endpoints at least once |

### M5 — Polish, Responsive, Demo Prep (11–13h)
**Goal:** Demo-ready. Build passes. Looks good on all viewports.

| Task | Owner | Done When |
|---|---|---|
| Responsive audit 375px | Dev A | All pages usable on mobile |
| Responsive audit 768px | Dev A | Tablet layout works |
| `npm run build` passes | Dev A | Zero errors |
| `npm run lint` passes | Dev A | Zero errors |
| COMPLETED_AND_REMAINING.md updated | Dev A | Accurate final state |
| Demo script written | Dev D | Walk-through script covers all 4 demo scenarios |
| Deployment to local/demo URL | Dev D | App accessible at demo URL |

---

## 5. Integration Strategy

### Demo Mode (Hackathon)
```
NEXT_PUBLIC_API_BASE_URL=mock
```
- When `NEXT_PUBLIC_API_BASE_URL === 'mock'`, all API clients delegate to `mock-adapter.ts`.
- Mock adapter returns realistic static data matching `docs/API_CONTRACT.md` schemas exactly.
- Zero network dependency — works offline.

### Real Backend (Post-Hackathon)
```
NEXT_PUBLIC_API_BASE_URL=https://api.aapda-grid.example.com
```
- Swap the env var. No component code changes required.
- API clients automatically use the real HTTP endpoints.
- Zod schemas validate real responses at runtime.

---

## 6. Demo Plan (4 Scenarios)

### Scenario 1: Citizen Reports an Incident
1. Open `/report` (Public Report Form)
2. Fill in: location (Ramban, J&K), type (landslide), description, severity
3. Submit — see success confirmation with report ID
4. Narrator: "Citizens can report incidents directly. The AI system queues them for DDMA review."

### Scenario 2: DDMA Reviews Duplicate Incidents
1. Navigate to AAPDA Lens → Review Queue
2. Show two similar landslide reports flagged as potential duplicates (AI confidence score with SIMULATED badge)
3. Click "Review" → human review modal shows evidence side-by-side
4. Click "Confirm Duplicate" (human confirmation button)
5. Narrator: "The AI detects duplicates — but a human DDMA officer makes the final call."

### Scenario 3: Road Closure & Alternate Routes
1. Navigate to MargRakshak → Map
2. Show road closure on NH-44 near Banihal with red marker
3. Sidebar shows AI-suggested alternate route via Mughal Road
4. Show disconnected settlement layer (Sinthan Top area)
5. Narrator: "Road teams see closures and AI-suggested alternates — they confirm and dispatch."

### Scenario 4: Relief Allocation Recommendation
1. Navigate to RahatGrid → Allocations
2. Show 3 pending relief requests with AI priority scores (SIMULATED badges)
3. Highest priority: isolated village, 500+ people, no food for 48h
4. Click "Review Allocation" → confirmation modal with AI rationale
5. Click "Approve Allocation" (human confirmation)
6. Narrator: "AI recommends — the relief coordinator approves. No auto-allocation."

---

## 7. Testing Checklist

### Automated (Before Every Commit)
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] TypeScript strict compilation — no `any` warnings

### Manual (Before Final Demo)
- [ ] All routes navigate correctly (no 404s)
- [ ] 375px viewport: all pages usable, no overflow, text readable
- [ ] 768px viewport: tablet layout correct
- [ ] 1440px viewport: desktop layout correct
- [ ] All DEMO/SIMULATED badges visible on data pages
- [ ] All AI output labelled "AI Recommendation"
- [ ] All human confirmation buttons present and functional
- [ ] Public report form validates empty fields
- [ ] Map loads with OpenStreetMap tiles
- [ ] No browser console errors on any page

---

*Last updated: Hackathon Day — AAPDA Grid Team*
