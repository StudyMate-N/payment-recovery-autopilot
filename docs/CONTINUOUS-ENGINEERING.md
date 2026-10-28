# Continuous engineering — operational contract
The scheduled GitHub Action runs quality checks at best-effort 15-minute intervals. This **does not** deploy a continuous coding agent. GitHub may delay or disable schedules and billing limits apply.
## Release gates
1. End-to-end browser tests on desktop and mobile.
2. Server-side authentication, tenancy isolation, authorization, auditability and backups.
3. No automatic customer-facing messages without approval and verified consent.
4. All invoices reconcile to verified financial records; 'mark paid' is only manual assertion.
5. No critical security vulnerabilities; dependency, accessibility and performance checks.
6. Five pilot businesses complete their workflows, with logged feedback and willingness-to-pay validation.
## Worker requirements
An always-on host, separate short-lived GitHub credentials, bounded coding agent, token budget, rate and attempt limits, error notifications, isolated branches and human-reviewed pull requests. Never give an untrusted agent access to production secrets or deployment credentials.
## Workflow cadence
Observe issue -> create isolated change -> test -> browser review -> security review -> PR -> human approval -> deploy preview -> measure -> repeat. Do not merge automatically or declare readiness from a passing smoke test.
