# Current MVP quality review — 2026-10-30

## Scope inspected
- `main` at `38892494970bcfc54e8a64d6716e373d833e88e40`, public repository `StudyMate-N/payment-recovery-autopilot`.
- `app.js`, `index.html`, `tests/core.test.mjs`, `AGENTS.md`, `docs/CONTINUOUS-ENGINEERING.md`, GitHub Actions and open PRs #1, #3 and #4.
- Vercel deployment history for project `payment-recovery-autopilot`; previous preview builds marked READY, which is **build status only**, not release acceptance.
- Browser QA evidence on PR #3: desktop and mobile tests passed after correcting the textarea value assertion. That test suite is **not yet merged into main**.

## Highest-priority safe defect fixed in this PR
**Incorrect payment reminder claims for not-yet-due invoices.** The baseline `draft()` said an invoice "was due on" regardless of whether its due date was in the future. For example, seed invoice `INV-002` has a due date of 2026-11-12, but a reminder drafted on 2026-10-30 falsely said it was already due. The baseline date default also used UTC rather than the user's local calendar date, creating a rollover discrepancy near local midnight.

**Change:** `draft(invoice, today)` now distinguishes overdue, due today and upcoming invoices, avoids representing manual status as bank settlement, and refuses reminders for invoices recorded as paid. `invoiceStatus` defaults to the browser's local calendar date. No outbound messages are sent. This is intentionally a small, reviewable source change.

**Regression coverage added:** five deterministic tests for local calendar date, future invoice, due-today invoice, overdue invoice, and paid invoice rejection. Existing seven core tests remain.

## Release blockers still open
1. **CSV integrity:** PR #1 contains parser fixes for quoted/multiline CSV, invalid dates and precision; not yet merged. Current `main` export quotes fields but import uses `split(',')`, so round-trip is unreliable.
2. **Browser and responsive acceptance:** PR #3 is unmerged. Its passing browser checks do not substitute for a human accessibility audit or mobile visual review. Current mobile layout hides the sidebar navigation; keyboard/focus flow needs explicit verification.
3. **Identity and tenancy:** no authenticated accounts, server-side authorization, organization isolation or production database. Browser localStorage is demonstration-only and must not hold real invoice data.
4. **Trustworthy settlement:** `Mark paid` records a manual assertion, not bank confirmation. No payment reconciliation, dispute handling or audit ledger.
5. **Approvals:** reminder drafts are copy-only; no consent-aware sending, approval record, activity history, or opt-out handling.
6. **Security and durability:** no documented threat model, vulnerability review, backup/restore test, or data-retention controls.
7. **Product validation:** no evidence of five pilot businesses completing workflows and providing structured feedback, no pricing/willingness-to-pay acceptance.
8. **Automation:** PR #4 is unmerged and the separate API project budget/credential/activation controls are not verified. No paid coding agent was activated by this review.

## Release decision
**NOT READY.** No production launch, no real customer data, no automatic collection outreach. The review branch is proposed for human approval only.

## Verification ledger
- Unit suite: **PASS**, 12/12 tests, 0 failures (7 baseline + 5 new), `npm run check` in [GitHub Actions run 41010171973](https://github.com/StudyMate-N/payment-recovery-autopilot/actions/runs/41010171973), commit `8d3159291d2ebdc54582c6e74a3baef0d15f98eb`. The test log reports `# tests 12`, `# pass 12`, `# fail 0`.
- Preview build: **READY** at [Vercel preview](https://payment-recovery-autopilot-7kwgp670s.vercel.app) for commit `8d3159291d2ebdc54582c6e74a3baef0d15f98eb`. Build status is not a browser UX acceptance test.
- Browser suite: not rerun for this PR because browser workflow is currently on a separate, unmerged PR #3.
- Security review: not completed.
- Pilot acceptance and user sign-off: not completed.
