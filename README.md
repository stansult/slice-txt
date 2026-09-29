# Thread Splitter

Thread Splitter is a lightweight, browser-only tool that turns long text into thread-ready parts while keeping each part within a character limit. It prioritizes sentence boundaries, falls back to words, and finally graphemes when needed, with options that match common social-platform constraints.

Live demo: https://thread-splitter.netlify.app/  
Custom domain: https://thread-splitter.stansult.com

## Features

- Auto or manual splitting with a configurable max character count.
- Emoji-aware length counting (grapheme-based).
- Optional URL-as-23 counting (X/Twitter-style).
- Counter placement before/after, with parentheses and optional new lines.
- Blank-line handling to force new parts.
- Optional continuation markers for non-final parts.
- Per-part max overrides for finer control.
- Optional typography processing for quotes, dashes, and spacing.
- Copy per part, copy all, or export JSON.
- Text is processed in the browser and is not sent to a server.

## Usage

- Open `site/index.html` in a browser.
- Paste or type your text.
- Adjust options as needed, then copy or export the parts.

## Tests

See [tests/README.md](tests/README.md) for the current test status and how to run the Playwright suite.

## Build version

- GitHub Actions runs `scripts/write_build_info.sh` before deployment to write the deployed commit SHA to `site/build.txt`.
- `site/build.txt` is generated output and is ignored by Git; local runs show the `(local)` fallback when it is absent.
