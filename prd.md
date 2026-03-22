# Product Requirements Document
## GWR FastTrack — World Record Execution App

**Version:** 1.0
**Date:** 2026-03-22
**Status:** Ready for development

---

## 1. Overview

### Problem Statement
A team is attempting the Guinness World Record for **Most Fast Food Restaurants Visited in 24 Hours** in the Salt Lake City metro area. The planned route visits **171 restaurants** across ~59 miles, starting at 6:00 AM and finishing by ~5:00 AM the following day.

On the day, the runner needs a mobile-first app to:
- Know exactly where to go next with one glance
- Log each check-in with a single tap (creating GWR evidence)
- See whether they're ahead of or behind record pace
- Open turn-by-turn navigation instantly

A support crew needs a live dashboard to:
- Monitor progress in real time from a separate screen
- See the full route map with visited/upcoming stops
- Track projected final count and pace

### Success Criteria
- Runner completes 151+ restaurants in 24 hours
- Every check-in has a logged timestamp for GWR evidence
- App works reliably on a phone with occasional signal loss
- Zero data loss — all check-ins persist locally and sync when online

---

## 2. Users

### Primary User: The Runner
- Uses the app **on a phone while running/moving**
- Needs a glanceable interface — no reading, no confusion
- Will be fatigued and time-pressured; every extra tap costs time
- Needs one-handed operation

### Secondary User: The Support Crew
- Views a **live dashboard on a laptop or tablet** (separate URL)
- Monitors pace and flags issues to the runner via radio/phone
- Does not interact with check-ins directly

---

## 3. Features

### P0 — Must Have at Launch

#### F1: Route Display
- Load the 171-stop route from the embedded route data (see `TECHNICAL_CONTEXT.md`)
- Display the **current stop** (large, center screen) with:
  - Stop number (e.g., "Stop 43 of 171")
  - Restaurant name (large font)
  - Address and city
  - Planned ETA and hours
  - Distance and estimated run time from previous stop
  - GWR borderline flag (if applicable)
- Display the **next 2 stops** as a small preview below

#### F2: One-Tap Check-In
- A large, prominent **"✓ Checked In"** button dominates the bottom of the screen
- On tap:
  - Record timestamp (UTC + local)
  - Record GPS coordinates at time of check-in
  - Mark stop as complete
  - Advance to next stop automatically
  - Save to local storage immediately (offline-safe)
  - Sync to server when online
- Visual confirmation animation on tap (no accidental double-taps)
- Allow **undo** within 10 seconds of check-in

#### F3: Navigation Button
- A **"Navigate →"** button opens the phone's default maps app (Google Maps on Android, Apple Maps on iOS) with the current stop's address pre-loaded as the destination
- Uses the restaurant's coordinates for precision, falls back to address string

#### F4: Live Pace Tracker
Displayed persistently at the top of the runner screen:
- **Stops completed** / 171 total
- **Time elapsed** (HH:MM:SS running clock from start)
- **Time remaining** in 24-hour window
- **Pace indicator**: one of three states:
  - 🟢 AHEAD — completing stops faster than planned
  - 🟡 ON PACE — within 5% of planned schedule
  - 🔴 BEHIND — more than 5% behind planned schedule
- **Projected final count**: estimated total stops at current pace
- **Record status**: "Record broken" once stop 151 is checked in

#### F5: Offline Persistence
- All check-ins written to `localStorage` immediately on tap
- When network is available, sync unsynced check-ins to the server
- App loads and functions fully without internet (route data embedded at build time)
- Sync status indicator (e.g., "3 check-ins pending sync")

### P1 — High Priority (Sprint 2)

#### F6: Crew Live Dashboard (separate URL `/crew`)
- Read-only view, updates in real time as the runner checks in
- Full interactive map (Leaflet or Mapbox) showing:
  - All 171 stops color-coded: ✅ visited (green), 🔵 current (blue), ⚪ upcoming (grey)
  - Runner's last known GPS position
  - Route polyline
- Sidebar with:
  - Live pace stats (same as runner view)
  - Scrollable log of completed stops with timestamps
  - Projected finish count
- Auto-refreshes without any manual action

#### F7: Session Start Flow
- On first launch, prompt for:
  - Attempt date (defaults to today)
  - Team name / runner name (for evidence log header)
  - Confirmation of 6:00 AM start time (editable)
- Once started, the 24-hour countdown begins and cannot be reset without a confirmation dialog

### P2 — Nice to Have (Sprint 3)

#### F8: GWR Evidence Export
- Export a complete check-in log as **CSV** containing:
  - Stop number, restaurant name, address, city, state, ZIP
  - Planned ETA, actual check-in time
  - GPS lat/lon at check-in
  - Time delta vs. plan (ahead/behind in minutes)
- Export button available in a settings/menu drawer
- File named `GWR_Evidence_[Date]_[TeamName].csv`

#### F9: Skip Stop
- A small **"Skip →"** button (less prominent than check-in) to bypass a stop
- Logs the skip with timestamp and optional reason (closed, missed, detour)
- Skipped stops shown differently on crew map (grey X)
- Does NOT affect record count — only visited stops count

#### F10: Manual Add Stop
- In settings drawer: add an unplanned restaurant
- Enter name and address; geocoded to coordinates
- Inserted into route at current position
- Logged as an "unplanned" stop in evidence export

---

## 4. Non-Functional Requirements

### Performance
- App must load in under 2 seconds on a 4G connection
- Check-in tap-to-confirmation must be under 200ms (feels instant)
- Route data embedded at build time — no API call needed to display the route

### Reliability
- Check-ins must never be lost — local-first, sync-second architecture
- App must function for the full 24-hour session without requiring a page reload

### Mobile UX
- Designed for a 390px wide screen (iPhone 14 / Pixel 7 size)
- All interactive elements at least 48×48px (thumb-friendly)
- High contrast — readable in full sunlight
- Dark mode support (runner may use at 2–3 AM)
- Prevent screen from sleeping during active session (Wake Lock API)

### Security
- No authentication required for the runner app (single-session)
- Crew dashboard: read-only, no write access
- No PII stored beyond team name and check-in log

---

## 5. Technical Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React + Vite | Fast dev, excellent PWA support, wide ecosystem |
| Styling | Tailwind CSS | Rapid mobile-first UI, no design system needed |
| Maps | Leaflet (react-leaflet) | Free, no API key, works offline with tile caching |
| Real-time sync | Firebase Firestore | Free tier, real-time listeners, offline SDK built-in |
| Hosting | Vercel | Free, instant deploys, edge CDN |
| PWA | vite-plugin-pwa | Install to home screen, offline support, app-like feel |

---

## 6. Data

The route is pre-computed (171 stops) and embedded as a static JSON file at build time. See `TECHNICAL_CONTEXT.md` for the full schema.

Check-in records written to:
1. `localStorage` key `gwr_checkins` (immediate, offline-safe)
2. Firebase Firestore collection `sessions/{sessionId}/checkins` (synced when online)

Session config written to:
- `localStorage` key `gwr_session`
- Firestore document `sessions/{sessionId}`

---

## 7. Out of Scope (v1)

- Multi-runner split routing (one runner per instance)
- Automated GWR witness notification
- In-app video/photo evidence capture
- Route re-optimization on the fly (fixed route only)
- Historical attempt comparison

---

## 8. Open Questions for Development

1. Should the app display a warning if check-in GPS is more than 500m from the restaurant's listed coordinates (possible wrong check-in)?
2. What happens if the runner starts later than 6:00 AM? Should the pace calculator adjust to the actual start time?
3. Should the crew dashboard be password-protected, or is a private URL sufficient?