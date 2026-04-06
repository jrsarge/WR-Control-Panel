#!/usr/bin/env node
// One-time script: carry cheapest_* fields from the old route.json into the new 195-stop route.
// Usage: node scripts/carry-over-cheapest.js /path/to/new-route-195.json

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const newRoutePath = process.argv[2];
if (!newRoutePath) {
  console.error('Usage: node scripts/carry-over-cheapest.js /path/to/new-route-195.json');
  process.exit(1);
}

const OLD_ROUTE = resolve(__dirname, '../src/data/route.json');

// Build lookup from old route keyed by "lat,lon"
const oldStops = JSON.parse(readFileSync(OLD_ROUTE, 'utf8'));
const oldMap = new Map();
for (const stop of oldStops) {
  const key = `${stop.lat},${stop.lon}`;
  oldMap.set(key, stop);
}

// Tolerance-based lookup (0.001°)
function findOldStop(lat, lon) {
  // Exact match first
  const exactKey = `${lat},${lon}`;
  if (oldMap.has(exactKey)) return oldMap.get(exactKey);

  // Tolerance scan
  const TOL = 0.001;
  for (const [, stop] of oldMap) {
    if (Math.abs(stop.lat - lat) <= TOL && Math.abs(stop.lon - lon) <= TOL) {
      return stop;
    }
  }
  return null;
}

const newStops = JSON.parse(readFileSync(resolve(newRoutePath), 'utf8'));

let carriedOver = 0;
let newWithNoData = 0;

const merged = newStops.map((stop) => {
  const old = findOldStop(stop.lat, stop.lon);
  if (old && old.cheapest_item !== undefined) {
    carriedOver++;
    return {
      ...stop,
      cheapest_item: old.cheapest_item,
      cheapest_price: old.cheapest_price,
      cheapest_is_drink: old.cheapest_is_drink,
    };
  } else {
    if (!old) newWithNoData++;
    return stop;
  }
});

writeFileSync(OLD_ROUTE, JSON.stringify(merged, null, 2) + '\n', 'utf8');

console.log(
  `Done — ${merged.length} stops written, ${carriedOver} cheapest fields carried over, ${newWithNoData} new stops (no order data yet)`
);
