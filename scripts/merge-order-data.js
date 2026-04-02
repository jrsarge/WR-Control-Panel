#!/usr/bin/env node
// One-time script: merges Cheapest Item / Price / Drink? from CSV into route.json
// Usage: node scripts/merge-order-data.js [path/to/csv]

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CSV_PATH = process.argv[2] || path.join(__dirname, '../../Downloads/WR Restaurants - Verified.csv')
const ROUTE_PATH = path.join(__dirname, '../src/data/route.json')

// Parse CSV manually — no dependencies needed
function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim())
  const headers = splitCSVLine(lines[0]).map(h => h.trim())
  return lines.slice(1).map(line => {
    const values = splitCSVLine(line)
    const row = {}
    headers.forEach((h, i) => { row[h] = (values[i] || '').trim() })
    return row
  })
}

// Handles quoted fields containing commas
function splitCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

const csvText = fs.readFileSync(CSV_PATH, 'utf8')
const rows = parseCSV(csvText)
const route = JSON.parse(fs.readFileSync(ROUTE_PATH, 'utf8'))

// Build lookup by stop number
const byStop = {}
for (const row of rows) {
  const num = parseInt(row['Stop #'], 10)
  if (!isNaN(num)) byStop[num] = row
}

let merged = 0
for (const stop of route) {
  const row = byStop[stop.stop_number]
  if (!row) continue

  const item = (row['Cheapest Item'] || '').trim()
  const priceRaw = (row['Price'] || '').replace('$', '').trim()
  const price = parseFloat(priceRaw)
  const isDrink = (row['Drink?'] || '').trim().toUpperCase() === 'Y'

  if (item) {
    stop.cheapest_item = item
    stop.cheapest_price = isNaN(price) ? null : price
    stop.cheapest_is_drink = isDrink
    merged++
  }
}

fs.writeFileSync(ROUTE_PATH, JSON.stringify(route, null, 2))
console.log(`Done — enriched ${merged} / ${route.length} stops.`)
