# MEMORY.md

## Tender Skill Architecture (decided 13 Mar 2026, updated same day after CAG review)

Reviewed three real ATT tender submissions: PA TACS, PMO CPIB, CAG T3 IIDS Refresh. Mapped agents to actual RFP document sections. Final 9-agent roster:

- **Hermes** = Technical Design. Covers: dev approach, system architecture, cloud services, hosting, tech standards, security. In some tenders (e.g. CAG) this outputs two documents (Technical Proposal + System Design & Technical Architecture) — but it's one agent.
- **Daedalus** = Functional Response. Largest section (~50-80 pages). Feature-by-feature solution mapping to every RFP functional requirement.
- **Themis** = Compliance Matrix. Paragraph-by-paragraph C/NC against all RFP clauses.
- **Chronos** = PMP. Project team, Gantt, QA plan, change control, risk register. Also covers Governance and Team Competencies sub-documents.
- **Hephaestus** = O&M + Training + Documentation. Added after CAG review. Covers: operations & maintenance plan (L1/L2 support, SLA, patch management, hardware spares, VAPT, BCPs), training programme (schedule, syllabus, instructors), and documentation list. Present across all three reviewed tenders (PMO secs 7-9, CAG secs 11-13, PA equivalents).
- **Midas** = Pricing / BQ.
- **Athena** = Company Profile + References.
- **Hestia** = Management Summary (written last, synthesises all sections).
- **Argus** = Evaluator (cross-check before submission).

**Core philosophy:** Past ATT submissions are reference for format/layout/consistency only. The content must be better — targeted to evaluation criteria, evidence-based, specific. Goal is to WIN tenders, not just complete them.

## Gateway Auto-Restart Fix (13 Mar 2026)

Gateway dropped around noon — no crash dump, clean SIGINT exit. Root cause: Scheduled Task had no restart-on-failure policy (RestartCount=0, RestartInterval=blank).

Atlas fixed it by generating a new Task XML with proper settings and recreating the task:
- **RestartCount:** 999
- **RestartInterval:** PT1M (retry every 1 minute)
- **StartWhenAvailable:** True

Gateway confirmed running post-fix: RPC probe ok, listening on 127.0.0.1:18789.

**Update procedure:** Cannot self-update while gateway is running — npm gets EBUSY file lock. Gabriel stops gateway, runs update, restarts manually. Atlas prepares the script, Gabriel executes.

## Hermes Skill — LIVE (13 Mar 2026)

Hermes is live and has completed her first real tender run: CAG T3 IIDS Refresh. Key decisions and findings:

- **Model routing lesson:** `model:` frontmatter in SKILL.md is NOT auto-applied by OpenClaw, and putting `"Use model: ollama/qwen3:32b"` only inside the prompt text is also NOT sufficient for `sessions_spawn(runtime="subagent")`. Atlas must set the spawn call's top-level `model` parameter explicitly. Both the Hermes rerun and Chronos live run accidentally used `gpt-5.4` because the spawn `model` field was omitted.
- **Cost impact:** Gabriel called out that the mistaken GPT-5.4 rerun cost about **$1.81** versus the intended local Ollama run. Atlas accepted responsibility and recorded the fix.
- **Sub-agent visibility:** Hermes is NOT visible in the Agents tab (only registered agents show there). To watch Hermes work, use the Chat tab dropdown → select the subagent session by label (e.g. "Subagent: hermes-cag-techdesign"). Run history is in `.openclaw/subagents/runs.json`.
- **Document format:** Professional ATT format using docx-js (npm). Font: Book Antiqua. A4 page. ATT logo in header. Cover page + TOC mandatory.
- **ATT logo:** Extracted from real CAG submission → `skills/hermes/assets/att-logo.png`
- **Output folder:** All Hermes outputs go to `tender submission/` subfolder inside the tender folder.
- **First run quality (gpt-5.4):** Structure correct — logo ✓, TOC ✓, headings ✓, right filenames ✓. But depth thin (~32KB per doc). Qwen3:32b run expected to produce significantly richer content.
- **Reusable script:** `workspace/scripts/hermes_cag_generate.js` (386 lines) — left behind for future CAG runs.
- **Evals:** 2 iterations complete, 100% pass rate. Assertions: content checks + format (logo, TOC, header/footer).

**Next to build:** Daedalus (Functional Response) — Chronos is now built.

## Chronos Skill — Built (13 Mar 2026)

Chronos is ATT's PMP sub-agent. Covers:
- **Section 8 (CAG) / Section 6 Part B (PMO):** Project Plan — implementation schedule, SDLC phases, Gantt, QA plan, change management
- **Section 9:** Project Governance & Management — methodology, communication plan, risk register, contingency plan, exit plan
- **Section 10:** Team Organisation & Competencies — org chart, roles/responsibilities table, CVs in Schedule 6 format

**Status:** Built and run live on CAG, but first live run also accidentally used `gpt-5.4` instead of the intended local Ollama model because the spawn `model` parameter was not set explicitly.

**Key content in skill:**
- Risk register with 10 standard ATT PMP risks + airport/FIDS-specific additions
- Schedule 6 CV template (CAG prescribed format)
- ICA AQS PMP structure reference (real delivered ATT PMP)
- 3 eval cases: full CAG PMP, PMO CPIB PMP, standalone risk register

**PMO CPIB past submission (Section 6 PMP):** Files are on OneDrive and not locally synced — I/O error when trying to read them. Workaround: built Chronos from CAG Appendix K requirements + ICA AQS PMP structure (which IS accessible). If Gabriel can sync or copy the PMO submission files locally, they can be added to `references/` for better coverage.

## Ollama Subagent Routing + Test Lessons (13 Mar 2026)

CAG reruns established the following operational lessons for Atlas's knowledge bank:

- **Correct way to force local Ollama on subagents:** set the top-level `model` field on `sessions_spawn`, e.g. `model: "ollama/qwen3:32b"`. Putting the model only in prompt text is not enough.
- **How to verify the model actually used:** inspect subagent history; successful Ollama runs show `provider: ollama` and `model: qwen3:32b` in the session history.
- **Agent auth path that matters:** subagents for Atlas use `C:\Users\Admin\.openclaw\agents\main\agent\auth-profiles.json`. If Ollama auth is missing there, the run fails immediately with provider auth errors even if Ollama is configured elsewhere.
- **Working Ollama auth fix:** adding `ollama:default` into the `main` agent auth store resolved the provider-auth failure. `openclaw models status --agent main` should show Ollama under Auth overview before rerunning.
- **Test 5 result:** model/auth routing was fixed, but both Hermes and Chronos still failed at the skill-execution layer. This proved the platform/config problem was solved and the remaining issues were inside the skills themselves.
- **Hermes-specific lesson:** the CAG `_extracted` filenames include the original extension, e.g. `04F PR_Appendix K - Tender Submission Requirements.pdf.txt`. Hermes must not assume a `.txt` filename without the `.pdf` part.
- **Chronos-specific lesson:** Chronos must use plain `exec` for `node generate.js` in this environment. Attempts to force host/security/pty/elevated/sandbox settings triggered avoidable runtime failures.
- **Test 7 result:** after targeted SKILL.md fixes, Hermes improved to partial output generation and Chronos improved to a narrow generated-JS syntax failure. This means the remaining blockers are now generated-script quality issues, not OpenClaw model routing, auth, or gateway config.
- **Current debugging strategy:** when Ollama runs fail now, inspect the actual generated JS/docx artifacts and patch the skills surgically. The problem space has moved from infrastructure to prompt/skill reliability.
- **Deterministic script fix (breakthrough):** prompt-only SKILL tightening was not enough. The stable fix was to stop asking Hermes and Chronos to invent `generate.js` from scratch and instead bundle known-good generator scripts inside each skill:
  - `skills/hermes/scripts/generate-cag.js`
  - `skills/chronos/scripts/generate-cag.js`
- **Test 10 result (first clean Ollama pass):** with bundled deterministic scripts, both Hermes and Chronos successfully generated the expected CAG documents on `ollama/qwen3:32b`, and Atlas verified the files directly in `C:\Users\Admin\.openclaw\tender\CAG\tender submission`.
- **Verified output set from test 10:**
  - `06 Technical Proposal.docx` (~32.9 KB)
  - `07 System Design and Technical Architecture.docx` (~33.5 KB)
  - `08 Project Plan - CAG T3 IIDS Refresh.docx` (~31.1 KB)
  - `09 Project Governance and Management - CAG T3 IIDS Refresh.docx` (~30.9 KB)
  - `10 Team Organisation and Competencies - CAG T3 IIDS Refresh.docx` (~30.8 KB)
  - `Chronos Notes - Assumptions and Gaps.txt`
  - `hermes-generation-notes.txt`
- **Operational lesson:** when a subagent completion message is unreliable or self-contradictory, trust the direct folder/file verification over the model's narrative. Atlas should always check the actual output folder before declaring success.

## Backup Log

- **2026-03-13:** `workspace-backup-2026-03-13/` (108MB) + `openclaw.json.backup-2026-03-13` — taken after Hermes first live run milestone.

## User Preferences
- Gabriel prefers casual, close-friend vibe in direct chats. Keep replies short and natural by default; only go into detail when he asks. Avoid bullet points and formal brochure-like structure when replying to him.
- Gabriel wants morning summaries of the previous day’s useful activity, including work done, notable issues, and token/cost usage where available.
- Morning recap should arrive every day at 8:00am Singapore time; part of its purpose is to confirm Atlas is up and not down.
- Gabriel prefers Atlas to refer to herself with she/her pronouns.
- Memory maintenance plan (agreed 14 Mar 2026): 2am daily memory consolidation; 3am rolling weekly workspace backup (Mon-Sun folders, keep 4 weeks); 4am daily rolling memory compaction that preserves today+yesterday and only compresses material older than 2 days conservatively; 5am Sunday weekly pruning for stale memory older than 30 days; 8am morning recap.
- Goal for memory: local memory and Monday.com shared memory should stay as synced as practical so Atlas and Claude can share build context, while GitHub/project site stay updated from meaningful progress.
- Model/cost workflow preference: Atlas (GPT primary) should handle the human-facing chat, orchestration, judgement, and delegation. Heavy, repetitive, or boring work should be pushed to Qwen-based subagents where possible to save cost.
