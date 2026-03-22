# Sprint Plan
## GWR FastTrack — World Record Execution App

**Total Sprints:** 3
**Recommended Sprint Length:** 2 days each
**Stack:** React + Vite + Tailwind CSS + Firebase + Vercel

---

## Pre-Sprint: Project Setup (Day 0, ~2 hours)

These tasks must be done before Sprint 1 begins.

| Task | Notes |
|---|---|
| `create-app` | `npm create vite@latest gwr-fasttrack -- --template react` |
| `install-deps` | `npm install tailwindcss firebase react-leaflet leaflet vite-plugin-pwa` |
| `setup-firebase` | Create Firebase project, enable Firestore + Hosting (use free Spark plan) |
| `setup-vercel` | Connect GitHub repo to Vercel, enable auto-deploys on `main` |
| `embed-route-data` | Copy `enriched_route_v2.json` into `src/data/route.json` (171 stops, see `TECHNICAL_CONTEXT.md`) |
| `configure-pwa` | Add PWA manifest (name: "GWR FastTrack", icon, start_url, display: standalone) |
| `setup-tailwind` | Init Tailwind, add dark mode support (`darkMode: 'class'`) |

---

## Sprint 1 — Runner Core (Days 1–2)

**Goal:** A fully functional runner app. By end of Sprint 1, a runner can load the app, see the route, check in to stops, navigate, and track pace — entirely offline if needed.

**User Stories Covered:** US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-08, US-09, US-10

---

### Ticket S1-01: Route data layer
**Story:** US-01, US-02
**Estimate:** 2 hours

- Create `src/data/route.json` from `enriched_route_v2.json`
- Create `useRoute` hook: loads route, exposes `stops[]`, `currentStopIndex`, `advance()`
- Create `useSession` hook: manages session state (start time, team name, started flag)
- Write unit tests for pace calculation helpers

**Done when:** `useRoute` returns correct stop data and `currentStopIndex` advances correctly.

---

### Ticket S1-02: Session setup screen
**Story:** US-09
**Estimate:** 2 hours

- Full-screen setup form shown on first launch (if no session in localStorage)
- Fields: Team/runner name (required), attempt date, start time (default 06:00)
- "Start Attempt" button → confirmation dialog → saves session to localStorage → starts clock
- Session locked once started

**Done when:** Setup completes, session persisted, can't be accidentally reset.

---

### Ticket S1-03: Current stop card
**Story:** US-01, US-02
**Estimate:** 3 hours

- `<CurrentStopCard>` component:
  - Restaurant name (text-2xl font-bold)
  - Address + city
  - "Stop X of 171" badge
  - Planned ETA
  - Leg distance + estimated run time
  - GWR borderline ⚠️ badge (conditional)
- `<UpcomingStops>` component: next 2 stops in condensed list
- Mobile layout: card fills screen, upcoming stops below fold

**Done when:** Correct stop data renders on screen, GWR flag shows for borderline stops.

---

### Ticket S1-04: Navigation button
**Story:** US-03
**Estimate:** 1 hour

- "Navigate →" button on stop card
- Detects platform: iOS (`/iPhone|iPad/.test(navigator.userAgent)`) → Apple Maps URL, else → Google Maps URL
- URL format: `maps://maps.apple.com/?daddr={lat},{lon}` / `https://maps.google.com/maps?daddr={lat},{lon}`
- Opens in new tab (doesn't kill app)
- Visible and tappable even when offline

**Done when:** Tap opens correct maps app with restaurant pre-loaded as destination.

---

### Ticket S1-05: Check-in button + logic
**Story:** US-05, US-06, US-07
**Estimate:** 4 hours

- `<CheckInButton>` component: large button (min-h-20), green, "✓ Checked In"
- On tap:
  1. Request GPS coordinates (navigator.geolocation, non-blocking — proceed even if denied)
  2. Build check-in record: `{ stopNumber, name, address, lat, lon, checkinTime, gpsLat, gpsLon, planned_eta_min }`
  3. Append to `localStorage['gwr_checkins']` (JSON array)
  4. Mark stop complete in `useRoute` state
  5. Advance to next stop
  6. Show green flash animation (150ms)
  7. Show "Undo" toast for 10 seconds
- Double-tap protection: debounce 2000ms
- Undo: removes last record from localStorage, reverses route index

**Done when:** Check-in records appear in localStorage, undo works within 10s, double-tap ignored.

---

### Ticket S1-06: Pace tracker header
**Story:** US-04, US-10
**Estimate:** 3 hours

- Sticky `<PaceHeader>` component at top of runner screen
- Displays: stops done / 171, elapsed time (live HH:MM:SS), time remaining
- Pace calculation:
  - `plannedStopsAtThisPoint`: find how many stops were planned to be done by `elapsedMinutes` using `arrival_min` from route data
  - `paceRatio = actualStops / plannedStopsAtThisPoint`
  - AHEAD if ratio > 1.05, BEHIND if < 0.95, ON PACE otherwise
- Projected final: `(actualStops / elapsedMinutes) * 1440`
- Progress bar below header (width = actualStops / 171 * 100%)
- "🏆 Record Broken!" banner when stop 151 checked in
- Color: green/yellow/red based on pace state

**Done when:** Header updates every second, pace state changes correctly as stops are added.

---

### Ticket S1-07: Offline persistence + sync status
**Story:** US-07
**Estimate:** 2 hours

- All check-in reads/writes go through a `useCheckIns` hook
- Hook wraps localStorage for immediate writes
- Exposes `pendingSync` count (check-ins not yet sent to Firebase)
- Sync status badge shown in header: "✓ Synced" or "⏳ 3 pending"
- Firebase sync implemented as a no-op stub in Sprint 1 (wired up in Sprint 2)

**Done when:** Check-ins persist through page refresh, sync badge shows pending count.

---

### Ticket S1-08: Wake Lock
**Story:** US-08
**Estimate:** 1 hour

- Request `navigator.wakeLock.request('screen')` when session starts
- Re-acquire on `visibilitychange` (iOS/Android release lock when app backgrounds)
- Catch and handle `NotSupportedError` gracefully with a notice on setup screen
- Release lock when session ends

**Done when:** Screen stays on during active session on iPhone + Android Chrome.

---

### Ticket S1-09: Dark mode + sunlight contrast
**Story:** US-17
**Estimate:** 1 hour

- Dark mode toggle in header (sun/moon icon)
- Persisted to localStorage
- Color palette: high contrast in both modes (white/black, no greys for critical text)
- Test in Tailwind `dark:` variant

**Done when:** Toggle works, both modes are readable.

---

### Sprint 1 Demo Checklist
- [ ] Can set up a session (name, date, start time)
- [ ] Current stop displays with all fields
- [ ] Navigate button opens maps app correctly on iOS and Android
- [ ] Check-in button advances to next stop and logs to localStorage
- [ ] Undo works within 10 seconds
- [ ] Pace header updates live and changes color correctly
- [ ] Screen stays on
- [ ] App works completely offline (route data embedded, no network needed)

---

## Sprint 2 — Real-Time Sync + Crew Dashboard (Days 3–4)

**Goal:** Check-ins sync to Firebase in real time. Crew dashboard is live and shows the full map.

**User Stories Covered:** US-11, US-12, US-13, US-15, US-16, US-18

---

### Ticket S2-01: Firebase Firestore integration
**Estimate:** 3 hours

- Configure Firebase SDK with env vars (`VITE_FIREBASE_*`)
- Data model:
  ```
  sessions/{sessionId}
    - teamName, startTime, attemptDate, createdAt
    checkins/{checkinId}
      - stopNumber, name, address, lat, lon
      - checkinTime, gpsLat, gpsLon, plannedEtaMin
      - delta (minutes ahead/behind plan), synced: true
  ```
- Update `useCheckIns` hook: after writing to localStorage, write to Firestore
- On app load: reconcile localStorage with Firestore (in case of session continuity)
- Handle write failures silently — localStorage is source of truth

**Done when:** Check-ins appear in Firestore console within 2 seconds of tap.

---

### Ticket S2-02: Session ID + crew share link
**Estimate:** 1 hour

- Generate a `sessionId` (nanoid, 8 chars) at session start
- Store in localStorage and Firestore
- Crew URL format: `/crew?session={sessionId}`
- On runner setup screen, show a "Share with crew" section with the crew URL + QR code

**Done when:** QR code scans to correct crew URL, session ID consistent across devices.

---

### Ticket S2-03: Crew route map
**Story:** US-12
**Estimate:** 4 hours

- `/crew` route rendered by `<CrewDashboard>` component
- Reads sessionId from URL query param, subscribes to Firestore real-time listener
- `<RouteMap>` using react-leaflet + OpenStreetMap tiles:
  - Route polyline (blue, weight 2)
  - Stop markers: green (visited), blue pulsing (current), grey (upcoming)
  - Marker popup: stop name, address, planned ETA, actual check-in time (if visited)
  - Auto-pan to current stop on each new check-in
- Map fills left 2/3 of crew screen (desktop layout)

**Done when:** Map shows all 171 stops, visited stops turn green in real time.

---

### Ticket S2-04: Crew stats sidebar
**Story:** US-11, US-13
**Estimate:** 3 hours

- Right 1/3 panel on crew screen:
  - Large: stops completed / 171
  - Live elapsed timer + time remaining
  - Pace status (🟢/🟡/🔴) + projected final count
  - "🏆 Record Broken!" banner when stop 151 logged
  - Scrollable check-in log (most recent first): timestamp, stop number, restaurant name
- Updates via Firestore `onSnapshot` listener — no polling

**Done when:** New check-in appears on crew screen within 2 seconds, pace updates correctly.

---

### Ticket S2-05: Skip stop
**Story:** US-15
**Estimate:** 2 hours

- Small "Skip →" text button below check-in button
- Tap → modal: "Skip [Restaurant Name]?" with Yes / Cancel
- On confirm: logs skip record to localStorage + Firestore, advances route
- Skipped stops shown as grey X on crew map
- Skip count shown in crew sidebar

**Done when:** Skips log correctly and do not inflate the check-in count.

---

### Ticket S2-06: PWA install + service worker
**Story:** US-18
**Estimate:** 2 hours

- Configure `vite-plugin-pwa` with:
  - App name: "GWR FastTrack"
  - Short name: "FastTrack"
  - Icons: 192×192 and 512×512 (generate from a simple logo)
  - `display: standalone`
  - `start_url: /`
  - Cache strategy: pre-cache all static assets + route data
- Install prompt: show "Add to Home Screen" banner on first visit if not installed
- Offline fallback page for crew dashboard (runner app works fully offline)

**Done when:** App installs to iOS and Android home screen, loads without internet.

---

### Sprint 2 Demo Checklist
- [ ] Check-in on phone appears on crew dashboard within 2 seconds
- [ ] Crew map shows all 171 stops, visited ones turn green live
- [ ] Crew stats update in real time
- [ ] QR code on runner setup links to correct crew URL
- [ ] Skip logs correctly and doesn't count toward record
- [ ] App installable on phone (PWA)
- [ ] Deployed to Vercel at a real URL

---

## Sprint 3 — Evidence Export + Polish (Days 5–6)

**Goal:** App is production-ready. Evidence export works. UI polished for day-of use.

**User Stories Covered:** US-14, US-16, US-17, edge cases, stress testing

---

### Ticket S3-01: GWR evidence CSV export
**Story:** US-14
**Estimate:** 3 hours

- Settings drawer (hamburger menu in header)
- "Export Evidence Log" button
- Generates CSV from localStorage check-in array:
  ```
  Stop#,Name,Address,City,State,ZIP,PlannedETA,ActualCheckin_Local,
  ActualCheckin_UTC,GPS_Lat,GPS_Lon,DeltaMinutes,GWR_Borderline,Notes
  ```
- Triggers file download: `GWR_Evidence_2026-03-28_[TeamName].csv`
- Works offline (no server needed)
- Also available from crew dashboard as a download button

**Done when:** CSV downloads correctly with all check-in data, opens cleanly in Excel/Sheets.

---

### Ticket S3-02: Pre-attempt checklist screen
**Estimate:** 2 hours

- One-time checklist shown between setup and "Start Attempt":
  - [ ] Phone fully charged
  - [ ] Wake Lock confirmed working
  - [ ] Navigation tested (tap "Navigate" on stop #1)
  - [ ] Crew dashboard open on coordinator device
  - [ ] GWR witnesses present and briefed
  - [ ] GPS permissions granted
- All items must be checked to enable "Start Attempt"
- Can be bypassed with a "Skip checklist" link (for testing)

**Done when:** Checklist blocks start until all items checked.

---

### Ticket S3-03: Route progress mini-map on runner screen
**Estimate:** 2 hours

- Small (150px) embedded Leaflet map on the runner screen below upcoming stops
- Shows only: current stop (blue dot), next stop (grey dot), and the leg between them
- Not interactive (no zoom/pan on runner screen — would be a distraction)
- Updates when stop advances

**Done when:** Mini-map shows correct current and next positions.

---

### Ticket S3-04: Load time optimization
**Story:** US-16
**Estimate:** 2 hours

- Code-split crew dashboard (lazy load `/crew` route)
- Verify route data (JSON) is pre-bundled, not fetched at runtime
- Lighthouse audit: target 90+ Performance score on mobile
- Add `loading="lazy"` to Leaflet tiles

**Done when:** Lighthouse mobile Performance ≥ 90, first load < 2s on 4G.

---

### Ticket S3-05: End-of-attempt summary screen
**Estimate:** 2 hours

- Shown automatically when 24-hour window expires OR runner taps "End Attempt"
- Displays:
  - Total stops completed
  - Record status: ✅ Broken (151+) or ❌ Not broken
  - Total distance covered
  - Total time
  - Average pace (stops per hour)
  - Full check-in log scroll
- "Download Evidence CSV" button prominent
- Confetti animation if record broken 🎉

**Done when:** Summary appears correctly, CSV export works from summary screen.

---

### Ticket S3-06: Stress test + day-of simulation
**Estimate:** 3 hours

- Simulate 171 check-ins in sequence (script that auto-taps every 8 minutes)
- Verify: no memory leaks, no slowdown after 100+ check-ins
- Test offline → online sync (enable airplane mode, check in, re-enable, verify sync)
- Test on real iOS Safari and Android Chrome
- Fix any issues found

**Done when:** Full 171-stop simulation completes without errors or slowdowns.

---

### Sprint 3 Demo Checklist
- [ ] CSV evidence export downloads with correct data
- [ ] Pre-attempt checklist works
- [ ] End-of-attempt summary shows correctly with confetti
- [ ] Stress test: 171 simulated check-ins, no errors
- [ ] Offline → online sync verified on real device
- [ ] Lighthouse mobile Performance ≥ 90
- [ ] App tested on iOS Safari + Android Chrome

---

## Deployment Checklist (Before Attempt Day)

- [ ] Production Firebase project (not dev project) with Firestore rules set
- [ ] Vercel production deployment live at `gwr-fasttrack.vercel.app` (or custom domain)
- [ ] Route data for the actual attempt date loaded (verify `enriched_route_v2.json` is current)
- [ ] Crew URL shared with all support crew members
- [ ] Test run: complete 5 stops end-to-end on real devices
- [ ] Evidence export tested and verified to open in Excel
- [ ] Phone battery + charging plan confirmed

---

## Appendix: File Structure (suggested)

```
gwr-fasttrack/
├── public/
│   ├── icons/          # PWA icons
│   └── manifest.json
├── src/
│   ├── data/
│   │   └── route.json  # 171-stop route (from enriched_route_v2.json)
│   ├── hooks/
│   │   ├── useRoute.js
│   │   ├── useSession.js
│   │   ├── useCheckIns.js
│   │   └── usePace.js
│   ├── components/
│   │   ├── PaceHeader.jsx
│   │   ├── CurrentStopCard.jsx
│   │   ├── UpcomingStops.jsx
│   │   ├── CheckInButton.jsx
│   │   ├── RouteMap.jsx
│   │   └── CrewSidebar.jsx
│   ├── pages/
│   │   ├── Setup.jsx
│   │   ├── Runner.jsx
│   │   └── Crew.jsx
│   ├── lib/
│   │   ├── firebase.js
│   │   ├── pace.js       # Pace calculation helpers
│   │   └── export.js     # CSV generation
│   ├── App.jsx
│   └── main.jsx
├── .env.local            # Firebase keys (never commit)
├── vite.config.js
└── tailwind.config.js
```