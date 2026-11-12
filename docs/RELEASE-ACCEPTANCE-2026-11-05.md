# Current — Release acceptance and integration gate (2026-11-05)

**Decision: NOT READY.** This is a release-control checklist, not a security certification or a claim that manual tests ran.

## Evidence inspected on 2026-11-05
- Default branch `main`: `38892494` (GitHub Actions `MVP quality gates` success for that revision; Vercel commit status success). These are **baseline** results only.
- Open improvement PRs: #1, #3, #4, #5, #6, #7, #8, #9, #11, #12. **Ten** unmerged; #8 targets #7, not main.
- Main source: `app.js`, `index.html`, `package.json`, `AGENTS.md`, `README.md`; main test file `tests/core.test.mjs`.
- Main UI warns that it is a browser-local demonstration; it lacks authenticated tenancy, durable server-side persistence, verified settlement and message-approval audit logs.
- Vercel success indicates a deployment build, **not** authenticated functional, mobile, accessibility, or security acceptance.
- Issue #10 tracks duplicate Vercel projects / deployment rate limiting.

## Integration order — review required, no automatic merges
1. Review #9 (remove redundant 15-minute checks) and #1 (CSV import) separately; inspect CI and diff before merging.
2. Review #5 (date-correct reminder drafts), #6 (spreadsheet-safe CSV export), and #11 (demo payment truth contract); merge only after review.
3. Review #7 (storage integrity) before #8 (mobile accessibility, currently stacked on #7). Rebase #8 after #7 if merged; rerun CI.
4. Review #12 (reversible manually recorded paid status) against the integrated storage layer, then rerun status tests.
5. Review #3 (browser tests) and #4 (API coding worker) independently. Never enable #4 without a project-level API hard cap, explicit opt-in and protected secrets.
6. Run one consolidated integration candidate; verify all unit, E2E, mobile and security gates on the **same commit**. Resolve conflicts rather than cherry-picking untested fragments.

## Release acceptance matrix — each box requires recorded evidence
| Gate | Acceptance criterion | Evidence required | 2026-11-05 status |
| --- | --- | --- | --- |
| Invoice accuracy | Valid/invalid CSV, quoted fields, duplicates, atomic import, exports, rounding, dates and totals | Unit tests + spreadsheet/manual import-export roundtrip | BLOCKED: open PRs |
| Payment truth | Manual paid flags never claim bank verification; reversals audited; settlement requires provider reference and reconciliation | Unit + integration tests with synthetic mismatches, replay and refund cases | BLOCKED: no verified settlement |
| Persistence | Authenticated durable database, tenant isolation, migrations, backups, restore drill and concurrency protection | Automated isolation tests, backup restore evidence | BLOCKED: browser storage only |
| Security | AuthN/AuthZ, secrets, input and output handling, CSRF/XSS protection, rate limiting, dependency review and independent security sign-off | Threat model, review record and remediation evidence | BLOCKED |
| Messaging | Consent, preview, explicit human approval, audit events, delivery failure handling, no unintended sends | End-to-end approval tests using sandbox destinations | BLOCKED: drafts only |
| Responsive UX | Keyboard-only task completion, 320/375/768/1280px layouts, table scroll, focus and modal behavior | Playwright traces/screenshots with named browser versions | BLOCKED: no recorded cross-device acceptance |
| Accessibility | Labels, contrast, visible focus, announcements, dialog navigation, WCAG 2.2 AA review | Automated checks + manual keyboard/screen reader report | BLOCKED |
| Operational readiness | Deployment rollback, monitoring, error budget, backups, support and incident runbook | Staging exercise and incident simulation | BLOCKED |
| Customer value | Five consenting pilot businesses complete onboarding and core invoice workflow with synthetic or authorized data | Dated acceptance logs and user feedback | BLOCKED |
| Release approval | Owner explicitly approves reviewed release candidate and known residual risks | Recorded sign-off linked to exact commit | BLOCKED |

## Safe browser acceptance procedure
Use fictional data only. At 320, 375, 768 and 1280 px, verify navigation, searching, importing malformed/quoted CSV, duplicate IDs, export formula escaping, reminders before/on/after due date, draft copying, manual paid/reopen transitions, keyboard tab order, Escape on dialogs, and behavior when browser storage is denied. Capture screenshots and test traces; record actual device/browser versions. **Do not record PASS until performed.**

## User actions and permissions
- Human reviewer must review/merge the open PRs and approve any conflict resolutions. Current automated review is not merge approval.
- To enable the API worker, configure its separate API project hard spend cap, GitHub secret and opt-in variables per #4. It is optional for MVP release.
- Provide a secure deployment/database environment and approved payment-provider test credentials **through secret stores**, never GitHub issues or chat.
- Designate a security reviewer and arrange five consenting pilot organizations. No real customer financial records until security gates pass.
- Confirm one canonical Vercel project and resolve issue #10 without purchasing a higher tier automatically.

## Next quality loop
Check PR merge states, newest Actions and Vercel statuses, test failures and issue #10. Implement one bounded safe improvement on a separate branch, add tests where code changes, and preserve this matrix as the source of release truth. Keep the recurring loop active while criteria are unmet. Once all evidence is present, report readiness and request owner approval **before** pausing the loop or switching focus to Lead-to-Revenue Automation.
