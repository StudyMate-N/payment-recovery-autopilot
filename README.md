# Payment Recovery Autopilot

Standalone prototype and automated quality-review foundation. **Not production-ready.**

## Safety
Do not upload real customer or financial data. No server authentication, persistence, bank reconciliation, or automatic message delivery.

## Run
Open index.html or use npm run serve. Run npm run check for initial smoke tests.

## Engineering
See docs/CONTINUOUS-ENGINEERING.md. GitHub Actions checks every 15 minutes, but does **not** autonomously write code. A persistent agent worker requires a separate, secure hosted runtime and explicitly configured credentials.
