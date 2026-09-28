# Repository Guidance

## Testing

- Read [tests/TESTING_PLAN.md](tests/TESTING_PLAN.md) before designing or changing tests, and [tests/README.md](tests/README.md) for the implemented test status and commands.
- Keep the application in vanilla JavaScript; use TypeScript for Playwright tests and configuration.
- In `tests/fixtures/text-cases.ts`, keep reusable text inputs, option scenarios, and the explicitly selected `splittingRuns` pairings distinct. Add only intentional combinations; do not generate the full Cartesian product.
- Name each scenario and run to reflect the options it actually enables. Assertions should apply only to behavior enabled by that run.
- The user is learning Playwright and prefers to author tests. Explain and guide step by step; modify test code when explicitly requested.
- If a test behaves unexpectedly, share the exact run, configuration, and observed output, then debug the cause with the user before changing the test or application.
