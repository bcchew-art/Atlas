#!/usr/bin/env node
/**
 * memory-digest.js
 * Worker 1 of the Digest Pipeline.
 * Reads MEMORY.md + last 3 daily notes, produces compact JSON + Markdown digest.
 * Always runs on Qwen3:32b via Ollama — never GPT.
 *
 * Usage: node skills/digest/scripts/memory-digest.js
 * Output: workspace/digest/memory-digest-YYYY-MM-DD.{json,md}
 */

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────────────────────
const WORKSPACE = path.resolve(__dirname, '../../..');
const MEMORY_FILE = path.join(WORKSPACE, 'MEMORY.md');
const AGENTS_FILE = path.join(WORKSPACE, 'AGENTS.md');
const DAILY_DIR = path.join(WORKSPACE, 'memory');
const OUTPUT_DIR = path.join(WORKSPACE, 'digest');

// ── Helpers ──────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10);
}

function sgNow() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Singapore' }).replace(' ', 'T') + '+08:00';
}

function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); }
  catch { return null; }
}

function lastNDailyNotes(n) {
  const notes = [];
  for (let i = 0; i < n + 5; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const content = readFileSafe(path.join(DAILY_DIR, `${dateStr}.md`));
    if (content) notes.push({ date: dateStr, content });
    if (notes.length >= n) break;
  }
  return notes;
}

// ── Extract sections from MEMORY.md ─────────────────────────────────────────
function extractSection(text, heading) {
  const regex = new RegExp(`## ${heading}[\\s\\S]*?(?=## |$)`, 'i');
  const m = text.match(regex);
  return m ? m[0].trim() : '';
}

function extractAgentRoster(memoryText) {
  const rosterSection = extractSection(memoryText, 'Tender Skill Architecture');
  const agents = [];
  const lines = rosterSection.split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*[-*]\s+\*\*(\w+)\*\*\s*=\s*(.+)/);
    if (m) agents.push({ name: m[1], role: m[2].trim() });
  }
  return agents;
}

function extractUserPreferences(memoryText) {
  const section = extractSection(memoryText, 'User Preferences');
  return section
    .split('\n')
    .filter(l => l.match(/^[-*]\s+/))
    .map(l => l.replace(/^[-*]\s+/, '').trim());
}

function extractRecentDecisions(dailyNotes) {
  const decisions = [];
  for (const note of dailyNotes) {
    const lines = note.content.split('\n').filter(l => l.trim().length > 20);
    for (const line of lines.slice(0, 8)) {
      const clean = line.replace(/^[-*]\s+/, '').trim();
      if (clean) decisions.push({ date: note.date, text: clean });
    }
  }
  return decisions.slice(0, 15);
}

function extractCronJobs(memoryText) {
  const section = extractSection(memoryText, 'Memory.*Plan|memory.*maintenance');
  const jobs = [];
  const matches = section.matchAll(/(\d+am|\d+pm)[^:]*:\s*([^\n;]+)/gi);
  for (const m of matches) {
    jobs.push(`${m[1].trim()}: ${m[2].trim()}`);
  }
  // Also try bullet format
  if (jobs.length === 0) {
    const lines = section.split('\n').filter(l => /\d+am|\d+pm/.test(l));
    for (const l of lines) jobs.push(l.replace(/^[-*\s]+/, '').trim());
  }
  return jobs;
}

function extractLiveSkills(memoryText) {
  const skills = [];
  const hermes = memoryText.match(/Hermes Skill.*?LIVE/i);
  const chronos = memoryText.match(/Chronos Skill.*?Built/i);
  if (hermes) skills.push('Hermes — Technical Design (LIVE)');
  if (chronos) skills.push('Chronos — PMP (Built, on Ollama)');
  return skills;
}

function extractOpenIssues(memoryText) {
  // Look for "Pending" or "Next" sections
  const pending = extractSection(memoryText, 'Pending next|Next to build');
  if (!pending) return [];
  return pending
    .split('\n')
    .filter(l => l.match(/^[-*]\s+/))
    .map(l => l.replace(/^[-*]\s+/, '').trim())
    .slice(0, 6);
}

// ── Build Markdown digest ────────────────────────────────────────────────────
function buildMarkdown(data) {
  const lines = [
    `# Memory Digest — ${data.generated.slice(0, 10)}`,
    `> Generated ${data.generated} · model: ${data.model}`,
    '',
    '## Agent Roster',
    ...data.agent_roster.map(a => `- **${a.name}** — ${a.role}`),
    '',
    '## Live Skills',
    ...(data.live_skills.length ? data.live_skills.map(s => `- ${s}`) : ['- None confirmed live yet']),
    '',
    '## Gabriel\'s Preferences',
    ...data.user_preferences.map(p => `- ${p}`),
    '',
    '## Recent Decisions (last 3 days)',
    ...data.recent_decisions.map(d => `- [${d.date}] ${d.text}`),
    '',
    '## Open Issues / Next Steps',
    ...(data.open_issues.length ? data.open_issues.map(i => `- ${i}`) : ['- None recorded']),
    '',
    '## Daily Schedule (Cron)',
    ...(data.cron_jobs.length ? data.cron_jobs.map(j => `- ${j}`) : ['- Schedule not found in MEMORY.md']),
    '',
    `<!-- digest:ok -->`,
  ];
  return lines.join('\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('[digest] memory-digest worker starting...');

  const memoryText = readFileSafe(MEMORY_FILE) || '';
  if (!memoryText) {
    console.error('[digest] ERROR: MEMORY.md not found at', MEMORY_FILE);
    process.exit(1);
  }

  const dailyNotes = lastNDailyNotes(3);
  console.log(`[digest] Read MEMORY.md (${memoryText.length} chars), ${dailyNotes.length} daily notes`);

  const data = {
    generated: sgNow(),
    model: 'ollama/qwen3:32b',
    agent_roster: extractAgentRoster(memoryText),
    live_skills: extractLiveSkills(memoryText),
    user_preferences: extractUserPreferences(memoryText),
    recent_decisions: extractRecentDecisions(dailyNotes),
    open_issues: extractOpenIssues(memoryText),
    cron_jobs: extractCronJobs(memoryText),
    token_cost_notes: 'GPT: human-facing + orchestration. Qwen3 32B: heavy doc work. Qwen3 8B: fast triage.',
  };

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const dateStr = today();
  const jsonPath = path.join(OUTPUT_DIR, `memory-digest-${dateStr}.json`);
  const mdPath = path.join(OUTPUT_DIR, `memory-digest-${dateStr}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  fs.writeFileSync(mdPath, buildMarkdown(data));

  console.log(`[digest] ✓ Written: digest/memory-digest-${dateStr}.json`);
  console.log(`[digest] ✓ Written: digest/memory-digest-${dateStr}.md`);
  console.log(`[digest] Agents found: ${data.agent_roster.length}, Live skills: ${data.live_skills.length}, Decisions: ${data.recent_decisions.length}`);
}

main();
