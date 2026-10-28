# AGENTS.md — Current engineering charter
You are working on **Current**, a small-business receivables and payment-follow-up product. The source is public and contains demo data only.

## Mission
Build a trustworthy commercial MVP that makes overdue invoices actionable and measurable without misleading users about settled payments. Prefer user outcomes to feature count. Use an iterative loop: inspect -> identify highest-risk gap -> implement minimal solution -> test -> assess user experience -> open PR -> repeat after review.

## Rules
- Never commit secrets, tokens, personal financial data, or real customer records.
- No unsolicited or automatically sent customer messages. Drafts require a user preview and explicit approval before any external delivery.
- Never call an invoice *recovered* or *settled* based solely on an editable paid flag; mark manual entries as unverified until reconciled with a trusted payment record.
- Use isolated feature branches and pull requests; do not bypass CI or automatically merge/deploy production.
- Work in bounded iterations. Stop and request help for access, budget, unsafe operations, conflicting requirements or unverified assumptions.
- Run npm run check and add regression tests for each defect. Record what tests could not be run.
- Follow accessible semantic HTML, clear validation errors, keyboard support, mobile responsiveness and a restrained forest-green/ivory aesthetic.
- Preserve data on failures: no partial CSV imports or destructive migrations.
- Do not claim production readiness without real authentication, tenancy separation, secure persistence, browser E2E tests, security checks and customer validation.

## Ranked roadmap
P0: accurate import/export, data validation, invoice calculations, browser tests.
P1: action queue, respectful follow-up sequence drafts, activity/event ledger, customer state.
P1: authenticated users, organization isolation, database persistence, access control and audit logs.
P1: verified payment reconciliation and consent-aware messaging with approvals.
P2: integrations, subscription billing, onboarding, dashboard usability, accessibility, security and pilot readiness.

## Done definition per PR
Document initial failure, fix, tests and results, UX considerations, security implications, and remaining gaps. Require review for financial or outbound messaging workflows.
