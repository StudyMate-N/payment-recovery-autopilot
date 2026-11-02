# GitHub CI compute review — 2026-11-02

## Finding
The main quality workflow (`.github/workflows/quality.yml`) was configured with `*/15 * * * *`, a **96-per-day scheduled trigger** even when the repository source had not changed. It also ran on every branch push and on pull requests, producing duplicate CI runs for many feature-branch commits. The daily independent product quality review already inspects code, PRs, tests and deployments; unchanged-source 15-minute Node checks add little useful signal.

## Proposed change
Remove the 15-minute schedule and restrict `push` checks to `main`. Keep `pull_request` checks and `workflow_dispatch` manual checks. This preserves release gating on proposed changes and main while reducing redundant executions.

**Projected trigger reduction:** up to 96 scheduled runs/day (~2,880/30-day month), before considering any GitHub scheduler delays, skipped/cancelled jobs or additional PR events. These are *theoretical scheduled triggers*, not measured billed compute minutes or dollars. GitHub Actions pricing depends on repository visibility, runner type and account policy; no dollar saving is asserted.

## Verification and scope
- Review branch: `chore/ci-on-change-only`; no product code or tests changed.
- CI on this PR must pass before merge; the main-branch workflow remains unchanged until approved.
- The change does not pause the user's independent daily quality-review automation or the separate opt-in coding-agent proposal in PR #4.
- Do not merge automatically. Human review required.

## Release status
**NOT READY** — CSV import/export and reminder fixes, browser QA, secure persistence, authentication, tenant isolation, bank-confirmed settlement, approvals, accessibility acceptance, security review and five-business pilot remain unverified or unmerged.
