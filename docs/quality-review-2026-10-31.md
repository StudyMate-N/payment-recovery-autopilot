# Current MVP quality review — 2026-10-31

## Scope and evidence
- Inspected public repository `StudyMate-N/payment-recovery-autopilot`, `main` at `38892494970bcfc54e8a64d671e373d833e88e40`, including `app.js`, `index.html`, `AGENTS.md`, `README.md`, `tests/core.test.mjs`, package scripts, GitHub CI and continuous-engineering charter.
- Reviewed open PRs [#1 CSV import](https://github.com/StudyMate-N/payment-recovery-autopilot/pull/1), [#3 desktop/mobile browser QA](https://github.com/StudyMate-N/payment-recovery-autopilot/pull/3), [#4 agent supervisor](https://github.com/StudyMate-N/payment-recovery-autopilot/pull/4), and [#5 date-aware reminder wording](https://github.com/StudyMate-N/payment-recovery-autopilot/pull/5). All remain unmerged at review time. Avoided overlapping their changes.
- Inspected Vercel project `payment-recovery-autopilot` deployment history. Recent feature-branch previews are marked READY, **which proves only deployment build status**, not that a browser or security audit passed.
- The latest `main` quality checks passed at [GitHub Actions run 41156996962](https://github.com/StudyMate-N/payment-recovery-autopilot/actions/runs/41156996962), but main still contains only seven baseline unit tests.

## P0 defect fixed in this PR: spreadsheet formula injection on CSV export
**Finding:** `index.html` exported invoice IDs, customer names, and email fields wrapped in double quotes. Quoting alone does not reliably neutralize spreadsheet formulas. A value beginning `=`, `+`, `-`, or `@` (including after whitespace/control/invisible prefixes) could be interpreted as a formula by spreadsheet software when the exported CSV is opened. An imported or manually entered formula-like value could therefore become a spreadsheet security risk.

**Fix:** Added `csv-export.js` and routed dashboard export through `exportInvoices()`. All fields are CSV-quoted, embedded double quotes doubled, and formula-like text values prefixed with a literal apostrophe. Amounts retain two-decimal USD formatting and paid flags remain explicit. No customer communication or payment activity was added.

**Trade-off:** Formula-like values acquire a literal apostrophe in exported CSV data. This is intentionally **not a byte-for-byte reversible export** for these values; the safe export must be treated as a presentation/interchange artifact rather than an authoritative backup. A future authenticated storage system needs a separate lossless export/backup format.

**Tests added:** Four regression tests: dangerous formula prefixes (including leading whitespace, BOM and zero-width characters), normal/quoted/multiline values, full invoice CSV serialization, and empty export. `npm run check` now syntax-checks the new module.

## Verification ledger
- **Source/PR review:** completed. This branch contains a focused, unmerged fix, [PR #6](https://github.com/StudyMate-N/payment-recovery-autopilot/pull/6).
- **Unit tests and CI:** **PASS 11/11, 0 failures** (7 baseline + 4 new) on [GitHub Actions run 41174222019](https://github.com/StudyMate-N/payment-recovery-autopilot/actions/runs/41174222019), commit `1da65000`; `npm run check` passed. Separately, the four new tests passed in a reconstructed Node 22 local harness. No local browser E2E was executed in this review.
- **Vercel preview:** **READY** for commit `1da65000` at [feature preview](https://payment-recovery-autopilot-pkl0870hj.vercel.app). This is a build status, not a visual acceptance test.
- **Browser accessibility, responsive layout and visual polish:** inspected source and existing PR #3, but not independently visually accepted. Mobile currently hides sidebar navigation; no full keyboard/screen-reader audit is recorded.
- **Security:** one concrete CSV-export injection vector addressed. No independent security review, penetration test or threat-model sign-off completed.
- **Persistence:** localStorage remains demo-only, with no authenticated, durable or tenant-isolated backend.
- **Approvals and payment truth:** draft-only messages and manually marked payment states remain. No verified bank reconciliation, consent-aware sending, approval ledger or immutable audit log.

## Release decision
**NOT READY.** Do not enter real financial data, send automated collection messages or promote the prototype as a customer-ready financial product. Required: merge/review P0 PRs, run combined browser and accessibility acceptance, validate secure authentication and organization isolation, durable backups, settlement reconciliation, consent and approvals, independent security review, five pilot-business workflows and explicit owner approval.

## Recommended next iteration
Resolve or review the overlapping P0 PRs #1, #3 and #5; after their merge, run combined CSV import/export roundtrip, mobile and keyboard browser acceptance. Then address corrupted localStorage and persistence failure handling before introducing any real customer data.
