---
name: digest
model: ollama/qwen3:32b
description: >
  Local Digest Pipeline — two cheap workers that run on Qwen3 32B to reduce GPT token burn.
  Use this skill whenever Atlas needs to summarise memory, check project state, or generate
  a patch list of what the site/AGENTS.md/cron are out of date on. Never use GPT for these
  jobs — always run on local Ollama. Two sub-workers: (1) memory-digest reads MEMORY.md and
  recent daily notes and produces a compact JSON + Markdown summary; (2) state-diff compares
  index.html, MEMORY.md, AGENTS.md, and cron/jobs.json and outputs a human-readable patch list
  of inconsistencies. Use memory-digest before any Atlas session start or context restore. Use
  state-diff after any significant config/code change to catch stale documentation.
---

# Digest Pipeline

> ⚠️ **MODEL REQUIREMENT:** Always run this skill on `ollama/qwen3:32b`. When spawning as a subagent, you **must** set `model: "ollama/qwen3:32b"` in the spawn call's top-level model parameter. Do NOT use GPT for this — the whole point is to save tokens.

## Purpose

Two deterministic workers. Both produce artifact files — they never overwrite core memory or config.

| Worker | Input | Output |
|--------|-------|--------|
| `memory-digest` | MEMORY.md + last 3 daily notes | `digest/memory-digest-YYYY-MM-DD.md` + `digest/memory-digest-YYYY-MM-DD.json` |
| `state-diff` | index.html + MEMORY.md + AGENTS.md + cron/jobs.json | `digest/state-diff-YYYY-MM-DD.md` |

Both outputs go to: `C:\Users\Admin\.openclaw\workspace\digest\`

---

## Worker 1: memory-digest

### When to use
- Before Atlas restores session context (replaces brute-force full-file reads)
- After 2am consolidation job runs (verify quality)
- When Gabriel asks "what does Atlas know right now?"

### How to run

Atlas says: `run digest memory-digest`

Atlas will call this skill. The skill reads the inputs and calls the bundled script.

### Script

```
node skills/digest/scripts/memory-digest.js
```

### What the script produces

**JSON output** (`memory-digest-YYYY-MM-DD.json`):
```json
{
  "generated": "2026-03-14T02:00:00+08:00",
  "model": "ollama/qwen3:32b",
  "agent_roster": [...],
  "live_skills": [...],
  "user_preferences": [...],
  "recent_decisions": [...],
  "open_issues": [...],
  "cron_jobs": [...],
  "token_cost_notes": "..."
}
```

**Markdown output** (`memory-digest-YYYY-MM-DD.md`):
A compact 1–2 page human-readable summary. Sections: Agent Roster, Live Skills, Gabriel's Preferences, Recent Decisions (last 7 days), Open Issues, Daily Schedule.

### Rules
- Preserve dates and names exactly as found in source files
- Never invent information not present in source files
- If a daily note doesn't exist, skip it silently
- Output must be under 800 words for the markdown digest
- Append `<!-- digest:ok -->` to last line so Atlas can verify completion

---

## Worker 2: state-diff

### When to use
- After any significant config change (cron jobs, memory rules, model routing)
- After Atlas adds/changes cron jobs or AGENTS.md rules
- When Gabriel asks "is the site up to date?"

### How to run

Atlas says: `run digest state-diff`

### Script

```
node skills/digest/scripts/state-diff.js
```

### What the script produces

**Markdown patch list** (`state-diff-YYYY-MM-DD.md`):

```markdown
# State Diff — YYYY-MM-DD

## ✅ Consistent
- [items that match across site, MEMORY.md, AGENTS.md, cron]

## ⚠️ Stale / Inconsistent
- [item]: site says X, cron/MEMORY says Y → recommended fix: Z

## ❓ Missing from site
- [things in MEMORY.md or cron not yet reflected in index.html]
```

### What to compare

| Check | Source A | Source B |
|-------|----------|----------|
| Cron job count | cron/jobs.json (count entries) | index.html (grep "5 cron jobs" or similar) |
| Cron job descriptions | cron/jobs.json (schedule + label) | index.html daily schedule cards |
| GitHub push status | AGENTS.md backup rules | index.html Cold backup row |
| Agent roster | MEMORY.md agent roster section | index.html team tab agent cards |
| Live skill tags | MEMORY.md live skill entries | index.html skill tags (green = live) |
| Memory schedule | MEMORY.md user preferences section | index.html daily schedule cards |
| Model routing rule | MEMORY.md model roles section | index.html phase 01 model routing item |

### Rules
- Only report genuine mismatches — don't flag trivial wording differences
- Output must include the exact source text for each mismatch so Atlas/Gabriel can verify
- Append `<!-- diff:ok -->` to last line so Atlas can verify completion
- If everything is consistent, output `## ✅ All consistent — no patches needed`

---

## Atlas operating rules for this skill

1. **Never use GPT for these workers.** If local Ollama is unavailable, defer — do not fall back to GPT.
2. **Never overwrite** MEMORY.md, AGENTS.md, cron/jobs.json, or index.html from within this skill. Output to `digest/` only.
3. **Digest is read-only** — Atlas reads the output, then decides what to patch.
4. **Run state-diff after any cron/config change** as a post-change sanity check.
5. **Run memory-digest at session start** when MEMORY.md is large (>150 lines) to avoid expensive full-file reads on GPT.
