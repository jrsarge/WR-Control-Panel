# User Stories
## GWR FastTrack — World Record Execution App

---

## Epic 1: Route Navigation

### US-01 — See the current stop
**As a runner**, I want to see the current restaurant's name, address, and distance at a glance so that I never have to think about where I'm going.

**Acceptance Criteria:**
- Restaurant name displayed in large (24px+) font, no truncation
- Full address (street, city) shown below name
- Distance from previous stop shown (e.g., "0.3 mi")
- Estimated run time shown (e.g., "~3 min at pace")
- Planned ETA shown (e.g., "Planned: 10:43 AM")
- Stop number shown (e.g., "Stop 43 / 171")
- If stop is GWR borderline, a visible amber ⚠️ warning badge is shown

---

### US-02 — Preview upcoming stops
**As a runner**, I want to see the next 2 stops below the current one so that I can mentally prepare and spot if I'm heading in the wrong direction.

**Acceptance Criteria:**
- Next 2 stops shown in a condensed list below the main stop card
- Each shows: stop number, restaurant name, distance from current stop
- Tapping a preview stop does NOT navigate to it (prevents accidental skips)

---

### US-03 — Open turn-by-turn navigation
**As a runner**, I want to tap a single button to open navigation to the current stop so that I don't waste time copying addresses.

**Acceptance Criteria:**
- "Navigate →" button visible on the current stop card
- On iOS, opens Apple Maps; on Android, opens Google Maps (detected via user agent)
- Destination set using GPS coordinates (not just address string) for accuracy
- Button remains accessible even if the app is in offline mode

---

### US-04 — Know my GWR pace at all times
**As a runner**, I want a persistent pace indicator at the top of the screen so that I always know if I'm on track to break the record.

**Acceptance Criteria:**
- Displays: stops completed, time elapsed (live counter), time remaining
- Pace status shows one of: 🟢 AHEAD / 🟡 ON PACE / 🔴 BEHIND
- Pace status calculated as: (actual stops per hour) vs. (planned stops per hour at current point in route)
- Projected final count shown (e.g., "On pace for ~174 stops")
- Once stop #151 is checked in, shows "🏆 Record Broken!" banner
- Header is sticky — always visible while scrolling

---

## Epic 2: Check-In & Evidence

### US-05 — Check in with one tap
**As a runner**, I want to check in to a restaurant with a single large tap so that I lose as little time as possible at each stop.

**Acceptance Criteria:**
- Check-in button is the largest interactive element on screen (minimum 80px height)
- Button text: "✓ Checked In" (clear, no ambiguity)
- On tap: records timestamp, GPS coordinates, stop number, restaurant name
- Check-in saved to localStorage within 100ms of tap
- App advances to next stop within 300ms of tap
- Confirmation animation plays (brief green flash or checkmark)
- Double-tap protection: second tap within 2 seconds ignored

---

### US-06 — Undo an accidental check-in
**As a runner**, I want to undo a check-in within 10 seconds in case I tap by mistake so that the evidence log stays accurate.

**Acceptance Criteria:**
- After check-in, an "Undo" toast notification appears for 10 seconds
- Tapping "Undo" reverses the check-in: removes from log, returns to previous stop
- After 10 seconds the toast dismisses and undo is no longer available
- Undo action is also logged in evidence (with note "check-in reversed")

---

### US-07 — Check-ins survive loss of signal
**As a runner**, I want my check-ins to be saved even if I lose mobile signal so that I don't lose evidence during the attempt.

**Acceptance Criteria:**
- All check-ins written to localStorage immediately (no network required)
- A sync status badge shows: "✓ All synced" or "⏳ 3 pending sync"
- When network returns, pending check-ins sync to Firebase automatically
- No manual action required by the runner to trigger sync

---

### US-08 — Keep screen awake during attempt
**As a runner**, I want the screen to stay on throughout the attempt so that I don't have to unlock my phone every time I arrive at a stop.

**Acceptance Criteria:**
- App requests Wake Lock when session starts
- If Wake Lock is unavailable (e.g., browser doesn't support it), a notice is shown during setup
- Wake Lock released automatically when session ends or app is backgrounded

---

## Epic 3: Session Management

### US-09 — Start a new attempt session
**As a runner**, I want to set up my attempt once at the start so that the app knows my team name and start time for the evidence log.

**Acceptance Criteria:**
- On first load, a setup screen asks for:
  - Runner / team name (text input, required)
  - Attempt date (date picker, defaults to today)
  - Confirmed start time (defaults to 6:00 AM, editable)
- "Start Attempt" button begins the 24-hour countdown
- Confirmation dialog: "Starting the 24-hour window. Are you ready?"
- After starting, setup fields are locked (no accidental edits mid-run)
- Session data saved to localStorage and Firebase

---

### US-10 — See total progress at a glance
**As a runner**, I want to see a simple summary of how the attempt is going without having to dig into menus so that I stay motivated and informed.

**Acceptance Criteria:**
- Persistent header shows: stops done / total, time elapsed, pace status
- Progress bar (visual) shows % of stops complete
- Color of progress bar changes: green (>151 stops done), yellow (on track), red (behind)

---

## Epic 4: Crew Dashboard

### US-11 — Monitor the runner's progress in real time
**As a support crew member**, I want to see every check-in appear on my screen the moment it happens so that I can track progress without calling the runner.

**Acceptance Criteria:**
- Crew URL (`/crew` or `/crew?session=XYZ`) updates in real time via Firebase listener
- New check-ins appear in the log within 2 seconds of the runner tapping check-in
- No page refresh needed
- Page shows: stops completed, current stop, time elapsed, pace status

---

### US-12 — See the full route map on the crew screen
**As a support crew member**, I want to see a map with all stops color-coded by status so that I can quickly see which areas have been covered.

**Acceptance Criteria:**
- Interactive map (pan/zoom) centered on SLC metro
- All 171 stops plotted as markers
- Marker colors: green = visited, blue = current stop, grey = upcoming
- Route polyline drawn through all stops in order
- Clicking a marker shows stop details (name, address, planned ETA, actual check-in time if visited)
- Map auto-pans to keep the current stop visible

---

### US-13 — See a pace projection on the crew screen
**As a support crew member**, I want to see a projected final stop count so that I can advise the runner whether to push harder or that the record is safe.

**Acceptance Criteria:**
- Displays: "At current pace, projected to finish with ~174 stops"
- Shows: stops per hour (actual vs. planned)
- Shows: minutes ahead of / behind planned schedule
- Updates in real time with each new check-in
- Record broken indicator: banner when stop 151 is logged

---

## Epic 5: Evidence Export

### US-14 — Export a GWR evidence log
**As a runner (post-attempt)**, I want to export a complete timestamped log of all check-ins so that I can submit it to Guinness World Records.

**Acceptance Criteria:**
- Export button available in settings/menu drawer
- Generates a CSV file with columns:
  - Stop #, Restaurant Name, Address, City, State, ZIP
  - Planned ETA, Actual Check-In Time (local), Actual Check-In Time (UTC)
  - GPS Lat at Check-In, GPS Lon at Check-In
  - Delta vs. Plan (minutes ahead/behind)
  - GWR Borderline Flag (Y/N)
  - Notes (if any)
- File named: `GWR_Evidence_YYYY-MM-DD_[TeamName].csv`
- Works offline (generated from localStorage data)
- Also available as download from crew dashboard

---

## Epic 6: Skip / Deviation Handling

### US-15 — Skip a stop that's closed or inaccessible
**As a runner**, I want to skip a stop without breaking the app's flow so that I can keep moving even if a restaurant is closed.

**Acceptance Criteria:**
- Small "Skip →" button visible below the check-in button (less prominent)
- Tapping shows a brief confirmation: "Skip [Restaurant Name]?" with Yes/No
- On confirm: logs a skip event with timestamp and advances to next stop
- Skipped stops shown in evidence log with status "SKIPPED"
- Skipped stops count shows in crew dashboard
- GWR borderline skips noted separately (crew may flag for review)

---

## Non-Functional User Stories

### US-16 — Fast load time
**As a runner**, I want the app to load in under 2 seconds so that I'm not waiting on a loading screen at the start of the attempt.

### US-17 — Usable in sunlight
**As a runner**, I want the app to be readable in direct sunlight so that I can use it during the daytime portion of the route.
- High contrast design, minimum 4.5:1 contrast ratio
- Dark/light mode toggle available

### US-18 — Install to home screen
**As a runner**, I want to install the app on my home screen like a native app so that I can launch it with one tap and it runs full-screen.
- App is a PWA with manifest and service worker
- Install prompt shown on first visit
- Runs in standalone mode (no browser chrome)