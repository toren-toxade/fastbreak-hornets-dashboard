#!/usr/bin/env node
// Simple local runner for ingestion API
// Usage: node scripts/run-ingestion.mjs [season] [mode]
// This script auto-loads .env.local so you don't need to export env vars.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Try to load .env.local via dotenv (if installed), then minimally parse as fallback
const envPath = resolve(process.cwd(), '.env.local');
try {
  const dotenv = await import('dotenv').catch(() => null);
  if (dotenv && typeof dotenv.config === 'function') {
    dotenv.config({ path: envPath, override: false });
  }
} catch {}

if (existsSync(envPath)) {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let [, k, v] = m;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith('\'') && v.endsWith('\''))) v = v.slice(1, -1);
    if (process.env[k] == null) process.env[k] = v;
  }
}

const season = process.argv[2] || '2024';
const mode = process.argv[3] || '';
const token = (process.env.INGEST_TOKEN || '').trim();
const base = process.env.APP_BASE_URL || 'http://localhost:3000';

// Default to free tier unless overridden
if (!process.env.NBA_API_TIER) process.env.NBA_API_TIER = 'free';

if (!token) {
  console.error('Missing INGEST_TOKEN (set it in .env.local or export it in your shell)');
  process.exit(1);
}

const url = `${base}/api/admin/ingest-bdl?season=${season}${mode ? `&mode=${encodeURIComponent(mode)}` : ''}`;

fetch(url, { method: 'POST', headers: { 'x-ingest-token': token, 'authorization': `Bearer ${token}`, 'accept': 'application/json' } })
  .then(async (r) => {
    const text = await r.text();
    if (!r.ok) {
      console.error(`HTTP ${r.status}:`, text);
      process.exit(1);
    }
    console.log(text);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
