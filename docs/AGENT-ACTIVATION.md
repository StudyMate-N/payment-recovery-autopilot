# Activating the review-gated Codex loop

**Status:** The code is prepared. It does not automatically start spending money or writing code until authorized configuration is complete.

1. Merge the agent-sweep pull request only after reviewing its workflow permissions.
2. Resolve and merge/reject outstanding human PRs so the queue is clear.
3. In GitHub **Settings > Secrets and variables > Actions**, add a **repository secret** named `OPENAI_API_KEY` using a separate, capped OpenAI API project. Never paste the key in an issue, PR, commit or chat.
4. In the same GitHub area, add an **Actions repository variable** `AGENT_ENABLED` with value `true`. Set `false` to pause new Codex cycles.
5. In repository **Settings > Actions > General**, make sure workflow pull-request creation permissions are configured appropriately. The second job needs `contents: write` and `pull-requests: write`; the model job has read-only GitHub permissions.
6. Test with **Actions > Current agent iteration (review gated) > Run workflow** and inspect the full run before relying on the schedule.
7. Keep API usage budget limits, GitHub Actions minutes and account charges monitored externally.

Each run skips if any PR is open, or the backlog is complete. When enabled, the schedule checks every 15 minutes on a best-effort basis and produces at most one *review-only PR* per iteration. It is not a persistent always-on process or an unrestricted self-merging agent. GitHub schedules may be delayed. Do not provide production credentials to model jobs.

## Security controls
- No secrets embedded in the source repository.
- Model job has `contents: read`, no GitHub write token.
- Patch artifact passed to separate job without model credential.
- Excludes `.github` and `AGENTS.md` from automated patches.
- Patch size capped at 120 KB.
- Max runtime 25 min for the coding step.
- Requires explicit PR review; never automatically deploys main.
- Stops generating while any PR is open.

## Production readiness
This is a prototype with fictitious data only. Do not use with real invoice records until authenticated storage, tenant isolation, secure audit trails and payment reconciliation are verified.
