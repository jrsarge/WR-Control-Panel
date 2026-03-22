# Technical Context
## GWR FastTrack — Data Schemas & Route Reference

This document gives Claude Code everything it needs to understand the pre-computed route data and connect it to the app's data layer.

---

## 1. Route Data File

**Source file:** `enriched_route_v2.json`
**Location in app:** `src/data/route.json`
**Total stops:** 171
**Format:** JSON array of stop objects

### Stop Object Schema

```typescript
interface Stop {
  stop_number: number;        // 1–171, sequential
  name: string;               // Restaurant name, e.g. "McDonald's"
  address: string;            // Street address, e.g. "9400 S State St"
  city: string;               // e.g. "Sandy"
  state: string;              // Always "UT"
  zip: string;                // e.g. "84070"
  lat: number;                // GPS latitude, e.g. 40.5662
  lon: number;                // GPS longitude, e.g. -111.8924
  category: string;           // OSM category: "fast_food" | "cafe" | "ice_cream" | "bakery" etc.
  hours_display: string;      // Human-readable, e.g. "10:00 AM – 10:00 PM"
  open_min: number;           // Opening time in minutes from midnight, e.g. 600 = 10:00 AM
  close_min: number;          // Closing time in minutes from midnight, e.g. 1320 = 10:00 PM
                              // Note: 24/7 restaurants have close_min = 1800 (6 AM next day)
  eta_12: string;             // Planned arrival in 12h format, e.g. "10:43 AM"
  eta_24ext: string;          // Planned arrival in extended 24h, e.g. "22:43" or "25:15" for 1:15 AM
  arrival_min: number;        // Planned arrival in minutes from midnight, e.g. 643 = 10:43 AM
                              // Post-midnight stops have arrival_min > 1440
  waited_min: number;         // Planned wait time before entering (always 0 in v4 — no waiting)
  leg_distance_miles: number; // Distance from previous stop, e.g. 0.24
  leg_time_min: number;       // Estimated travel time from previous stop at 9 min/mile, e.g. 2.2
  transport_to_next: string;  // "Walk" | "Run/Drive" | "Drive" | "Drive (consider TRAX)"
  gwr_flag: boolean;          // true = GWR borderline, needs pre-approval
  is_post_midnight: boolean;  // true = planned arrival after midnight (24/7 stops)
  density: number;            // Restaurant density within 0.35 miles (higher = denser cluster)
}
```

### Example Stop (stop #1)

```json
{
  "stop_number": 1,
  "name": "Chick-fil-A",
  "address": "4640 S Redwood Rd",
  "city": "Taylorsville",
  "state": "UT",
  "zip": "84123",
  "lat": 40.6510,
  "lon": -111.9393,
  "category": "fast_food",
  "hours_display": "6:00 AM – 10:00 PM",
  "open_min": 360,
  "close_min": 1320,
  "eta_12": "6:00 AM",
  "eta_24ext": "06:00",
  "arrival_min": 360,
  "waited_min": 0,
  "leg_distance_miles": 0.0,
  "leg_time_min": 0.0,
  "transport_to_next": "Run/Drive",
  "gwr_flag": false,
  "is_post_midnight": false,
  "density": 13
}
```

---

## 2. Time Conventions

All times in the route data use **minutes from midnight** on the day of the attempt.

| `arrival_min` value | Human time | Notes |
|---|---|---|
| 360 | 6:00 AM | Attempt start |
| 720 | 12:00 PM (noon) | |
| 1080 | 6:00 PM | |
| 1320 | 10:00 PM | |
| 1440 | 12:00 AM (midnight) | |
| 1500 | 1:00 AM | Post-midnight |
| 1800 | 6:00 AM (next day) | 24h window closes |

**Pace calculation helper:**
```javascript
// Given elapsed minutes since attempt start (6 AM = minute 360),
// how many stops were PLANNED to be done by now?
function plannedStopsAtElapsed(stops, elapsedMinutes) {
  const currentMin = 360 + elapsedMinutes; // 360 = 6 AM in minutes-from-midnight
  return stops.filter(s => s.arrival_min <= currentMin).length;
}
```

---

## 3. Check-In Record Schema (localStorage + Firestore)

```typescript
interface CheckIn {
  id: string;              // nanoid() — unique per check-in
  stopNumber: number;      // Matches stop.stop_number
  name: string;            // Restaurant name
  address: string;
  city: string;
  state: string;
  zip: string;
  plannedEtaMin: number;   // stop.arrival_min (minutes from midnight)
  checkinTime: string;     // ISO 8601, e.g. "2026-03-28T10:43:22.000Z"
  checkinTimeLocal: string;// Local formatted, e.g. "10:43:22 AM"
  checkinMin: number;      // Minutes from midnight at time of check-in
  gpsLat: number | null;   // GPS at check-in (null if permission denied)
  gpsLon: number | null;
  deltaMin: number;        // checkinMin - plannedEtaMin (negative = ahead of plan)
  gwr_flag: boolean;
  synced: boolean;         // true once written to Firestore
  type: 'checkin' | 'skip' | 'undo'; // 'undo' records are logged but excluded from count
  notes?: string;          // Optional, used for skip reason
}
```

**localStorage key:** `gwr_checkins` — serialized JSON array of CheckIn objects
**localStorage key:** `gwr_session` — serialized SessionConfig (see below)

---

## 4. Session Config Schema

```typescript
interface SessionConfig {
  sessionId: string;       // nanoid(8), e.g. "a3kx9mzp"
  teamName: string;        // e.g. "Team GWR SLC"
  attemptDate: string;     // ISO date, e.g. "2026-03-28"
  startTime: string;       // "HH:MM", e.g. "06:00"
  startTimestamp: string;  // ISO 8601 of actual press of "Start Attempt"
  startMin: number;        // Minutes from midnight when started, e.g. 360
}
```

---

## 5. Firebase Firestore Structure

```
/sessions/{sessionId}                    ← document
  - teamName: string
  - attemptDate: string
  - startTime: string
  - startTimestamp: Timestamp
  - startMin: number
  - createdAt: Timestamp

/sessions/{sessionId}/checkins/{id}      ← subcollection
  - (all fields from CheckIn interface above)
  - createdAt: Timestamp (server timestamp)
```

**Firestore security rules (dev — tighten for production):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Runner can write to their session
    match /sessions/{sessionId} {
      allow read, write: if true;  // Tighten: require session token in prod
      match /checkins/{checkinId} {
        allow read, write: if true;
      }
    }
  }
}
```

---

## 6. Pace Calculation Logic

```javascript
// src/lib/pace.js

export function calcPaceStatus(checkins, sessionStartMin, nowMin) {
  const elapsedMin = nowMin - sessionStartMin;
  if (elapsedMin <= 0) return { status: 'ON_PACE', projected: 171 };

  const actualCount = checkins.filter(c => c.type === 'checkin').length;
  const plannedCount = plannedStopsAtElapsed(stops, elapsedMin);

  const ratio = plannedCount > 0 ? actualCount / plannedCount : 1;
  const stopsPerHour = (actualCount / elapsedMin) * 60;
  const remainingMin = (sessionStartMin + 1440) - nowMin;
  const projected = Math.round(actualCount + stopsPerHour * (remainingMin / 60));

  return {
    status: ratio > 1.05 ? 'AHEAD' : ratio < 0.95 ? 'BEHIND' : 'ON_PACE',
    ratio,
    actualCount,
    plannedCount,
    stopsPerHour: Math.round(stopsPerHour * 10) / 10,
    projected,
    deltaMin: actualCount > 0
      ? checkins[checkins.length - 1].deltaMin  // minutes ahead/behind on last stop
      : 0,
  };
}
```

---

## 7. Navigation URL Format

```javascript
// src/lib/navigation.js

export function buildNavigationURL(stop) {
  const { lat, lon, address, city, state } = stop;
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isIOS) {
    // Apple Maps — coordinate-based for precision
    return `maps://maps.apple.com/?daddr=${lat},${lon}&dirflg=w`;
  } else {
    // Google Maps — coordinate-based
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
  }
}
```

---

## 8. CSV Export Format

```javascript
// src/lib/export.js

export function generateCSV(checkins, session) {
  const headers = [
    'Stop#', 'Name', 'Address', 'City', 'State', 'ZIP',
    'Planned_ETA_Local', 'Actual_CheckIn_Local', 'Actual_CheckIn_UTC',
    'GPS_Lat', 'GPS_Lon', 'Delta_Minutes', 'GWR_Borderline', 'Type', 'Notes'
  ];
  // ... map checkins to rows
  // Return CSV string, trigger download via Blob + URL.createObjectURL
}
```

---

## 9. Key Route Facts (for UI copy)

| Fact | Value |
|---|---|
| Total planned stops | 171 |
| Record to beat | 150 |
| Record broken at stop | #151 |
| Attempt start time | 6:00 AM |
| Attempt end time | 6:00 AM next day |
| Total planned distance | 58.6 miles |
| Post-midnight stops (24/7) | 16 stops |
| GWR borderline stops | 22 stops |
| Area | SLC metro (Murray / Sandy / West Jordan / South Jordan corridor) |

---

## 10. Useful Derived Values

```javascript
import route from '../data/route.json';

// Find the record-breaking stop
const recordStop = route.find(s => s.stop_number === 151);

// All GWR borderline stops
const borderlineStops = route.filter(s => s.gwr_flag);

// All post-midnight stops
const postMidnightStops = route.filter(s => s.is_post_midnight);

// Rough geographic center of route
const centerLat = route.reduce((sum, s) => sum + s.lat, 0) / route.length;
const centerLon = route.reduce((sum, s) => sum + s.lon, 0) / route.length;
```