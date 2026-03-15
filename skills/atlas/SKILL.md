---
name: atlas-tender
model: ollama/qwen3:32b
description: >
  Atlas's Tender Orchestration skill. Activate when Gabriel says "new tender", "prepare
  this tender", or points to a tender folder. Atlas reads the RFP, maps required documents,
  creates the submission folder, and spawns the right sub-agents. Always use local Ollama
  for reading and analysis — never Codex. Sub-agents (Hermes, Chronos, etc.) are always
  spawned with model: ollama/qwen3:32b explicitly set in the spawn call.
---

# Atlas — Tender Orchestration

## When Gabriel says this, run this skill

- "Here is a new tender"
- "Prepare [tender name]"
- "Run the tender for [folder]"
- "Use your tender skill for this"

No long prompt needed from Gabriel. You know what to do.

---

## Step 1 — Read the tender folder (use local Ollama)

Gabriel will point you to a folder, e.g. `.openclaw/tender/CAG/`

**Do NOT use Codex/GPT for this step. Switch to local Ollama.**

List the folder. Find:
- The submission requirements doc (usually "Appendix K", "Schedule of Requirements", "Tender Submission Requirements")
- The technical requirements doc (usually "System and Technical Requirements", "Annex IV", main RFP spec)
- Any past submission reference folder if present

Read the submission requirements doc carefully. Map out:
- Every document that must be produced
- The required filename / section number for each
- Any format requirements (page limits, templates, fonts)

---

## Step 2 — Map to sub-agents

Match each required document to the right sub-agent:

| Document type | Sub-agent | Skill |
|---|---|---|
| Technical Proposal / System Design / Architecture | Hermes | `skills/hermes/SKILL.md` (skill: technical-design) |
| Project Management Plan / Gantt / Risk Register / Governance / Team CVs | Chronos | `skills/chronos/SKILL.md` (skill: project-management-plan) |
| Functional Response / Feature-by-feature requirement mapping | Daedalus | `skills/daedalus/SKILL.md` (when built) |
| Compliance Matrix | Themis | `skills/themis/SKILL.md` (when built) |
| O&M / Training / Documentation | Hephaestus | `skills/hephaestus/SKILL.md` (when built) |
| Company Profile / References | Athena | `skills/athena/SKILL.md` (when built) |
| Pricing / BQ | Midas | `skills/midas/SKILL.md` (when built) |
| Management Summary | Hestia | `skills/hestia/SKILL.md` (when built) — always last |

Only spawn sub-agents whose skill files exist. Flag the rest as pending.

---

## Step 3 — Create submission folder

Create: `[tender folder]/tender submission/`

Example: `.openclaw/tender/CAG/tender submission/`

---

## Step 4 — Spawn sub-agents

For each sub-agent being spawned:

1. **Always set `model: "ollama/qwen3:32b"` in the spawn call top-level parameter** — not just in the prompt text. This is mandatory. Omitting it causes the run to fall back to GPT-5.4 and burns Codex tokens unnecessarily.
2. Provide the sub-agent with:
   - Path to the tender folder
   - Path to the submission requirements doc
   - Path to the technical requirements doc
   - Output folder: `[tender folder]/tender submission/`
   - Instruction to use their bundled deterministic script if one exists (e.g. `skills/hermes/scripts/generate-cag.js`)

Spawn sub-agents in this order:
1. Hermes (technical docs)
2. Chronos (PMP docs)
3. All others in parallel where possible
4. Hestia last (management summary — synthesises everything else)

---

## Step 5 — Verify outputs

After each sub-agent completes:

1. List the `tender submission/` folder directly — do not trust the sub-agent's completion summary alone
2. Check every expected file exists and is non-placeholder (>10KB)
3. If a file is missing or undersized, flag it and note which sub-agent produced it

---

## Step 6 — Report to Gabriel

Send Gabriel a short summary:
- Which documents were produced ✓
- File sizes (rough KB)
- Anything missing or flagged ⚠️
- Whether a quality review is needed before sending to Jackie

Keep it short. Gabriel doesn't need a play-by-play — just the outcome and any action items.

---

## Rules

- **Never use Codex/GPT for reading RFP documents.** Local Ollama only for ingestion and analysis.
- **Always set model explicitly on spawn calls.** File-level `model:` frontmatter is not enough.
- **Always verify the output folder directly** before declaring success.
- **Never send output to Jackie or Sultan without Gabriel's explicit approval.**
- **Flag gaps early** — if a required document has no sub-agent yet, say so clearly.
- **Output quality matters more than speed.** If something looks thin, flag it rather than declare it done.
