#!/usr/bin/env node
/**
 * state-diff.js
 * Worker 2 of the Digest Pipeline.
 * Compares index.html, MEMORY.md, AGENTS.md, cron/jobs.json.
 * Outputs a patch list of inconsistencies.
 * Always runs on Qwen3:32b — never GPT.
 *
 * Usage: node skills/digest/scripts/state-diff.js
 * Output: workspace/digest/state-diff-YYYY-MM-DD.md
 */

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────────────────────
const WORKSPACE = path.resolve(__dirname, '../../..');
const OPENCLAW_ROOT = path.resolve(WORKSPACE, '..');  // workspace/../ = .openclaw root
const INDEX_HTML = path.join(WORKSPACE, 'index.html');
const MEMORY_FILE = path.join(WORKSPACE, 'MEMORY.md');
const AGENTS_FILE = path.join(WORKSPACE, 'AGENTS.md');
// Try workspace-relative first, then parent .openclaw/cron
const CRON_FILE = (() => {
  const p1 = path.join(OPENCLAW_ROOT, 'cron', 'jobs.json');
  const p2 = path.resolve(WORKSPACE, '../../../cron/jobs.json'); // C:\Users\Admin\.openclaw\cron
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  return p1; // fallback, will fail gracefully
})();
const OUTPUT_DIR = path.join(WORKSPACE, 'digest');

// ── Helpers ──────────────────────────────────────────────────────────────────
function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); }
  catch { return null; }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function sgNow() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Singapore' }).replace(' ', 'T') + '+08:00';
}

// ── Checks ───────────────────────────────────────────────────────────────────

function checkCronJobCount(cronText, htmlText) {
  const issues = [];
  let cronCount = 0;
  try {
    const cron = JSON.parse(cronText);
    // Handle both flat array and { version, jobs: [] } format
    if (Array.isArray(cron)) cronCount = cron.length;
    else if (Array.isArray(cron.jobs)) cronCount = cron.jobs.length;
    else cronCount = Object.keys(cron).filter(k => k !== 'version').length;
  } catch { return [{ status: 'warn', check: 'Cron job count', detail: 'Could not parse cron/jobs.json' }]; }

  const siteMatch = htmlText.match(/(\d+)\s+cron\s+jobs?/i);
  const siteCount = siteMatch ? parseInt(siteMatch[1]) : null;

  if (siteCount === null) {
    issues.push({ status: 'warn', check: 'Cron job count', detail: `cron/jobs.json has ${cronCount} jobs but site has no explicit count mention` });
  } else if (cronCount !== siteCount) {
    issues.push({ status: 'stale', check: 'Cron job count', detail: `cron/jobs.json has ${cronCount} jobs but site says "${siteCount} cron jobs"`, fix: `Update site to say "${cronCount} cron jobs"` });
  } else {
    issues.push({ status: 'ok', check: 'Cron job count', detail: `Both say ${cronCount} jobs` });
  }
  return issues;
}

function checkGithubPushWording(htmlText, memoryText, agentsText) {
  const issues = [];

  // Site should NOT say "pushed nightly at 3am" or "GitHub push" in backup context
  // Only flag language that positively implies auto/nightly push
  // Ignore text that contains "no auto" or "manual" near github push
  const badPatterns = [
    { re: /pushed nightly at 3am/i, label: 'pushed nightly at 3am' },
    { re: /backup.*then pushes to github/i, label: 'backup then pushes to GitHub' },
  ];
  for (const { re, label } of badPatterns) {
    if (re.test(htmlText)) {
      issues.push({
        status: 'stale',
        check: 'GitHub push wording',
        detail: `Site implies nightly auto-push: "${label}"`,
        fix: 'GitHub push is manual / milestone-based. Update site wording.',
      });
    }
  }
  // Positive check: site should mention manual/milestone push
  if (/manual|milestone.*push|push.*manual/i.test(htmlText)) {
    issues.push({ status: 'ok', check: 'GitHub push wording', detail: 'Site correctly describes GitHub push as manual/milestone' });
  }

  if (issues.length === 0) {
    issues.push({ status: 'ok', check: 'GitHub push wording', detail: 'No nightly auto-push language found in site' });
  }
  return issues;
}

function checkMondayWording(htmlText) {
  const issues = [];
  if (/writes to monday\.com after every session/i.test(htmlText)) {
    issues.push({
      status: 'stale',
      check: 'Monday.com write frequency',
      detail: 'Site says "Writes to Monday.com after every session"',
      fix: 'Change to: Updates Monday through scheduled jobs and meaningful milestones.',
    });
  } else {
    issues.push({ status: 'ok', check: 'Monday.com write frequency', detail: 'Monday wording looks accurate' });
  }
  return issues;
}

function checkCronDescriptions(cronText, htmlText) {
  const issues = [];
  let jobs = [];
  try { jobs = JSON.parse(cronText); } catch { return []; }
  if (!Array.isArray(jobs)) jobs = Object.values(jobs);

  // Known expected schedule on site
  const expectedOnSite = ['2am', '3am', '4am', '5am', '8am'];
  for (const time of expectedOnSite) {
    const siteHas = new RegExp(`<.*?>${time}<`, 'i').test(htmlText) || htmlText.includes(`>${time}<`);
    if (!siteHas) {
      issues.push({ status: 'missing', check: `${time} schedule card`, detail: `${time} job card not found in site daily schedule` });
    } else {
      issues.push({ status: 'ok', check: `${time} schedule card`, detail: `${time} card present in site` });
    }
  }
  return issues;
}

function checkAgentRoster(memoryText, htmlText) {
  const agents = ['Hermes', 'Chronos', 'Daedalus', 'Themis', 'Midas', 'Athena', 'Hestia', 'Argus', 'Hephaestus'];
  const issues = [];
  for (const agent of agents) {
    const inMemory = memoryText.includes(agent);
    const inSite = htmlText.includes(agent);
    if (inMemory && !inSite) {
      issues.push({ status: 'missing', check: `Agent: ${agent}`, detail: `${agent} in MEMORY.md but not found in site` });
    } else if (inMemory && inSite) {
      issues.push({ status: 'ok', check: `Agent: ${agent}`, detail: `${agent} present in both` });
    }
    // Don't flag agents not yet in memory
  }
  return issues;
}

function checkModelRouting(memoryText, htmlText) {
  const issues = [];
  const memoryHasGptQwen = /GPT.*orchestrat|GPT.*human-facing|Qwen.*heavy/i.test(memoryText);
  const siteHasGptQwen = /GPT.*orchestrat|GPT.*human-facing|Qwen.*heavy/i.test(htmlText);
  if (memoryHasGptQwen && !siteHasGptQwen) {
    issues.push({
      status: 'missing',
      check: 'Model role split',
      detail: 'MEMORY.md has explicit GPT/Qwen role split but site does not clearly reflect it',
      fix: 'Add: GPT = human-facing/orchestration, Qwen = heavy repetitive work',
    });
  } else {
    issues.push({ status: 'ok', check: 'Model role split', detail: 'GPT/Qwen split documented' });
  }
  return issues;
}

// ── Build report ─────────────────────────────────────────────────────────────
function buildReport(allChecks) {
  const ok = allChecks.filter(c => c.status === 'ok');
  const issues = allChecks.filter(c => c.status !== 'ok');

  const lines = [
    `# State Diff — ${today()}`,
    `> Generated ${sgNow()} · model: ollama/qwen3:32b`,
    '',
  ];

  if (issues.length === 0) {
    lines.push('## ✅ All consistent — no patches needed', '');
  } else {
    lines.push('## ⚠️ Stale / Inconsistent / Missing', '');
    for (const c of issues) {
      const icon = c.status === 'missing' ? '❓' : '⚠️';
      lines.push(`### ${icon} ${c.check}`);
      lines.push(`- **Found:** ${c.detail}`);
      if (c.fix) lines.push(`- **Fix:** ${c.fix}`);
      lines.push('');
    }
  }

  lines.push('## ✅ Consistent', '');
  for (const c of ok) {
    lines.push(`- ✓ ${c.check}: ${c.detail}`);
  }

  lines.push('', `<!-- diff:ok -->`);
  return lines.join('\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('[digest] state-diff worker starting...');

  const htmlText = readFileSafe(INDEX_HTML) || '';
  const memoryText = readFileSafe(MEMORY_FILE) || '';
  const agentsText = readFileSafe(AGENTS_FILE) || '';
  const cronText = readFileSafe(CRON_FILE) || '[]';

  if (!htmlText) { console.error('[digest] ERROR: index.html not found'); process.exit(1); }
  if (!memoryText) { console.error('[digest] ERROR: MEMORY.md not found'); process.exit(1); }

  console.log(`[digest] Loaded: index.html (${htmlText.length}c), MEMORY.md (${memoryText.length}c), cron/jobs.json (${cronText.length}c)`);

  const allChecks = [
    ...checkCronJobCount(cronText, htmlText),
    ...checkGithubPushWording(htmlText, memoryText, agentsText),
    ...checkMondayWording(htmlText),
    ...checkCronDescriptions(cronText, htmlText),
    ...checkAgentRoster(memoryText, htmlText),
    ...checkModelRouting(memoryText, htmlText),
  ];

  const report = buildReport(allChecks);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const outPath = path.join(OUTPUT_DIR, `state-diff-${today()}.md`);
  fs.writeFileSync(outPath, report);

  const staleCount = allChecks.filter(c => c.status !== 'ok').length;
  console.log(`[digest] ✓ Written: digest/state-diff-${today()}.md`);
  console.log(`[digest] ${staleCount} issues found, ${allChecks.filter(c => c.status === 'ok').length} consistent`);
  if (staleCount > 0) {
    console.log('[digest] Issues:');
    allChecks.filter(c => c.status !== 'ok').forEach(c => console.log(`  ⚠️  ${c.check}: ${c.detail}`));
  }
}

main();
