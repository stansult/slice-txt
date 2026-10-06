# Testing

This folder holds Thread Splitter's automated tests and their strategy, usage, and current coverage.

## Getting started

Prerequisites: Node.js 24, npm, and Python 3. From the repository root, install dependencies and the Chromium browser once:

```sh
npm ci
npx playwright install chromium
```

Run the complete suite with `npm test`. To run one spec, use `npm test -- tests/splitting.spec.ts`; to filter by test name, use `npm test -- --grep "URL weighting"`. Add `--headed --debug` to inspect a filtered run in a visible browser, for example `npm test -- --grep "URL weighting" --headed --debug`. Playwright may also run the smoke tests as project dependencies when a filtered test is selected.

## Test design

- Keep the application in vanilla JavaScript; use TypeScript for Playwright tests and configuration.
- Test observable, user-facing behavior with accessible locators and explicit expected results.
- Keep reusable input data, option scenarios, and selected data/scenario pairings separate. Add intentional combinations; do not generate the full Cartesian product.
- Name each scenario and run to reflect the options it actually enables. Assertions should apply only to behavior enabled by that run.
- Keep tests independent of external services and production data. Debug unexpected failures by inspecting the selected input, options, and rendered output before changing assertions or product code.
- Add abstractions only when they reduce meaningful duplication. Consider unit tests or extracting application logic only if browser tests prove awkward to isolate or diagnose.

## Coverage direction

Prioritize user-visible behavior in these areas:

- Splitting correctness: exact part contents, lossless reconstruction where applicable, word boundaries and grapheme-safe fallback.
- Length accounting: displayed limits, counter/continuation overhead, and weighted URL behavior.
- Input workflows, option behavior and persistence, per-part overrides, and output actions.
- Desktop and mobile Chromium behavior, with each platform's smoke test gating only its own full suite.

Do not promise or test sentence-boundary preference; splitting is greedy at word boundaries with grapheme fallback. Current gaps include real-world text examples, broader browser-engine coverage, and lower-priority button-state combinations.

## Current state

Playwright Test and TypeScript are installed as development dependencies. The Playwright configuration is in [`playwright.config.ts`](../playwright.config.ts); it looks for tests in this folder and serves the project locally with Python's HTTP server. `npm test` runs a smoke check in desktop Chromium and the fixed Pixel 7 mobile Chromium profile (412×839 CSS-pixel viewport). Each smoke check gates its matching full browser suite; a failure on one platform does not prevent the other platform's suite from running. Other untagged tests run in both projects. Add `{ tag: '@desktop' }` to a test to run it only on desktop, or `{ tag: '@mobile' }` to run it only on mobile. For example, `test('mobile menu works', { tag: '@mobile' }, ...)`. The same tags control selection in local runs and GitHub Actions.

The browser suite currently contains one smoke test per Chromium profile, fourteen selected splitting runs per profile, four help-section tests per profile, two help-button tests total, two tooltip tests total, five input-workflow tests per profile, five options tests per profile, three stress tests per profile, one per-part-limit test per profile, and five output-action tests per profile (80 executions when all pass). The smoke test in [`smoke.test.ts`](smoke.test.ts) verifies that the app opens and renders its main UI in both Chromium profiles; each smoke run gates its matching platform suite. The splitting tests in [`splitting.spec.ts`](splitting.spec.ts) use reusable inputs and option scenarios from [`fixtures/text-cases.ts`](fixtures/text-cases.ts), asserting exact outputs and displayed lengths for 50- and 280-character boundaries, family and varied grapheme clusters, counter formatting, arrow and ellipsis continuation, and URL counting on multiple punctuated URLs both enabled and disabled. Other coverage includes automatic and manual splitting, Clear, raw-grapheme input counts, blank-line splitting, typography cleanup and opt-in, Reset, option persistence, per-part limits, large-input behavior, copy and JSON export, tooltips, help content, and help-button navigation. Inputs are synthetic; real-world examples remain uncovered. This is browser-level coverage; there is no separate unit-test suite.

[`what-this-tool-does.spec.ts`](what-this-tool-does.spec.ts) checks that the “What this tool does” section opens and displays its exact text on empty and long-output pages, with Advanced options both on and off. The long-output cases also verify that reaching the section scrolls the page.

The option stress test uses approximately 44,000 characters and checks reconstructed output and part limits after every typography, continuation, and numbering toggle.

The GitHub Actions workflow in [`playwright.yml`](../.github/workflows/playwright.yml) runs tests on pushes to `main` and pull requests targeting `main`, using Node.js 24 and Chromium. On pushes to `main`, it deploys to Netlify only after tests pass and only if one of these files changed: `site/index.html`, `site/app.js`, `site/styles.css`, `scripts/write_build_info.sh`, or `netlify.toml`. Test- and documentation-only changes do not trigger a production deploy. Netlify's automatic Git builds are stopped; GitHub Actions is the production deploy owner.

The deploy job is configured to run `npm run verify:deploy` after a site-changing production deploy. The separate [`playwright.deploy.config.ts`](../playwright.deploy.config.ts) and [`production-footer.spec.ts`](post-deploy/production-footer.spec.ts) poll the live `build.txt` for the pushed commit SHA, then verify that the production footer shows that SHA and a UTC timestamp. To run it locally, set `PRODUCTION_URL` and `DEPLOY_SHA` to a live site URL and its full deployed commit SHA, for example: `PRODUCTION_URL=https://thread-splitter.stansult.com DEPLOY_SHA=<full-commit-sha> npm run verify:deploy`.

The Playwright HTML reporter runs alongside the terminal list reporter and does not open a browser automatically. Each non-cancelled GitHub Actions test run uploads the report as the `playwright-report` artifact, including when tests fail. Find it in the workflow run's **Artifacts** section on the GitHub Actions run page; artifacts are retained for 30 days. Download and extract the artifact, then open it with `npx playwright show-report <path-to-extracted-report>`.

## Troubleshooting

If a test suggests the local server failed or served a bad response, first temporarily comment out or remove `stderr: 'ignore'` from [`playwright.config.ts`](../playwright.config.ts), then rerun `npm test` to reveal the Python server's diagnostic output. Restore the setting afterward if you want routine request logs hidden again.
