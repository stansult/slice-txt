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

## Test authoring and debugging

- Understand the user-visible behavior and relevant constraints before choosing test inputs or expected results.
- Keep reusable text data, option scenarios, and the explicitly selected data/scenario runs separate; avoid generating every possible combination.
- Make assertions conditional on the options enabled for that run. Do not assert markers, counters, or formatting that the scenario has disabled.
- When a test fails unexpectedly, inspect the selected data, scenario settings, and rendered output before changing the test or application. Distinguish setup/assertion mismatches from product defects using observed evidence.
- Debug unexpected behavior collaboratively before changing the test or product code; explain what failed and why before proposing a fix.

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

- Run the automated suite in GitHub Actions on pull requests and pushes to the primary branch. The workflow is configured in `.github/workflows/playwright.yml` for pushes to `main` and pull requests targeting `main`.
- Use Node.js 24, install dependencies with `npm ci`, install Chromium and its system dependencies, then run the same `npm test` command used locally. This has passed in GitHub Actions.
- On successful pushes to `main`, GitHub Actions deploys `site/` to Netlify only when a site source file, the build metadata script, or `netlify.toml` changes. The workflow generates `site/build.txt`, uploads the prebuilt site with the Netlify CLI, and supplies the commit subject as the deploy message.
- Netlify's automatic Git builds are stopped so tested GitHub Actions runs are the sole production deployment path. Netlify's ignore rule remains configured for when automatic builds are re-enabled.
- After a production deploy, a separate Playwright check waits for the live `build.txt` to report the pushed commit, then verifies the footer displays that commit and a valid build timestamp.

## Usage documentation

- Document prerequisites, dependency installation, local test commands, CI behavior, and how to inspect failure artifacts.
- Keep coverage descriptions and known limitations aligned with the tests as they are added.

## Implementation sequence

1. [✓] Add Playwright and TypeScript tooling.
2. [✓] Verify the browser opens the locally served app with a smoke test.
3. [✓] Write and run a core workflow test locally, asserting its rendered splitting results.
4. Expand coverage from user-visible behavior and refine structure only when useful.
5. [✓] Add the GitHub Actions workflow configuration.
6. [✓] Verify the GitHub-hosted test workflow and test-gated production deploy.
7. Add and verify post-deploy commit and footer checks in GitHub Actions.
8. [✓] Document the current commands, coverage, and deployment-gating decision.
