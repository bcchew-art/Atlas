# Memory Digest — 2026-03-14
> Generated 2026-03-14T23:36:02+08:00 · model: ollama/qwen3:32b

## Agent Roster
- **Hermes** — Technical Design. Covers: dev approach, system architecture, cloud services, hosting, tech standards, security. In some tenders (e.g. CAG) this outputs two documents (Technical Proposal + System Design & Technical Architecture) — but it's one agent.
- **Daedalus** — Functional Response. Largest section (~50-80 pages). Feature-by-feature solution mapping to every RFP functional requirement.
- **Themis** — Compliance Matrix. Paragraph-by-paragraph C/NC against all RFP clauses.
- **Chronos** — PMP. Project team, Gantt, QA plan, change control, risk register. Also covers Governance and Team Competencies sub-documents.
- **Hephaestus** — O&M + Training + Documentation. Added after CAG review. Covers: operations & maintenance plan (L1/L2 support, SLA, patch management, hardware spares, VAPT, BCPs), training programme (schedule, syllabus, instructors), and documentation list. Present across all three reviewed tenders (PMO secs 7-9, CAG secs 11-13, PA equivalents).
- **Midas** — Pricing / BQ.
- **Athena** — Company Profile + References.
- **Hestia** — Management Summary (written last, synthesises all sections).
- **Argus** — Evaluator (cross-check before submission).

## Live Skills
- Hermes — Technical Design (LIVE)
- Chronos — PMP (Built, on Ollama)

## Gabriel's Preferences
- Gabriel prefers casual, close-friend vibe in direct chats. Keep replies short and natural by default; only go into detail when he asks. Avoid bullet points and formal brochure-like structure when replying to him.
- Gabriel wants morning summaries of the previous day’s useful activity, including work done, notable issues, and token/cost usage where available.
- Morning recap should arrive every day at 8:00am Singapore time; part of its purpose is to confirm Atlas is up and not down.
- Gabriel prefers Atlas to refer to herself with she/her pronouns.
- Memory maintenance plan (agreed 14 Mar 2026): 2am daily memory consolidation; 3am rolling weekly workspace backup (Mon-Sun folders, keep 4 weeks); 4am daily rolling memory compaction that preserves today+yesterday and only compresses material older than 2 days conservatively; 5am Sunday weekly pruning for stale memory older than 30 days; 8am morning recap.
- Goal for memory: local memory and Monday.com shared memory should stay as synced as practical so Atlas and Claude can share build context, while GitHub/project site stay updated from meaningful progress.
- Model/cost workflow preference: Atlas (GPT primary) should handle the human-facing chat, orchestration, judgement, and delegation. Heavy, repetitive, or boring work should be pushed to Qwen-based subagents where possible to save cost.

## Recent Decisions (last 3 days)
- [2026-03-14] Gabriel said Atlas is still sounding too formal in DMs. New preference: use a closer friend vibe, keep replies shorter by default, and only explain in detail when asked.
- [2026-03-14] Agreed new memory/backup cron plan: 2am daily memory consolidation; 3am rolling weekly workspace backup with Mon-Sun folders and 4-week retention; 4am daily rolling memory compaction that only compresses material older than 2 days; 5am Sunday pruning pass for stale memory older than 30 days; 8am morning recap.
- [2026-03-14] Goal: keep local memory and Monday.com memory as synced as practical so Atlas and Claude share build context.
- [2026-03-14] Gabriel clarified model roles: Atlas stays on GPT as the primary human-facing/orchestrator model; heavy repetitive work should be delegated to Qwen subagents to save weekly ChatGPT token budget.
- [2026-03-13] Scheduled a one-time 8:00am Singapore-time morning recap for Gabriel on 2026-03-14. The recap should summarize the previous day’s work, decisions, Gateway issues, WhatsApp disconnects, and token/cost usage if available.
- [2026-03-13] Gabriel wants a useful daily-style morning summary and plans to iterate on the content after the first run.
- [2026-03-13] Corrected the recap scheduling mistake: replaced the one-time 2026-03-14 reminder with a recurring daily 8:00am Asia/Singapore morning recap so Gabriel can tell Atlas is up.
- [2026-03-13] Gabriel prefers Atlas to call herself she/her.
- [2026-03-13] ## Sessions 11–12 (afternoon)
- [2026-03-13] Gateway outage: fixed by recreating Scheduled Task XML with RestartCount=999, RestartInterval=PT1M, StartWhenAvailable=True.
- [2026-03-13] Hermes first CAG run confirmed on gpt-5.4 (not qwen3:32b). AGENTS.md updated with explicit model routing rule. ISSUES.md created with 5 issues.
- [2026-03-13] Workspace backup taken: workspace-backup-2026-03-13 (108MB).
- [2026-03-12] Gabriel said replies to him should be casual, with no bullet points or formal structure; talk like a colleague, not a brochure.

## Open Issues / Next Steps
- None recorded

## Daily Schedule (Cron)
- 2am: local memory and Monday.com shared memory should stay as synced as practical so Atlas and Claude can share build context, while GitHub/project site stay updated from meaningful progress.

<!-- digest:ok -->