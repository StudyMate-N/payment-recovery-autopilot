# Activate Current's cost-controlled engineering loop

**Current state: NOT ACTIVE.** The GitHub coding worker requires an external OpenAI API project, project-scoped key, enforced spend limit, and explicit opt-in. This project is public; never commit keys, customer data, or real invoices.

## Why the ChatGPT allowance cannot fund this Action
A ChatGPT subscription and the OpenAI API are billed separately. No tool in this session can inspect your personal ChatGPT compute usage or API billing/project limit. The suggested amount below is a conservative **new API pilot budget**, not a claimed account balance.

## Proposed initial controls
- Dedicated OpenAI API project: `current-coding-agent`.
- Project **Monthly spend limit: USD 10**; enable **Enforce a hard limit**.
- Spend alerts at approximately **USD 5 and USD 8**.
- Disable prepaid auto-recharge or use an independently approved low recharge cap.
- Only allow `gpt-5.3-codex` for the pilot; request-rate caps as the project permits.
- GitHub workflow: at most **two paid attempts in any rolling 24-hour period**, including no-patch and failed cycles. A public GitHub issue named `Current agent compute ledger` logs reservations, **not invoice-based API charges**.
- Each coding job times out after 15 minutes; new cycles only when **zero pull requests** are open. No auto-merge, customer emails, payment changes, or production releases.
- The schedule checks every 15 minutes at GitHub's best-effort cadence; only eligible cycles invoke a model. GitHub Actions minutes and Vercel previews have their own separate usage/charges.

The 2/day count limits invocations, **not tokens or dollars per invocation**. Cost caps must be applied at the API project as well. Enforcement/reporting can lag slightly.

## Activate using account settings (do not paste keys in chat)
1. Sign in to [OpenAI API Platform](https://platform.openai.com/) and create the dedicated `current-coding-agent` project if permitted. Fund it separately if it has no usable API balance.
2. Go to organization settings > Projects > `current-coding-agent` > **Limits**. Set monthly spend to **$10**, enable **Enforce a hard limit**, and configure alerts at $5 and $8. Confirm model access and actual account usage/rate limits. If you cannot set a hard limit, **do not activate**.
3. Create a **project-scoped** API key for the project at [API keys](https://platform.openai.com/api-keys). Prefer the least privileges compatible with running Codex Responses requests.
4. Add the credential directly to this repository's **Settings > Secrets and variables > Actions > Secrets**, named `OPENAI_API_KEY`. Do not put it in a repo file, Vercel public env variable, issue, or chat.
5. After reviewing/merging PR #4 and clearing other open PRs, set **Actions variables** `API_HARD_CAP_CONFIRMED=true` only after verifying the $10 hard cap in the API Platform, and `AGENT_ENABLED=true` to opt in. Leave both unset or false until all controls and permissions are verified. Change to false to pause.
6. Under GitHub **Settings > Actions > General**, verify appropriate workflow permissions for opening review-only PRs. Use protected branches and human approval; the gate logs run reservations through an issue.
7. Start one manual workflow run, verify it creates exactly one review PR without secrets, and inspect OpenAI API Usage/Billing. Stop and repair if any check fails.

## Security architecture
- The model runs in a restricted workspace job with `contents: read`, `drop-sudo`, low effort, and a bounded time.
- The patch runs automated verification in a **separate, read-only GitHub token job**, with **no model credential**.
- Only after validation succeeds does a **separate** job obtain `contents: write` and `pull-requests: write`; that job **never executes model-edited code**.
- Protected files `.github/**`, `AGENTS.md`, and env files are rejected from automated patches. Changes require separate reviewed human PRs.
- Automated code is never merged or promoted to production without review; GitHub Actions/workflow permissions and budget settings are external controls.

## Release gates
This is a demonstration with fictional data. Do not use real financial records until secure authentication, tenancy isolation, protected persistence, compliance-reviewed messaging, settlement reconciliation, end-to-end browser QA, security review, and customer validation pass.
