# Testing

This folder holds Thread Splitter's automated tests and testing documentation. The planned scope and implementation sequence are in [TESTING_PLAN.md](TESTING_PLAN.md).

## Current state

Playwright Test and TypeScript are installed as development dependencies. The Playwright configuration is in [`playwright.config.ts`](../playwright.config.ts); it looks for tests in this folder and serves the project locally with Python's HTTP server.

Run the local suite with `npm test`. The smoke test in [`smoke.test.ts`](smoke.test.ts) verifies that the app opens in Chromium. The splitting tests in [`splitting.spec.ts`](splitting.spec.ts) apply selected option scenarios to reusable inputs from [`fixtures/text-cases.ts`](fixtures/text-cases.ts). Current scenarios cover the 50- and 280-character limits, counter formatting, arrow and ellipsis continuation, and URL-as-23 counting. Inputs are synthetic ASCII examples plus a URL boundary case; the suite does not yet independently verify full Twitter/X counting or real-world examples.

The GitHub Actions workflow in [`playwright.yml`](../.github/workflows/playwright.yml) runs tests on pushes to `main` and pull requests targeting `main`. For site-file changes on `main`, it deploys to Netlify only after tests pass. Netlify's automatic Git builds are stopped; GitHub Actions is the production deploy owner.

After a production deploy, the workflow runs `npm run verify:deploy`. The separate [`playwright.deploy.config.ts`](../playwright.deploy.config.ts) and [`production-footer.spec.ts`](post-deploy/production-footer.spec.ts) poll the live `build.txt` for the pushed commit SHA, then verify that the production footer shows that SHA and a timestamp. To run this check locally, set `PRODUCTION_URL` and `DEPLOY_SHA` to a live site URL and its full deployed commit SHA, for example: `PRODUCTION_URL=https://thread-splitter.stansult.com DEPLOY_SHA=<full-commit-sha> npm run verify:deploy`.
