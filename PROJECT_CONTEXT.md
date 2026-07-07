# LifeOS Client — Complete Project Context

> **How to use this file:** Read the whole thing at the start of every session.
> Update the `## Session Log` section at the end of every session before closing.
> This file is the single source of truth — do not rely on chat history.

---

## 1. What This Project Is

A **productivity operating system** web client (React + Vite + TypeScript) that connects to a live Express/Prisma backend at `http://localhost:3000/api/v1`. The app is a personal life-management dashboard: areas → goals → tasks → habits → focus sessions → reviews, plus a knowledge base, vault, capture/dump inbox, and AI-powered classifier.

---

## 2. Stack

| Layer | Choice |
|---|---|
| Bundler | Vite 5 |
| UI framework | React 18 + TypeScript |
| State / data-fetching | Redux Toolkit + RTK Query (`@reduxjs/toolkit`) |
| HTTP | Axios, wrapped as RTK Query `baseQuery` |
| Styling | Tailwind CSS v4 + custom design-system tokens in `src/index.css` |
| Component lib | shadcn/ui (Button, Input, Label only — rest is hand-built) |
| Routing | React Router v6 |
| Forms | Controlled state, no library |
| Env validation | Zod (startup-time, `src/lib/env.ts`) |

**Environment variables (`.env`):**
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 3. Folder Structure

```
src/
├── App.tsx                          # Route tree (all routes declared here)
├── main.tsx                         # Entry: Redux Provider, initTheme(), React DOM
├── index.css                        # Full design system (tokens + @layer components)
│
├── store/
│   ├── api.ts                       # createApi — single RTK Query instance, all tagTypes
│   ├── store.ts                     # configureStore (api.reducer + auth reducer)
│   └── hooks.ts                     # useAppDispatch, useAppSelector
│
├── lib/
│   ├── env.ts                       # Zod-validated env (throws on bad config)
│   ├── utils.ts                     # cn() helper (clsx + tailwind-merge)
│   └── api/
│       ├── axiosBaseQuery.ts        # Axios RTK baseQuery; unwraps envelope; clears token on 401
│       └── formErrors.ts           # parseApiErrors() — maps backend {errors} → FieldErrorMap
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx             # Sidebar + Topbar + <Outlet /> + CommandPalette + TweaksPanel
│   │   ├── Sidebar.tsx              # Nav links with count badges + glow active bar
│   │   └── Topbar.tsx               # Search, vibe selector, Focus Mode toggle
│   ├── charts/
│   │   ├── Donut.tsx                # SVG donut ring, takes value 0–100
│   │   ├── Sparkline.tsx            # SVG sparkline, takes number[]
│   │   └── HabitDots.tsx            # 7-day boolean dot strip
│   └── ui/
│       ├── button.tsx               # shadcn Button
│       ├── input.tsx                # shadcn Input
│       ├── label.tsx                # shadcn Label
│       ├── Stat.tsx                 # Big-number stat tile (num + label + optional color)
│       └── FullScreenLoader.tsx     # Centered spinner
│
└── features/
    ├── auth/                        # Login, register, session restore, JWT storage
    ├── areas/                       # Life domains; everything else requires an areaId
    ├── tasks/                       # Tasks with type/priority/recurrence
    ├── habits/                      # Habits with daily log, streaks, 7-day strip
    ├── goals/                       # Goals + nested Projects
    ├── knowledge/                   # Topics → Resources / Notebooks / Notes
    ├── vault/                       # Motivational content store
    ├── reviews/                     # Periodic reviews + insights
    ├── calendar/                    # Day-view time blocks
    ├── focus/                       # Focus sessions + immersive mode
    ├── dashboard/                   # Command-center home screen
    ├── capture/                     # Dump inbox + AI classifier + convert form
    ├── identity/                    # Identity compass + App Settings (B9)
    ├── settings/                    # UserSettings RTK module (B9)
    ├── behavior/                    # Fire-and-forget telemetry events
    ├── command/                     # ⌘K command palette
    └── tweaks/                      # Accent theming (localStorage, live CSS vars)
```

---

## 4. API Layer Pattern

Every feature injects into the single `api` instance:

```ts
// src/store/api.ts — tagTypes registered:
"Auth" | "Area" | "Task" | "Habit" | "HabitLog" | "Goal" | "Project" |
"Topic" | "Notebook" | "Resource" | "Note" | "Vault" | "Review" |
"Insight" | "Calendar" | "Focus" | "Identity" | "Capture" |
"AreaSnapshot" | "Settings"

// Pattern in every feature API file:
export const xApi = api.injectEndpoints({ endpoints: (builder) => ({ ... }) });
export const { useXQuery, useYMutation } = xApi;
```

**Backend envelope:** `{ success, message, data }` — `axiosBaseQuery` unwraps it; hooks receive `data` directly.

**Error shape:** `{ status?: number, message: string, errors?: Record<string, string[]> | null }` — call `parseApiErrors(err as ApiError)` → `{ fields: FieldErrorMap, message: string }`.

**Auth flow:** JWT in `localStorage` under key `lifeos.token`. `axiosBaseQuery` reads it and attaches `Authorization: Bearer <token>` to every request. 401 response → token cleared. `SessionLoader` calls `GET /auth/me` on mount to restore the user object into Redux.

---

## 5. Design System

All tokens live in `src/index.css` as CSS custom properties on `:root`. Key ones:

```
--acc / --acc-2 / --acc-ink      ← accent color (live, set by TweaksPanel)
--acc-soft / --acc-line / --acc-glow  ← tinted variants (opacity)
--bg / --surface-1 / --surface-2 / --surface-3 / --inset
--tx / --tx-2 / --tx-3 / --tx-4 / --tx-inv
--line / --line-2 / --line-3
--r / --r-sm / --r-xs            ← border radius scale
--gap                            ← standard spacing unit (20px)
--health / --wealth / --growth / --relationships / --creativity / --mindfulness
                                  ← area colour palette
--danger / --ok / --warn
```

**Component classes** (in `@layer components`):
`.card` `.card-pad` `.raised` `.ds-btn` `.ds-input` `.chip` `.eyebrow` `.bar` `.check` `.nav-badge` `.h-display` `.rise` `.page` `.page-head` `.page-title` `.page-sub` `.seg` `.tabs` `.tab` `.tag-toggle` `.pri` `.stat-num` `.stat-label` `.empty`

**Accent theming:** `src/features/tweaks/theme.ts` — `applyAccent(id)` sets the 6 `--acc*` variables on `:root` and saves to `localStorage`. `initTheme()` called in `main.tsx`. Available accents: chartreuse (default), blue, violet, teal, pink, orange.

---

## 6. Auth Feature (`src/features/auth/`)

**Files:** `authSlice.ts` (Redux slice), `authApi.ts` (RTK endpoints), `types.ts`, `schema.ts` (Zod), `SessionLoader.tsx`, `ProtectedRoute.tsx`, `pages/LoginPage.tsx`, `pages/RegisterPage.tsx`, `components/AuthShell.tsx`

**Endpoints:**
- `POST /auth/register` → `useRegisterMutation`
- `POST /auth/login` → `useLoginMutation`
- `GET /auth/me` → `useGetMeQuery`
- `GET /auth/stats` → `useGetStatsQuery` (B10: `{ joinedAt, tasksDone, habitsLogged, focusHours }`)

**Redux slice actions:** `setCredentials(AuthResponse)`, `setUser(User)`, `logout()`
**Selectors:** `selectCurrentUser`, `selectToken`, `selectIsAuthenticated`

**Types:**
```ts
User { id, email, name, timezone? }
AuthResponse { user: User, token: string }
ProfileStats { joinedAt, tasksDone, habitsLogged, focusHours }
```

---

## 7. Areas Feature (`src/features/areas/`)

The root entity. Every other entity requires an `areaId`.

**Types:**
```ts
Area {
  id, name, type: "PRIMARY"|"MAINTENANCE", color, icon, order, isDefault, isActive
  // A2 server-scored (optional, prefer over client-computed):
  score?, tasksDone?, tasksTotal?, streak?, focusMins?
}
AreaScoreSnapshot { id, areaId, score, tasksDone, tasksTotal, streak, focusMins, createdAt }
CreateAreaRequest { name, color, icon, type?, order?, isActive? }
```

**Endpoints:**
- `GET /areas` → `useListAreasQuery`
- `POST /areas` → `useCreateAreaMutation`
- `PATCH /areas/:id` → `useUpdateAreaMutation`
- `DELETE /areas/:id` → `useDeleteAreaMutation` (cascade deletes all children — always confirm!)
- `POST /areas/:id/snapshot` → `useSnapshotAreaScoreMutation` (A3 — fire on AreasPage mount per scored area)
- `GET /areas/:id/snapshots?limit=30` → `useListAreaSnapshotsQuery` (A3 — score history)

**Page:** `AreasPage` — donut grid + average summary card. Fires `AREA_VIEWED` behavior event. Fires score snapshot for every server-scored area on mount (fire-and-forget `useEffect`).

---

## 8. Tasks Feature (`src/features/tasks/`)

**Types:**
```ts
TaskStatus: "TODO"|"IN_PROGRESS"|"COMPLETED"|"CANCELLED"
TaskType: "BOOLEAN"|"COUNT"|"TIMER"
Priority: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"
Recurrence: "DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY"

Task {
  id, title, description?, status, priority?, taskType,
  targetCount?, completedCount?, targetMinutes?,
  dueDate?, isRecurring?, recurrence?,
  source?, areaId?, completedAt?
}
CreateTaskRequest {
  title (req), areaId?, goalId?, projectId?, status?, priority?,
  taskType?, targetCount?, targetMinutes?, dueDate?, isRecurring?, recurrence?,
  source?: "MANUAL"|"DUMP"|"LEARN", sourceId?  // B6: provenance from note/capture
}
```

**Endpoints:**
- `GET /tasks` → `useListTasksQuery` (filters: areaId, status, priority, taskType)
- `POST /tasks` → `useCreateTaskMutation`
- `PATCH /tasks/:id` → `useUpdateTaskMutation`
- `PATCH /tasks/:id/complete` → `useCompleteTaskMutation` (no body — NOT a status PATCH)
- `DELETE /tasks/:id` → `useDeleteTaskMutation`

**Gotcha:** Completion uses a dedicated endpoint, not a status field PATCH.

---

## 9. Habits Feature (`src/features/habits/`)

**Types:**
```ts
HabitType: "BOOLEAN"|"COUNT"|"TIMER"
HabitFrequency: "DAILY"|"WEEKLY"|"CUSTOM"
Day: "MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT"|"SUN"

Habit {
  id, title, description?, areaId, habitType,
  targetCount?, targetMinutes?, frequency,
  weeklyTarget?, specificDays?, reminderTime?, isActive,
  // B4 inline stats (server computes these — no N+1 needed):
  currentStreak?, longestStreak?, todayDone?, todayLog?, history?: boolean[]
}
HabitLog { id, date (YYYY-MM-DD), completed?, count?, minutes?, notes? }
```

**Endpoints:**
- `GET /habits` → `useListHabitsQuery`
- `POST /habits` → `useCreateHabitMutation`
- `PATCH /habits/:id` → `useUpdateHabitMutation`
- `DELETE /habits/:id` → `useDeleteHabitMutation`
- `POST /habits/:id/log` → `useLogHabitMutation` (body: `{ date?, completed?, count?, minutes?, notes? }` — upsert per day, safe to repeat)
- `GET /habits/:id/logs?from=&to=` → `useListHabitLogsQuery`

**Gotcha:** Log field is `completed` not `value`. Log body never sends `value`.

---

## 10. Goals & Projects Feature (`src/features/goals/`)

**Types:**
```ts
GoalStatus / ProjectStatus: "ACTIVE"|"COMPLETED"|"PAUSED"|"ABANDONED"

Goal { id, title, areaId (req), description?, priority?, status, deadline? }
Project { id, title, areaId (req), goalId?, description?, status, deadline? }
```

**Endpoints:**
- `GET /goals`, `POST /goals`, `PATCH /goals/:id`, `DELETE /goals/:id`
- `GET /projects`, `POST /projects`, `PATCH /projects/:id`, `DELETE /projects/:id`
- Hooks: `useListGoalsQuery`, `useCreateGoalMutation`, `useUpdateGoalMutation`, `useDeleteGoalMutation`, same pattern for projects.

**Page:** `GoalsPage` — goals with nested project cards. Filter by area.

---

## 11. Knowledge Feature (`src/features/knowledge/`)

**Types:**
```ts
MasteryLevel: "BEGINNER"|"INTERMEDIATE"|"ADVANCED"|"EXPERT"
ResourceType: "BOOK"|"COURSE"|"VIDEO"|"ARTICLE"|"PODCAST"|"DOCUMENTATION"|"OTHER"
ResourceStatus: "NOT_STARTED"|"IN_PROGRESS"|"COMPLETED"
NoteType: "CONCEPT"|"INSIGHT"|"SUMMARY"|"QUOTE"|"OTHER"

Topic { id, title, areaId, description?, masteryLevel? }
Notebook { id, title, topicId, description?, tags? }
Resource {
  id, title, topicId, resourceType, url?, platform?, status?, rating?, notes?,
  // B8 progress fields:
  lessonsCompleted?, totalLessons?, minutesConsumed?
}
Note { id, title, content, topicId, notebookId?, resourceId?, noteType?, tags? }
UpdateResourceProgressRequest { lessonsCompleted?, totalLessons?, minutesConsumed?, autoComplete? }
```

**Endpoints (knowledgeApi):**
- Topics: `GET /topics`, `GET /topics/:id`, `POST /topics`, `PATCH /topics/:id`, `DELETE /topics/:id`
- Notebooks: `GET /notebooks?topicId=`, `POST /notebooks`, `PATCH /notebooks/:id`, `DELETE /notebooks/:id`
- Resources: `GET /resources?topicId=`, `POST /resources`, `PATCH /resources/:id`, `DELETE /resources/:id`
- **B8:** `PATCH /resources/:id/progress` → `useUpdateResourceProgressMutation` (body: `{ lessonsCompleted?, totalLessons?, minutesConsumed?, autoComplete?: true }`)
- Notes: `GET /notes?topicId=`, `POST /notes`, `PATCH /notes/:id`, `DELETE /notes/:id`

**UI:** `TopicsPage` → `TopicDetailPage` (tabs: Resources / Notebooks / Notes). `ResourceRow` has a collapsible progress drawer (chevron) showing lessons done/total + minutes; inline progress summary in subtitle.

---

## 12. Vault Feature (`src/features/vault/`)

**Types:**
```ts
VaultType: "REFLECTION"|"MEMORY"|"MOTIVATION"|"RECOVERY"
MediaType: "TEXT"|"QUOTE"|"VIDEO"|"AUDIO"|"IMAGE"
VaultItem { id, title, content, vaultType, mediaType?, url?, triggerTags?, usedCount?, helpfulCount? }
```

**Endpoints:**
- `GET /vault` → `useListVaultQuery` (filter: vaultType)
- `POST /vault` → `useCreateVaultMutation`
- `PATCH /vault/:id` → `useUpdateVaultMutation`
- `DELETE /vault/:id` → `useDeleteVaultMutation`
- **B7:** `POST /vault/:id/used` → `useMarkVaultUsedMutation` — fired when user clicks "Pull"

**Behavior:** fires `VAULT_ACCESSED` on mount.

---

## 13. Reviews Feature (`src/features/reviews/`)

**Types:**
```ts
ReviewType: "DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY"
InsightStatus: "PENDING"|"IMPLEMENTED"|"STILL_WORKING"|"NOT_APPLICABLE"
Review { id, reviewType, periodStart, periodEnd, summary?, highlights?, improvements?, userNote?, aiInsights? }
InsightReview { id, reviewId, noteId, status?, userNote?, note?: {id,title}? }
```

**Endpoints:**
- `GET /reviews`, `POST /reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id`
- `GET /reviews/:id/insights`, `POST /reviews/:id/insights`, `PATCH /insights/:id`, `DELETE /insights/:id`

**Behavior:** fires `REVIEW_OPENED` on mount.

---

## 14. Calendar Feature (`src/features/calendar/`)

**Types:**
```ts
CalendarBlock { id, title, startTime, endTime, blockType? (free string, default "FOCUS"),
  isActual?, notes?, taskId?, habitId?, areaId? }
```

**Endpoints:**
- `GET /calendar?date=YYYY-MM-DD` → `useListBlocksQuery`
- `POST /calendar` → `useCreateBlockMutation`
- `PATCH /calendar/:id` → `useUpdateBlockMutation`
- `DELETE /calendar/:id` → `useDeleteBlockMutation`

**Gotcha:** `endTime` must be after `startTime` (422 otherwise).

---

## 15. Focus Feature (`src/features/focus/`)

**Types:**
```ts
FocusSession { id, startedAt, endedAt?, durationMinutes?, notes?, taskId?, habitId?, calendarBlockId? }
StartFocusRequest { startedAt?, notes?, taskId?, habitId?, calendarBlockId? }
```

**Endpoints:**
- `GET /focus` → `useListFocusQuery`
- `POST /focus` → `useStartFocusMutation`
- `PATCH /focus/:id/stop` → `useStopFocusMutation` (NOT idempotent — 409 if already stopped; disable Stop button after firing)

**`useActiveFocus` hook** (`src/features/focus/useActiveFocus.ts`): derives active session from list (session with no `endedAt` and null `durationMinutes`), ticks a local `now` every second, exposes `{ active, elapsedMs, label, start, stop, starting, stopping }`. Used by FocusTimer in Topbar and by ImmersiveMode page.

**ImmersiveMode:** full-screen focus overlay at `/focus`, outside AppShell. Focus timer + session controls.

---

## 16. Capture / Dump Feature (`src/features/capture/`)

**Types:**
```ts
CaptureType: "TASK"|"HABIT"|"NOTE"|"RESOURCE"|"VAULT"
CaptureStatus: "PENDING"|"CONVERTED"|"DISMISSED"
Capture { id, text, type, confidence (0–1), status, processed, detectedUrl?, meta? }
CreateCaptureRequest { text }
ConvertCaptureRequest { areaId?, topicId?, priority? }
```

**Endpoints:**
- `GET /capture` → `useListCapturesQuery`
- `POST /capture` → `useCreateCaptureMutation` (AI classifies type + confidence)
- `POST /capture/:id/convert` → `useConvertCaptureMutation` (body: `ConvertCaptureRequest`)
- `POST /capture/:id/dismiss` → `useDismissCaptureMutation`

**Page:** `DumpPage` at `/dump`. Inbox of pending captures. Each card shows AI type chip + confidence. Inline convert form with area/topic/priority pickers. Converts to the appropriate entity type automatically.

---

## 17. Identity Feature (`src/features/identity/`)

**Types:**
```ts
Identity { id?, personality?, values?, strengths?, weaknesses?, purpose?, thisYearGoal?, bigPicture?, lifeVision? }
UpdateIdentityRequest { same fields, all optional }
```

**Endpoints:**
- `GET /identity` → `useGetIdentityQuery` — **can return null** (show create form, not error)
- `PUT /identity` → `useUpdateIdentityMutation` (upsert)

**Page:** `IdentityPage` at `/settings`. Three sections:
1. Profile header (avatar initial, name, email, quick stats)
2. Lifetime stats grid (tasksDone, habitsLogged, focusHours, areaCount)
3. Identity compass form (purpose, thisYearGoal, personality, values/strengths/weaknesses, bigPicture, lifeVision)
4. **AppSettingsCard** (B9 UI settings — see §18)

---

## 18. Settings Feature (`src/features/settings/`) — B9

**Types:**
```ts
Vibe: "calm"|"focused"|"energetic"
FontPreference: "inter"|"mono"|"serif"
StartTab: "today"|"areas"|"dump"
UserSettings { id, userId, vibe, accent, font, startTab }
UpdateSettingsRequest { vibe?, accent?, font?, startTab? }
```

**Endpoints:**
- `GET /settings` → `useGetSettingsQuery` (returns defaults if no record yet)
- `PATCH /settings` → `useUpdateSettingsMutation` (upsert)

**UI:** `AppSettingsCard` rendered at the bottom of `IdentityPage`. Dropdowns for vibe, font, startTab. Save button. Note: `accent` field is also stored server-side but the live accent theming is handled locally by `TweaksPanel` via `localStorage` — the two systems are currently independent (TweaksPanel does not read from `UserSettings.accent`).

---

## 19. Behavior Tracking (`src/features/behavior/`)

Fire-and-forget `POST /behavior` events. **Only fire these client-side:**
- `APP_OPEN` — AppShell mount
- `AREA_VIEWED` — AreasPage mount
- `REVIEW_OPENED` — ReviewsPage mount
- `VAULT_ACCESSED` — VaultPage mount

**Do NOT fire:** `TASK_COMPLETED`, `HABIT_LOGGED`, `FOCUS_STARTED`, `FOCUS_COMPLETED`, `FOCUS_ABANDONED` — the server records those automatically.

**Hook:** `useLogBehaviorOnMount(eventType, metadata?)` — fires once on mount, swallows errors.

---

## 20. Command Palette (`src/features/command/`)

`CommandPalette` — opened with `⌘K` / `Ctrl+K` (wired in AppShell). Allows quick navigation + actions. State managed in AppShell (`paletteOpen`).

---

## 21. Error Handling Pattern

```ts
// In any form submission:
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";

try {
  await someApi({ ... }).unwrap();
} catch (err) {
  const { fields, message } = parseApiErrors(err as ApiError);
  setFieldErrors(fields);    // render fields[field][0] under each input
  setFormError(message);     // render as general error
}
```

Render field errors with `{fieldErrors.fieldName?.[0]}` under each input.

---

## 22. Key Invariants & Gotchas

| Rule | Detail |
|---|---|
| Area required first | Area must exist before Goal/Project/Topic/Habit — all require `areaId` |
| Task completion | `PATCH /tasks/:id/complete` — no body. NOT `PATCH /tasks/:id { status: "COMPLETED" }` |
| Focus stop | `PATCH /focus/:id/stop` is NOT idempotent — 409 if already stopped; disable the button |
| Calendar endTime | Must be after `startTime` — otherwise 422 |
| Habit log field | Body is `{ completed?, count?, minutes? }` — NOT `{ value }` |
| Habit log upsert | Safe to call multiple times — idempotent per habitId+date |
| Delete Area/Topic | Cascades to all children — show a strong confirmation dialog |
| Identity null | `GET /identity` → null when no record exists. Show empty form, not an error |
| `aiInsights` | Review field — read-only, never send in PATCH |
| `source`/`completedAt` | Task fields — read-only, never send |
| `usedCount`/`helpfulCount` | Vault fields — read-only |
| JWT expiry | 7 days. Rate limit: 100 req/15min → 429 → back off |
| 401 anywhere | `axiosBaseQuery` clears token. Components should redirect to login |
| Behavior events | Fire-and-forget only for the 4 client-side events listed above |
| Score snapshots | `POST /areas/:id/snapshot` — fire on AreasPage mount per scored area (A3) |
| Resource progress autoComplete | Pass `autoComplete: true` to auto-mark COMPLETED when lessonsCompleted >= totalLessons |

---

## 23. Complete Route Map

| Path | Component | Notes |
|---|---|---|
| `/login` | `LoginPage` | Public |
| `/register` | `RegisterPage` | Public |
| `/focus` | `ImmersiveMode` | Protected, full-screen, outside AppShell |
| `/` | `DashboardPage` | Command-center hero |
| `/areas` | `AreasPage` | Donut grid, fires snapshot per area |
| `/goals` | `GoalsPage` | Goals + nested projects |
| `/tasks` | `TasksPage` | Task list, filters |
| `/habits` | `HabitsPage` | Habit cards with 7-day dots |
| `/calendar` | `CalendarPage` | Day timeline + quick-focus sidebar |
| `/review` | `ReviewsPage` | Review list |
| `/review/:reviewId` | `ReviewDetailPage` | Review detail + insights |
| `/learn` | `TopicsPage` | Knowledge topics |
| `/learn/:topicId` | `TopicDetailPage` | Resources / Notebooks / Notes tabs |
| `/vault` | `VaultPage` | Motivational content |
| `/dump` | `DumpPage` | Capture inbox |
| `/settings` | `IdentityPage` | Identity + AppSettingsCard |
| `*` | Redirect to `/` | |

---

## 24. What Is Complete

- [x] Auth (login, register, session restore, 401 handling)
- [x] Areas (CRUD, donut grid, client+server scoring, cascade delete confirm)
- [x] Tasks (CRUD, complete endpoint, type/priority/recurrence conditionals, N+1 free)
- [x] Habits (CRUD, daily log, idempotent upsert, streak+7-day strip, B4 inline stats)
- [x] Goals & Projects (CRUD, nested project cards)
- [x] Knowledge — Topics, Notebooks, Resources, Notes (full CRUD)
- [x] Vault (CRUD, type filter, B7 mark-used)
- [x] Reviews + Insights (nested CRUD, note picker, B6 note→task source)
- [x] Calendar (day view, time block CRUD)
- [x] Focus (start/stop, live timer, `useActiveFocus`, ImmersiveMode page)
- [x] Dashboard (next-action hero, FocusCard, area donut grid, sparkline, today habits)
- [x] Capture/Dump (A1: inbox + AI classifier chips + inline convert form)
- [x] Identity compass form (upsert)
- [x] B10: Profile stats (GET /auth/stats wired into IdentityPage)
- [x] A2: Area server scoring (prefer server score over client-computed)
- [x] A3: Area score snapshots (POST /areas/:id/snapshot on mount, list hook available)
- [x] B4: Habit inline stats (todayDone/todayLog/history in Habit type)
- [x] B6: Note→Task provenance (source/sourceId in CreateTaskRequest)
- [x] B7: Vault mark-used (useMarkVaultUsedMutation on "Pull" button)
- [x] B8: Resource progress (PATCH /resources/:id/progress, collapsible form in ResourceRow)
- [x] B9: UI settings (GET/PATCH /settings, AppSettingsCard in IdentityPage)
- [x] Design system (tokens, component classes, design-fidelity pass on all screens)
- [x] Accent theming (TweaksPanel, localStorage, live CSS variable repaint)
- [x] Command palette (⌘K, AppShell)
- [x] Behavior tracking (fire-and-forget on 4 client events)
- [x] 422 field errors (parseApiErrors, rendered under inputs)

---

## 25. What Is Still Pending

- [x] **Immersive/Focus-mode full-screen polish** — breathing rings, area-color ambient glow, task chips, keyboard shortcuts (Space/Esc), session count footer
- [ ] **Command palette visual polish** — functional but styling vs `palette.png` prototype not complete
- [x] **Action toasts** — `sonner` installed; toasts wired to task complete, habit log, focus start/stop, vault pull, capture create/convert
- [x] **Area detail drill-in** — `/areas/:areaId` page built with score ring, sparkline history, tasks/habits/goals/projects panels, focus CTA; AreaCard and dashboard donuts now link to it
- [ ] **Goals screen primitives pass** — functional but not design-fidelity matched
- [ ] **ReviewDetailPage scaffold polish** — functional, not fully fidelity-matched
- [x] **Density + display-font tweaks** — `useApplySettings` hook applies font to `document.body` when settings load; called from `SessionLoader`
- [x] **`UserSettings.accent` ↔ TweaksPanel sync** — `useApplySettings` writes server accent to localStorage; TweaksPanel resolves both id and hex formats; TweaksPanel fires `updateSettings({accent})` on every pick (fire-and-forget)
- [x] **`startTab` routing** — `DashboardPage` reads settings on mount and navigates once per session to `areas` or `dump` if set
- [ ] **Dump/Action Converter backend** — capture `convert` endpoint exists but full action-converter UI (convert to habit/note/resource with per-type forms) is a placeholder
- [ ] **Runtime smoke test** — `tsc -b` is green but not tested end-to-end against live backend

---

## 26. Session Log

### 2026-06-17 — Session 1 (project init)
- Initialized Vite+React+TS project, configured Redux Toolkit + RTK Query, Tailwind v4, shadcn/ui.
- Implemented features #1–#13: Auth through Command palette (see §24 checklist).

### 2026-06-17 — Session 2 (design fidelity)
- Extracted prototype bundle from `design/lifeos/`.
- Ported full design system into `src/index.css` (`@layer components`).
- Rebuilt Shell (sidebar badges + glow bar), Dashboard (hero layout, donut grid, sparkline).
- Fidelity pass on all screens: Tasks, Habits, Areas, Knowledge, Calendar, Vault, Reviews, Identity.
- Added shared components: `Donut`, `Sparkline`, `HabitDots`, `Stat`.

### 2026-06-17 — Session 3 (new backend modules)
- A1 Capture/Dump — `src/features/capture/` + full DumpPage at `/dump`.
- A2 Area scoring — `Area` type extended with server score fields; AreasPage prefers server score.
- B4 Habit stats — `Habit` type extended with inline stats; HabitCard skips per-card logs query.
- B6 Note→Task — `source`/`sourceId` added to `CreateTaskRequest`.
- B7 Vault used — `useMarkVaultUsedMutation` wired to "Pull" button in VaultCard.
- B10 Profile stats — `useGetStatsQuery` wired into IdentityPage.

### 2026-06-17 — Session 4 (A3 + B8 + B9 frontend wiring)
- **A3 Area score snapshots:** Added `AreaScoreSnapshot` type, `useSnapshotAreaScoreMutation` + `useListAreaSnapshotsQuery` to areasApi. AreasPage fires snapshot on mount for every scored area (fire-and-forget).
- **B8 Resource progress:** Extended `Resource` type with `lessonsCompleted/totalLessons/minutesConsumed`. Added `UpdateResourceProgressRequest` + `useUpdateResourceProgressMutation` (`PATCH /resources/:id/progress`). `ResourceRow` now has a collapsible chevron progress drawer.
- **B9 UI settings:** Created `src/features/settings/` (types + settingsApi). `GET/PATCH /settings` with tag `"Settings"`. Added `AppSettingsCard` to IdentityPage (vibe, font, startTab selectors).
- `tsc -b --noEmit` clean after all changes.

---

### 2026-06-17 — Session 5 (immersive polish + toasts + settings wiring)

**Immersive Mode full visual rebuild (`ImmersiveMode.tsx`):**
- Breathing animated rings (inner + outer) around the timer that pulse with area color when a task is linked.
- Ambient radial background shifts to the linked task's area color at low opacity when a session is active.
- Area name + priority chips displayed below the task title during active session.
- Logo badge tints to area/accent color with matching glow shadow.
- Task picker rows have color-matched dot glow on hover.
- Footer shows today's completed session count + keyboard shortcut hints.
- Space bar starts/stops the session; Escape exits to dashboard.

**Toast system (`sonner`):**
- Installed `sonner`; `<Toaster>` mounted in `main.tsx` with dark theme matching LifeOS tokens.
- Toasts wired to: task complete (TaskRow + Dashboard hero), habit log (with streak count), focus start/stop (with elapsed time on stop), vault pull, capture create, capture convert (success + error).

**Settings wiring (carried from Session 4 fixes):**
- `useApplySettings` hook (`src/features/settings/useApplySettings.ts`) applies `font` preference to `document.body`; called from `SessionLoader`.
- `AppSettingsCard` `useState` bug fixed — `useEffect` syncs form fields when server settings load.
- Topbar vibe selector reads/writes backend `UserSettings.vibe`; options aligned to backend enum.
- `DashboardPage` reads `startTab` on mount and navigates once per session to `areas` or `dump`.
- Task recurring WEEKLY/MONTHLY/YEARLY show hint text explaining recurrence semantics.

*End of PROJECT_CONTEXT.md — update the Session Log before closing each session.*

---

### 2026-06-21 — Session 6 (area drill-in + command palette + accent sync)

**Area Detail Page (`/areas/:areaId`):**
- Created `src/features/areas/pages/AreaDetailPage.tsx` — full drill-in page per area.
- Shows header with icon badge, score ring (Donut), area type + active status, 4-stat row (tasks, habits, goals, focus time), streak badge, ambient radial glow.
- Score history sparkline using `useListAreaSnapshotsQuery` (only shown when ≥ 2 snapshots exist).
- Paneled 2-column grid: Tasks (open/all filter toggle, inline complete with toast), Habits (streak + 7-day count), Goals (status badge), Projects.
- Quick-action bar: Start Focus, Add Task (→ /tasks), Schedule (→ /calendar).
- `AreaCard` converted from `<div>` to `<Link to="/areas/:id">` with `hover:border-line-2` transition. Delete button adds `e.preventDefault()` to avoid navigation on delete.
- Dashboard area donut cards also updated from `/areas` → `/areas/:id`.
- Route `/areas/:areaId` registered in `App.tsx`.

**Command Palette visual polish:**
- Grouped commands: Actions / Navigate (with group headers shown when not searching).
- Accent-colored active state (`background: var(--acc)`, `color: var(--acc-ink)`).
- Icon rendered in a rounded square badge (tinted on active).
- Search icon in input bar; `kbd` tags for keyboard hints (ESC, ↑↓, ↵).
- Heavier backdrop blur + `rounded-2xl` panel + deep `box-shadow`.
- Added Capture Inbox (`/dump`) to Navigate group.

**`UserSettings.accent` ↔ TweaksPanel sync (complete closure):**
- `useApplySettings`: when server accent hex loads, writes it to `localStorage` so TweaksPanel reads the correct initial value.
- `TweaksPanel`: `resolveAccentId()` handles both stored accent id strings AND raw hex strings (from server sync).
- `TweaksPanel.choose()`: fires `updateSettings({ accent: hex })` (fire-and-forget) so every local pick is persisted to the server.
- Footer copy updated: "Synced to your account & this browser."

