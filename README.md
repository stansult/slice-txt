# Thread Splitter

Thread Splitter is a lightweight, browser-only tool that turns long text into thread-ready parts while keeping each part within a character limit. It prioritizes sentence boundaries, falls back to words, and finally graphemes when needed, with options that match common social-platform constraints.

Live demo: https://slice-txt.netlify.app/

## Features

- Auto or manual splitting with a configurable max character count.
- Emoji-aware length counting (grapheme-based).
- Optional URL-as-23 counting (X/Twitter-style).
- Counter placement before/after, with parentheses and optional new lines.
- Blank-line handling to force new parts.
- Optional continuation markers for non-final parts.
- Per-part max overrides for finer control.
- Copy per part, copy all, or export JSON.
- Runs entirely in the browser; no network calls.

## Usage

- Open `index.html` in a browser.
- Paste or type your text.
- Adjust options as needed, then copy or export the parts.

## Roadmap

- Host at `stansult.com/slice-txt` or `slice-txt.stansult.com`.
