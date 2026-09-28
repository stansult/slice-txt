# Testing

This folder holds Thread Splitter's automated tests and testing documentation. The planned scope and implementation sequence are in [TESTING_PLAN.md](TESTING_PLAN.md).

## Current state

Playwright Test and TypeScript are installed as development dependencies. The Playwright configuration is in [`playwright.config.ts`](../playwright.config.ts); it looks for tests in this folder and serves the project locally with Python's HTTP server.

Run the suite with `npm test`. The runner and local server have been verified, but no test cases have been added yet, so the command currently reports `No tests found`.
