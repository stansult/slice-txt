# Testing

This folder holds Thread Splitter's automated tests and testing documentation. The planned scope and implementation sequence are in [TESTING_PLAN.md](TESTING_PLAN.md).

## Current state

Playwright Test and TypeScript are installed as development dependencies. The Playwright configuration is in [`playwright.config.ts`](../playwright.config.ts); it looks for tests in this folder and serves the project locally with Python's HTTP server.

Run the suite with `npm test`. The smoke test in [`smoke.test.ts`](smoke.test.ts) verifies that the app opens in Chromium. The splitting tests in [`splitting.spec.ts`](splitting.spec.ts) apply selected option scenarios to reusable inputs from [`fixtures/text-cases.ts`](fixtures/text-cases.ts). Current scenarios cover the 50- and 280-character limits, counter formatting, arrow and ellipsis continuation, and URL-as-23 counting. Inputs are synthetic ASCII examples plus a URL boundary case; the suite does not yet independently verify full Twitter/X counting or real-world examples.

The GitHub Actions workflow in [`playwright.yml`](../.github/workflows/playwright.yml) runs on pushes to `main` and pull requests targeting `main`. It uses Node.js 24, installs dependencies with `npm ci`, installs Chromium and its system dependencies, and runs `npm test`. The workflow configuration is in place; its first GitHub-hosted run is still pending.
