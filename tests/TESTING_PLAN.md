# Test Automation Plan

## Goals and scope

- Build a portfolio-quality automated test setup for Thread Splitter using Playwright and TypeScript.
- Cover important user-visible behavior in a real browser, including splitting, typography, clearing input, and resetting options.
- Run the suite locally and in GitHub Actions so pull requests and pushes receive automated checks.
- Keep tests focused on behavior users rely on; document meaningful coverage gaps.

## Tooling

- Use Playwright Test with TypeScript for browser automation.
- Keep the application in vanilla JavaScript; TypeScript is for test and Playwright configuration files.
- Add tooling only when a concrete test or workflow needs it.

## Structure and design

- Start with one end-to-end test that launches the existing app, exercises a core workflow, and verifies rendered output.
- Let the first tests determine the smallest useful test layout and shared helpers.
- Prefer accessible, user-facing locators and observable outcomes over implementation details.
- Add abstractions only when repeated test code or a clear maintenance need justifies them.
- Consider direct unit tests for splitting or typography logic if browser tests prove awkward to isolate or diagnose; do not extract application code solely to satisfy a test structure.

## Test data and environment

- Serve the actual project files locally over HTTP for browser tests.
- Use explicit, small input examples with expected output so results are repeatable and easy to understand.
- Keep tests independent of external services and production data.
- Make browser setup work consistently on a developer machine and GitHub Actions.

## Reporting and debugging

- Configure Playwright to provide useful failure output and retain traces or reports when a test fails in CI.
- Document how to open and inspect those artifacts.
- Keep reporting configuration proportional to the size of the suite.

## Continuous integration

- Run the automated suite in GitHub Actions on pull requests and pushes to the primary branch.
- Install project dependencies and the required Playwright browser in CI, then run the same test command used locally.
- Decide separately whether production deployment must wait for passing tests. Netlify currently deploys directly from GitHub, so adding a GitHub Actions test workflow alone will not gate Netlify deployment.

## Usage documentation

- Document prerequisites, dependency installation, local test commands, CI behavior, and how to inspect failure artifacts.
- Keep coverage descriptions and known limitations aligned with the tests as they are added.

## Implementation sequence

1. [✓] Add Playwright and TypeScript tooling.
2. [✓] Verify the browser opens the locally served app with a smoke test.
3. Write and run one core workflow test locally, asserting its rendered splitting results.
4. Expand coverage from user-visible behavior and refine structure only when useful.
5. Add the GitHub Actions workflow and verify its results.
6. Document the finished commands, coverage, and any deployment-gating decision.
