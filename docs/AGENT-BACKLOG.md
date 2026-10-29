# Current MVP agent backlog

Source of truth for small, reviewable engineering increments. The coding agent must pick only **one** unchecked item per run, write tests, and mark it checked **within the same PR** once implemented and tested.

- [ ] Improve the highest-risk unverified invoice workflow and add deterministic tests beyond what existing open PRs cover.
- [ ] Add a prioritised "Needs attention" queue for overdue invoices with clear non-misleading statuses.
- [ ] Implement draft-only reminder history and auditable *local demo* activity tracking.
- [ ] Improve responsive mobile layout and keyboard navigation using verified browser screenshots.
- [ ] Prepare a threat model and technical design for secure authenticated multi-tenant storage (no real data until approved).
- [ ] Implement verified backend authentication and tenant isolation **only after approval and secure credentials are provisioned**.
- [ ] Build trustworthy payment verification and controlled consent-based outbound messaging **only after integration and compliance review**.

## Release gate
Not ready until independent browser QA, secure authentication, per-organization data isolation, verified settlement status, accessibility checks, restore/backup validation, and at least a small real-user pilot are complete.
