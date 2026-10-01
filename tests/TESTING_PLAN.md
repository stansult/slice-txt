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
- Run untagged tests in both desktop Chromium and the fixed Pixel 7 mobile Chromium profile. Use Playwright's separate `{ tag: '@desktop' }` or `{ tag: '@mobile' }` test details for platform-specific tests, keeping test names focused on behavior.
- Run the smoke test in desktop and mobile setup projects, with each platform's full suite depending only on its matching smoke test.

## Coverage priorities

Add coverage in deliberate, user-visible increments; do not generate every option permutation.

1. **Core split correctness:** assert exact parts for representative inputs, preserve the complete normalized input across parts, verify greedy word-boundary splitting with grapheme fallback for overlong tokens, and include grapheme-safe splitting for emoji and other multi-code-point characters. Do not promise or test sentence-boundary preference; the current behavior does not guarantee it.
2. **Length accounting:** assert the displayed length and limit for each part, including counter/continuation overhead. Make the URL-as-23 case distinguish weighted counting from ordinary character counting, and test URL counting disabled. Include a boundary that demonstrates grapheme-aware counting.
3. **Input workflow:** cover auto-split while typing, manual Split mode, toggling between modes, and Clear removing both input and output.
4. **Option behavior and persistence:** cover blank-line-starts-new-part, representative typography transformations with typography off/on, Reset restoring defaults, and saved options surviving reload.
5. **Per-part max override:** change a part's limit and verify resulting output and enforcement of global/minimum bounds.
6. **Output actions and UI state:** verify per-part Copy and Copy all contents, JSON export content, relevant buttons' empty/disabled states, and the emoji/URL length tip.

Keep assertions focused on the selected run's enabled behavior. For text-processing tests, use explicit expected output rather than only checking that the number or size of parts appears plausible.

### Current gaps

- All selected splitting runs now assert exact part contents and displayed lengths, including word-boundary splits, counter/continuation formatting, URL counting on/off, and a family-emoji grapheme boundary. Input reconstruction is checked where the formatting permits it. Additional grapheme-boundary cases and real-world text remain useful.
- Input workflow tests cover auto-splitting while typing, manual splitting on request, switching back to auto mode, and Clear removing both the input and generated output.
- The options suite covers blank-line behavior, typography opt-in, Reset defaults, and persistence after reload. Per-part-limit coverage verifies splitting changes and clamping to the global and minimum limits. Output-action coverage verifies action-button availability, clipboard contents, JSON export, and emoji/URL length tips. Additional grapheme-boundary cases remain useful.
- URL-as-23 and URL-counting-disabled runs now use the same input to verify that weighting changes both the split and displayed length.
- The smoke test verifies that the app opens and renders its main heading in desktop and mobile Chromium. Separate help-section tests verify the “What this tool does” disclosure and its text across empty/long-output pages with Advanced options on/off; help-button navigation is covered on desktop and mobile. Tooltip behavior is covered for desktop hover/focus and mobile info-button use, including checking that the info button does not activate its associated control. Copy-all and JSON-export empty states are covered; other button-state combinations are not a current priority.
- The production footer verification passed locally against the live site. Its first run inside GitHub Actions after a production deploy is still pending.

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
4. [✓] Expand coverage from user-visible behavior and refine structure only when useful.
5. [✓] Add the GitHub Actions workflow configuration.
6. [✓] Verify the GitHub-hosted test workflow and test-gated production deploy.
7. [Local ✓] Add and verify post-deploy commit and footer checks locally; verify the check in GitHub Actions after a production deploy.
8. [✓] Document the current commands, coverage, and deployment-gating decision.
