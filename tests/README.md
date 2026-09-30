# Testing

This folder holds Thread Splitter's automated tests and testing documentation. The planned scope and implementation sequence are in [TESTING_PLAN.md](TESTING_PLAN.md).

## Current state

Playwright Test and TypeScript are installed as development dependencies. The Playwright configuration is in [`playwright.config.ts`](../playwright.config.ts); it looks for tests in this folder and serves the project locally with Python's HTTP server.

Run the local suite with `npm test`. It currently contains one smoke test and nine selected splitting runs. The smoke test in [`smoke.test.ts`](smoke.test.ts) verifies that the app opens in Chromium. The splitting tests in [`splitting.spec.ts`](splitting.spec.ts) use reusable inputs and option scenarios from [`fixtures/text-cases.ts`](fixtures/text-cases.ts), covering 50- and 280-character limits, counter formatting, arrow and ellipsis continuation, and a URL-as-23 option scenario. The minimum word-boundary run asserts its exact parts and reconstructs the input from them; other runs currently check for multiple parts and compare each part's JavaScript string length to the configured limit. The suite does not yet verify the app's weighted displayed lengths. In particular, the URL scenario does not yet prove weighted counting changes a boundary or reported length. Inputs are synthetic and mostly ASCII; real-world examples and emoji/grapheme boundaries are not covered.

The GitHub Actions workflow in [`playwright.yml`](../.github/workflows/playwright.yml) runs tests on pushes to `main` and pull requests targeting `main`. For site-file changes on `main`, it deploys to Netlify only after tests pass. Netlify's automatic Git builds are stopped; GitHub Actions is the production deploy owner.

The deploy job is configured to run `npm run verify:deploy` after a site-changing production deploy. The separate [`playwright.deploy.config.ts`](../playwright.deploy.config.ts) and [`production-footer.spec.ts`](post-deploy/production-footer.spec.ts) poll the live `build.txt` for the pushed commit SHA, then verify that the production footer shows that SHA and a timestamp. This check passed locally against the live site; its first post-deploy run in GitHub Actions is pending. To run it locally, set `PRODUCTION_URL` and `DEPLOY_SHA` to a live site URL and its full deployed commit SHA, for example: `PRODUCTION_URL=https://thread-splitter.stansult.com DEPLOY_SHA=<full-commit-sha> npm run verify:deploy`.

See [TESTING_PLAN.md](TESTING_PLAN.md) for the prioritized coverage gaps and planned additions.
