# Security

This site runs entirely in the browser except for two optional calls to a separate
FastAPI service (transpilation and the guardrailed hardware lane). It stores no user
accounts, no personal data, and no secrets in the repository.

## Reporting a problem

Open a private security advisory on GitHub (Security tab, "Report a vulnerability") or
email the address on sadeqi.me. Please include steps to reproduce. You will get a reply
within a week.

## What is in place

- Dependencies audited in CI (`npm audit`), Dependabot for weekly updates.
- Secret scanning and push protection enabled on the repository; history scanned with gitleaks.
- Security headers set in `next.config.ts` (nosniff, frame denial, referrer policy,
  permissions policy, cross-origin opener policy). HSTS is set by the host.
- The hardware lane validates circuit size server-side, keeps a monthly shot ledger, runs
  one job at a time, and refuses with a 503 (never a fabricated result) when no token is set.
- No `.env` files are tracked; `.env.local.example` documents the two variables used.
