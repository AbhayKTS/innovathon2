# RULES.md — AAPDA Grid Project Rules

> **Mandatory for all contributors. Read before writing a single line of code.**

---

## 1. Folder Ownership

Each folder has a designated owner. Do **not** modify another owner's files without explicit coordination.

| Owner | Owns |
|---|---|
| **Frontend Lead (Dev A)** | `frontend/**`, `docs/*` (except API_CONTRACT.md), `RULES.md`, `DESIGN.md`, `PLAN.md`, `TASKS.md`, `COMPLETED_AND_REMAINING.md`, `README.md` |
| **Backend Lead (Dev B)** | `backend/**`, `docs/API_CONTRACT.md` (coordinate with Frontend Lead) |
| **Data/AI Lead (Dev C)** | `ai/**`, `models/**`, `docs/DATABASE_SCHEMA.md` |
| **DevOps (Dev D)** | `docker/**`, `docker-compose*.yml`, `.github/**`, CI/CD config |

> **Conflicts:** If you need to touch another owner's files, open a discussion first. Last-write-wins creates bugs.

---

## 2. Git Branches & Commit Rules

### Branches
- **Active branch:** `feature/frontend-dashboard` — all frontend work happens here.
- **Never push directly to `main`.** `main` is protected. PRs only.
- Create sub-branches from `feature/frontend-dashboard` for large isolated features (e.g. `feature/frontend-dashboard/rahatgrid-ui`), then PR back into `feature/frontend-dashboard`.

### Commit Message Format
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`  
**Scopes:** `lens`, `marg`, `rahat`, `layout`, `api`, `types`, `docs`, `deps`, `ci`

**Examples:**
```
feat(lens): add duplicate incident detection panel
fix(marg): correct road closure map marker z-index
docs(api): update API_CONTRACT.md with /incidents endpoint
chore(deps): add zustand@5
```

### Pull Requests
- At least one reviewer approval required before merge.
- PR description must reference task IDs (e.g. `Closes FE-03`).
- Squash-merge preferred to keep history clean.

---

## 3. API Contract

- **Base URL env var:** `NEXT_PUBLIC_API_BASE_URL` — set in `.env.local` (never committed).
- **Typed API clients:** All fetch calls must live in `frontend/lib/api/`. No raw `fetch()` in components.
- **Mock adapter:** `frontend/lib/api/mock-adapter.ts` — used in demo/dev when real backend is unavailable. The mock must mirror the exact shape of `docs/API_CONTRACT.md`.
- **No invented endpoints.** If an endpoint isn't in `docs/API_CONTRACT.md`, it doesn't exist. Raise it with the Backend Lead first.
- **Follow `docs/API_CONTRACT.md`** as the single source of truth for request/response schemas.

---

## 4. Shared TypeScript Models

- **Frontend types:** `frontend/types/` — these are the **source of truth for the UI layer**.
- **Backend types:** `backend/types/` — maintained by Backend Lead.
- **Sync mechanism:** Any type that crosses the API boundary must be declared in `docs/API_CONTRACT.md` and mirrored consistently in both `frontend/types/` and `backend/types/`.
- Coordinate changes via API_CONTRACT.md PR, not by editing each other's type files directly.

---

## 5. Secrets & Environment Variables

- **Never commit `.env.local`** — it is in `.gitignore`.
- Maintain **`.env.example`** with all required variable names and placeholder values (no real secrets).
- **No hardcoded API keys, tokens, passwords, or credentials** anywhere in source code or committed config files.
- If a secret is accidentally committed, treat it as compromised immediately and rotate it.

---

## 6. Ignored Files

The following are in `.gitignore` and must never be force-added:

```
node_modules/
.next/
.env
.env.local
.env*.local
dist/
out/
*.log
.DS_Store
Thumbs.db
```

---

## 7. Coding Standards

### TypeScript
- **Strict mode enabled** (`"strict": true` in `tsconfig.json`). No exceptions.
- **No `any`** — use `unknown` and narrow, or define a proper type. `// @ts-ignore` and `// @ts-expect-error` require a written justification comment.
- All exported functions and components must have explicit return types.

### Linting
- **ESLint** with Next.js recommended config. All lint errors must be resolved before commit. Warnings are not ignored.
- Run `npm run lint` before every commit.

### File Structure
```
frontend/
  app/
    components/     ← Reusable UI components
    (routes)/       ← Page routes (App Router convention)
  lib/
    api/            ← API clients and mock adapter
  types/            ← Shared TypeScript type definitions
  public/           ← Static assets
```

- **Components:** `frontend/app/components/`
- **Pages/routes:** `frontend/app/(routes)/`
- **No barrel files (`index.ts`)** that re-export everything — import directly.

### Styling
- **Tailwind CSS utility classes only.** No `style={{}}` inline styles, no separate CSS modules unless absolutely necessary and approved.
- Use **shadcn/ui** component primitives. Do not reinvent what shadcn already provides.
- Use **Lucide React** for all icons. No other icon libraries.

---

## 8. Data Provenance & Demo Integrity

> This system operates in a life-safety adjacent domain. Data honesty is non-negotiable.

- **All synthetic or demo data** displayed in the UI must carry a visible **`DEMO`** or **`SIMULATED`** badge. No exceptions.
- **No fabricated AI confidence scores.** If the AI model hasn't run, display `--` or `N/A`, not a made-up percentage.
- **No fake real-time data.** Mock data must be clearly labelled as static/simulated. No auto-incrementing counters that imply live feeds.
- Do not present demo data in a way that could be mistaken for real incident reports, road statuses, or relief inventory levels.

---

## 9. Human Oversight (Critical)

> AI assists — humans decide. This is non-negotiable for safety and legal compliance.

- The AI system **only recommends**. It never:
  - Officially verifies an incident
  - Issues public warnings
  - Dispatches responders
  - Authorizes or executes relief allocations
- **Every AI recommendation in the UI must:**
  - Be clearly labelled as an AI suggestion (e.g. "AI Recommendation — Requires Human Review")
  - Have an explicit **human confirmation button** before any action is taken
  - Display the AI's reasoning/uncertainty alongside the recommendation
- **No auto-dispatch, auto-verify, or auto-allocate flows.** If a user flow skips human confirmation, it is a bug.

---

## 10. Testing Before Commit

Run the following before every commit on `feature/frontend-dashboard`:

```bash
# From frontend/
npm run build      # Must pass with zero errors
npm run lint       # Must pass with zero errors
```

**Manual checks:**
- Test all navigation links — no 404s or broken routes.
- Test mobile viewport at **375px width** (iPhone SE baseline).
- Verify all DEMO badges are visible on data-displaying pages.
- Verify all AI output labels and human confirmation buttons are present.

---

## 11. Truthful Progress Tracking

- **`COMPLETED_AND_REMAINING.md` must be kept accurate at all times.**
- A task is **Completed and Verified** only if: the code is committed, the build passes, and a team member has manually confirmed the feature works.
- A task is **Implemented but Unverified** if code exists but hasn't been tested end-to-end.
- Do not move tasks to Completed to make progress look better than it is. Demo judges will verify functionality.
- Update `COMPLETED_AND_REMAINING.md` as part of the same commit that completes the feature.

---

*Last updated: Hackathon Day — AAPDA Grid Team*
