# Testing

This folder holds Thread Splitter's automated tests and testing documentation. The planned scope and implementation sequence are in [TESTING_PLAN.md](TESTING_PLAN.md).

## Current state

Playwright Test and TypeScript are installed as development dependencies. The Playwright configuration is in [`playwright.config.ts`](../playwright.config.ts); it looks for tests in this folder and serves the project locally with Python's HTTP server.

Run the suite with `npm test`. The smoke test in [`splitting.spec.ts`](splitting.spec.ts) opens the app in Chromium. It does not assert splitting behavior yet.
