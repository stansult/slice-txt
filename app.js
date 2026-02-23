(function () {
  // Minimum allowed characters for both global max and per-part max
  const MIN_CHARS = 50;
  const APP_VERSION = '0.1.0';

  // =========================
  // DOM helpers & elements
  // =========================
  const $ = sel => document.querySelector(sel);

  const el = {
    // input & actions
    input: $('#input'),
    autoBtn: $('#autoBtn'),
    splitBtn: $('#splitBtn'),
    clearBtn: $('#clearBtn'),

    // small hints
    autoHint: $('#autoHint'),
    lengthTip: $('#lengthTip'),

    // output actions
    copyAllBtn: $('#copyAllBtn'),
    exportJsonBtn: $('#exportJsonBtn'),

    // output area
    chunks: $('#chunks'),
    chunkTpl: $('#chunkTpl'),
    summary: $('#summary'),

    // options (primary)
    maxChars: $('#maxChars'),
    useNumbering: $('#useNumbering'),
    counterPlacement: $('#counterPlacement'),
    counterParens: $('#counterParen'),
    counterNewline: $('#counterNewline'),
    doubleBreakNewPost: $('#doubleBreakNewPost'),

    // continuation (advanced)
    useContinuation: $('#useContinuation'),
    continuationMarker: $('#continuationMarker'),

    // per-part max override (advanced)
    perPartMaxOverride: $('#perPartMaxOverride'),

    // url length mode (advanced)
    urlAs23: $('#urlAs23'),

    // advanced visibility
    advBtn: $('#advBtn'),
    optionsResetBtn: $('#optionsResetBtn')
  };

  const OPTION_DEFAULTS = {
    maxChars: 280,
    useNumbering: true,
    counterPlacement: 'after',
    counterParens: false,
    counterNewline: false,
    doubleBreakNewPost: false,
    useContinuation: false,
    continuationMarker: 'arrow',
    perPartMaxOverride: false,
    urlAs23: true,
    advOn: false
  };

  const buildEl = document.getElementById('buildVersion');
  if (buildEl) {
    buildEl.textContent = `v${APP_VERSION} • build (local)`;
    fetch('build.txt', { cache: 'no-store' })
      .then(res => res.ok ? res.text() : '')
      .then(text => {
        const trimmed = String(text).trim();
        if (trimmed) buildEl.textContent = `v${APP_VERSION} • build ${trimmed}`;
      })
      .catch(() => { });
  }

  // Ensure the global max input has correct HTML min
  if (el.maxChars) {
    el.maxChars.min = String(MIN_CHARS);
  }

  // ======================================
  // Option persistence (localStorage)
  // ======================================
  function saveOpts() {
    const keys = [
      'maxChars',
      'useNumbering', 'counterPlacement', 'counterParens', 'counterNewline',
      'doubleBreakNewPost',
      'useContinuation', 'continuationMarker',
      'perPartMaxOverride',
      'urlAs23'
    ];
    const data = {};
    for (const k of keys) {
      if (!el[k]) continue;
      const node = el[k];
      data[k] = node.type === 'checkbox' ? !!node.checked : node.value;
    }
    data.__advOn = el.advBtn ? (el.advBtn.getAttribute('aria-pressed') === 'true') : false;
    localStorage.setItem('xsplit.opts', JSON.stringify(data));
  }

  function loadOpts() {
    try {
      const data = JSON.parse(localStorage.getItem('xsplit.opts') || '{}');
      for (const k in data) {
        if (k === '__advOn') continue;
        if (!el[k]) continue;
        const node = el[k];
        if (node.type === 'checkbox') node.checked = !!data[k];
        else node.value = data[k];
      }
      if (el.advBtn) {
        const on = !!data.__advOn;
        el.advBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        document.body.classList.toggle('advanced', on);
      }
    } catch (_) { }
  }
  loadOpts();

  // ======================================
  // Text helpers
  // ======================================
  const segG = (() => {
    try { return new Intl.Segmenter(undefined, { granularity: 'grapheme' }); }
    catch (_) { return null; }
  })();

  function graphemes(s) {
    if (!s) return 0;
    if (segG) {
      let n = 0;
      for (const _ of segG.segment(String(s))) n++;
      return n;
    }
    return Array.from(String(s)).length;
  }

  const segS = (() => {
    try { return new Intl.Segmenter(undefined, { granularity: 'sentence' }); }
    catch (_) { return null; }
  })();

  function sentencesOf(text) {
    if (segS) return Array.from(segS.segment(text)).map(s => s.segment);
    // fallback
    return String(text).split(/(?<=[\.!?\u203D\u203C\u2047\u2049\u3002\uff01\uff1f])\s+/);
  }

  function digits(n) {
    return String(Math.max(1, Math.floor(Math.abs(n)))).length;
  }

  function wordTokens(text) {
    return String(text).match(/\s+|\S+/g) || [];
  }

  // Twitter / X-like URL detection
  // - http/https URLs
  // - www.*
  // - bare domains like "c.com", "example.org", "foo-bar.net/path"
  const urlRe = /\b(?:https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][\w-]*\.[a-zA-Z0-9][\w-]*(?:\/[^\s]*)?)/g;

  // Whether to count URLs as 23 chars (when true) or as actual graphemes (when false)
  let useUrl23 = true;

  function tweetLen(s) {
    if (!s) return 0;
    const str = String(s);

    // If URL-as-23 mode is off, just use graphemes everywhere
    if (!useUrl23) {
      return graphemes(str);
    }

    let total = 0;
    let last = 0;
    let m;

    urlRe.lastIndex = 0; // reset for each call

    while ((m = urlRe.exec(str)) !== null) {
      const start = m.index;
      let end = start + m[0].length;

      // Count plain text before this URL
      if (start > last) {
        total += graphemes(str.slice(last, start));
      }

      // Trim trailing punctuation that X usually doesn't consider part of the URL
      while (end > start && /[.,!?;:)"'\]]/.test(str[end - 1])) {
        end--;
      }

      if (end > start) {
        // There is a real URL portion → count it as 23
        total += 23;
        // Everything after `end` (including punctuation we trimmed) will be counted later
        last = end;
      } else {
        // After trimming nothing remains → treat match as normal text
        last = start;
      }
    }

    // Remaining non-URL text
    if (last < str.length) {
      total += graphemes(str.slice(last));
    }

    return total;
  }

  // ======================================
  // Normalization
  // ======================================
  function normalize(text) {
    let t = String(text);
    t = t.replace(/[\t\f\v ]+/g, ' ');
    t = t.replace(/ *\n */g, '\n');
    t = t.replace(/\n{3,}/g, '\n\n');
    t = t.trim();
    return t;
  }

  // ======================================
  // Core splitting algorithm
  // ======================================
  function splitGreedy(opts, perPartMaxOverrides) {
    const {
      text,
      maxChars,
      // numbering
      useNumbering,
      placement,        // 'prefix' | 'suffix'
      parens,           // boolean
      newline,          // boolean
      // behavior
      doubleBreakNewPost,
      useContinuation,
      continuationChar
    } = opts;

    const sepSlash = '/';
    const avgDigits = 2; // rough average for initial guess
    const dynBase = avgDigits * 2 + graphemes(sepSlash) + (parens ? 2 : 0) + 1; // +1 for space/newline
    const overheadAvg = useNumbering ? dynBase : 0;

    // Continuation sequence (space + marker), length in graphemes (no URLs here)
    const contSeq = (useContinuation && continuationChar) ? ` ${continuationChar}` : '';
    const contLen = graphemes(contSeq);

    function baseMaxForIndex(i) {
      const override = perPartMaxOverrides && perPartMaxOverrides[i] != null
        ? perPartMaxOverrides[i]
        : maxChars;
      // safety clamp; use shared MIN_CHARS
      return Math.max(MIN_CHARS, override);
    }

    function capacityForIndex(i, N) {
      let cap = baseMaxForIndex(i);

      if (useNumbering) {
        const dynDigits = digits(i + 1) + digits(N);
        let dyn = dynDigits + graphemes(sepSlash);
        if (parens) dyn += 2;
        dyn += 1; // space or newline
        cap -= dyn;
      }

      // Reserve space for continuation marker (for all parts; last one will just have slack)
      if (useContinuation && contLen > 0) {
        cap -= contLen;
      }

      // Never allow 0-capacity; that can cause infinite loops on very small max
      return Math.max(1, cap);
    }

    // Guess N, then refine by re-running with resulting length
    let guessN = Math.max(1, Math.ceil(tweetLen(text) / Math.max(10, (maxChars - overheadAvg))));
    let chunks = [];
    let lastN = 0;
    let guard = 0;

    while (guard++ < 6) {
      chunks = doSplitWithN(text, guessN);
      if (chunks.length === guessN) break;
      lastN = guessN;
      guessN = chunks.length || 1;
      if (guessN === lastN) break;
    }
    return chunks;

    function doSplitWithN(text, N) {
      const parts = [];
      const NL = '\n';
      const NL2 = '\n\n';
      const paragraphs = String(text).split(NL2);
      let i = 0;
      let cur = '';

      for (let p = 0; p < paragraphs.length; p++) {
        const para = paragraphs[p];
        const tokens = sentencesFirst(para);

        if (p < paragraphs.length - 1 && !doubleBreakNewPost) tokens.push(NL2);

        for (let t = 0; t < tokens.length; t++) {
          const tok = tokens[t];
          const cap = capacityForIndex(i, Math.max(1, N));

          if (tweetLen(cur + tok) <= cap) {
            cur += tok;
          } else if (tweetLen(tok) > cap) {
            // split token by graphemes (URLs are \S+ and will never go here,
            // since their tweetLen is 23 and cap >= MIN_CHARS >= 50)
            let remain = tok;
            while (graphemes(remain) > 0) {
              const cap2 = capacityForIndex(i, Math.max(1, N)) - tweetLen(cur);
              if (cap2 <= 0) { parts.push(cur); i++; cur = ''; continue; }
              const slice = sliceGraphemes(remain, cap2);
              cur += slice.taken;
              remain = slice.rest;
              if (graphemes(remain) > 0) { parts.push(cur); i++; cur = ''; }
            }
          } else {
            parts.push(cur); i++; cur = tok;
          }
        }
        if (doubleBreakNewPost) {
          const pushVal = rtrimSpacesLocal(cur);
          if (pushVal) { parts.push(pushVal); i++; }
          cur = '';
        }
      }
      if (cur) { parts.push(rtrimSpacesLocal(cur)); i++; cur = ''; }

      const final = [];
      const Nreal = Math.max(1, parts.length);
      for (let j = 0; j < parts.length; j++) {
        const body = parts[j].trim();
        const labelCore = `${j + 1}/${Nreal}`;
        const display = parens ? `(${labelCore})` : labelCore;
        const isLast = (j === parts.length - 1);

        const baseMax = baseMaxForIndex(j);
        const limit = (useContinuation && !isLast && contLen > 0)
          ? Math.max(1, baseMax - contLen)
          : baseMax;

        let assembled;
        if (useNumbering) {
          if (newline) {
            const sepMain = '\n\n';   // try with blank line
            const sepFallback = '\n'; // fallback if it doesn’t fit

            if (placement === 'prefix') {
              let candidate = `${display}${sepMain}${body}`;
              if (tweetLen(candidate) > limit) {
                candidate = `${display}${sepFallback}${body}`;
              }
              assembled = candidate;
            } else {
              let candidate = `${body}${sepMain}${display}`;
              if (tweetLen(candidate) > limit) {
                candidate = `${body}${sepFallback}${display}`;
              }
              assembled = candidate;
            }
          } else {
            if (placement === 'prefix') {
              assembled = `${display} ${body}`;
            } else {
              assembled = `${body} ${display}`;
            }
          }
        } else {
          assembled = body;
        }

        // trim to limit (before adding continuation), using tweet-style length
        let out = assembled;
        let tries = 0;
        while (tweetLen(out) > limit && tries++ < 10) {
          const bodyOnly = body.replace(/\s+$/, '');
          const cut = bodyOnly.replace(/\s*\S*$/, '').replace(/\s+$/, '');
          if (!cut || cut === bodyOnly) break;
          const newBody = cut;

          if (useNumbering) {
            if (newline) {
              const sepMain = '\n\n';
              const sepFallback = '\n';
              if (placement === 'prefix') {
                let candidate = `${display}${sepMain}${newBody}`;
                if (tweetLen(candidate) > limit) {
                  candidate = `${display}${sepFallback}${newBody}`;
                }
                out = candidate;
              } else {
                let candidate = `${newBody}${sepMain}${display}`;
                if (tweetLen(candidate) > limit) {
                  candidate = `${newBody}${sepFallback}${display}`;
                }
                out = candidate;
              }
            } else {
              if (placement === 'prefix') {
                out = `${display} ${newBody}`;
              } else {
                out = `${newBody} ${display}`;
              }
            }
          } else {
            out = newBody;
          }
        }

        // append continuation marker for non-final parts
        if (useContinuation && !isLast && contLen > 0) {
          if (useNumbering && placement === 'suffix') {
            const idxDisplay = out.lastIndexOf(display);
            if (idxDisplay > 0) {
              const beforeDisplay = out.slice(0, idxDisplay);
              let sepStr = '';

              if (newline) {
                if (beforeDisplay.endsWith('\n\n')) sepStr = '\n\n';
                else if (beforeDisplay.endsWith('\n')) sepStr = '\n';
              } else {
                if (beforeDisplay.endsWith(' ')) sepStr = ' ';
              }

              if (sepStr) {
                const bodyPart = beforeDisplay.slice(0, beforeDisplay.length - sepStr.length);
                out = `${bodyPart}${contSeq}${sepStr}${display}`;
              } else {
                out = `${out}${contSeq}`;
              }
            } else {
              out = `${out}${contSeq}`;
            }
          } else {
            // prefix counter or no numbering: text sits at the end
            out = `${out}${contSeq}`;
          }
        }

        final.push(out.trim());
      }
      return final;
    }

    function sentencesFirst(para) {
      const tokens = [];
      const segs = sentencesOf(para);
      for (const s of segs) {
        const w = wordTokens(String(s));
        for (const wtok of w) tokens.push(wtok);
      }
      return tokens;
    }

    function rtrimSpacesLocal(s) {
      s = String(s);
      let e = s.length;
      while (e > 0) {
        const c = s.charCodeAt(e - 1); // 32,9,10,13
        if (c === 32 || c === 9 || c === 10 || c === 13) { e--; } else { break; }
      }
      return s.slice(0, e);
    }

    function sliceGraphemes(s, maxCount) {
      if (!s) return { taken: '', rest: '' };
      if (maxCount <= 0) return { taken: '', rest: s };
      if (!segG) {
        const arr = Array.from(s);
        return { taken: arr.slice(0, maxCount).join(''), rest: arr.slice(maxCount).join('') };
      }
      let out = ''; let count = 0;
      for (const it of segG.segment(s)) {
        if (count >= maxCount) return { taken: out, rest: s.slice(out.length) };
        out += it.segment; count++;
      }
      return { taken: out, rest: '' };
    }
  }

  // ======================================
  // Rendering
  // ======================================
  let lastChunks = [];
  let partMaxOverrides = []; // null / undefined = use global max
  let lastGlobalMax = null;

  function updateLengthTip(chunks) {
    if (!el.lengthTip) return;
    const row = document.getElementById('lengthTipRow');
    if (!row) return;

    if (!chunks || !chunks.length) {
      row.style.display = 'none';
      el.lengthTip.textContent = '';
      return;
    }

    let emojiDiff = false;
    let urlDiff = false;

    for (const txt of chunks) {
      const s = String(txt);
      const g = graphemes(s);
      const naive = s.length;

      if (g !== naive) {
        emojiDiff = true;
      }

      // Only check URL vs grapheme when URL-as-23 is enabled
      if (useUrl23 && tweetLen(s) !== g) {
        urlDiff = true;
      }

      if (emojiDiff && urlDiff) break;
    }

    if (!emojiDiff && !urlDiff) {
      row.style.display = 'none';
      el.lengthTip.textContent = '';
      return;
    }

    let msg = 'Tip: ';
    if (emojiDiff && urlDiff) {
      msg += 'The counter uses emoji-aware grapheme length and counts URLs as 23 characters (like on X/Twitter).';
    } else if (emojiDiff) {
      msg += 'The counter uses emoji-aware grapheme length.';
    } else if (urlDiff) {
      msg += 'URLs are counted as 23 characters (like on X/Twitter).';
    }

    el.lengthTip.textContent = msg;
    row.style.display = 'flex';
  }

  function render(chunks) {
    el.chunks.innerHTML = '';
    const cap = Number(el.maxChars && el.maxChars.value) || 280;
    let total = 0;

    chunks.forEach((txt, idx) => {
      const node = el.chunkTpl.content.firstElementChild.cloneNode(true);
      node.querySelector('.idx').textContent = String(idx + 1);
      const len = tweetLen(txt);  // Twitter-style length (or plain) via tweetLen
      total += len;
      node.querySelector('.len').textContent = String(len);
      node.querySelector('.cap').textContent = String(cap);
      node.querySelector('.content').textContent = txt;

      const pct = Math.min(100, Math.round((len / cap) * 100));
      node.querySelector('.bar i').style.width = pct + '%';

      // Copy button
      node.querySelector('.copyBtn').addEventListener('click', async () => {
        await navigator.clipboard.writeText(txt);
        const btn = node.querySelector('.copyBtn');
        const prev = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(() => btn.textContent = prev, 800);
      });

      // Per-part max UI: [-][number][+]
      const partMaxInput = node.querySelector('.part-max-input');
      const decBtn = node.querySelector('.part-max-dec');
      const incBtn = node.querySelector('.part-max-inc');
      const usePerPart = !!(el.perPartMaxOverride && el.perPartMaxOverride.checked);

      if (partMaxInput) {
        partMaxInput.min = String(MIN_CHARS);
        partMaxInput.max = String(cap);
      }

      const currentOverride = partMaxOverrides[idx];
      const effectiveMax = (currentOverride != null) ? currentOverride : cap;
      partMaxInput.value = effectiveMax;

      function currentValue() {
        const globalMax = cap;
        return (partMaxOverrides[idx] != null) ? partMaxOverrides[idx] : globalMax;
      }

      function applyValue(newVal) {
        const globalMax = cap;
        const min = MIN_CHARS;
        let clamped = newVal;
        if (!Number.isFinite(clamped)) {
          clamped = currentValue();
        }
        if (clamped < min) clamped = min;
        if (clamped > globalMax) clamped = globalMax;

        partMaxOverrides[idx] = (clamped === globalMax) ? null : clamped;
        partMaxInput.value = clamped;
        run();
      }

      function commitInputFromField() {
        if (!usePerPart) {
          partMaxInput.value = currentValue();
          return;
        }
        const raw = partMaxInput.value.trim();
        if (!raw) {
          partMaxInput.value = currentValue();
          return;
        }
        const n = Number(raw);
        applyValue(n);
      }

      if (decBtn) {
        decBtn.addEventListener('click', () => {
          if (!usePerPart) return;
          const step = 10;
          const cur = currentValue();
          const next = cur - step;
          applyValue(next);
        });
      }

      if (incBtn) {
        incBtn.addEventListener('click', () => {
          if (!usePerPart) return;
          const step = 10;
          const cur = currentValue();
          const next = cur + step;
          applyValue(next);
        });
      }

      if (partMaxInput) {
        partMaxInput.addEventListener('blur', () => {
          commitInputFromField();
        });
        partMaxInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitInputFromField();
          }
        });
      }

      el.chunks.appendChild(node);
    });

    if (chunks.length) {
      el.summary.innerHTML = `${chunks.length} parts · average <span class="mono">${Math.round(total / chunks.length)}</span> chars`;
    } else {
      el.summary.textContent = 'Nothing yet.';
    }

    updateLengthTip(chunks);
  }

  // ======================================
  // UI state helpers
  // ======================================
  function isAuto() {
    return el.autoBtn && el.autoBtn.getAttribute('aria-pressed') === 'true';
  }

  function updateButtons() {
    const inputEmpty = !el.input.value.trim();
    const noOutput = !lastChunks || lastChunks.length === 0;

    if (el.splitBtn) el.splitBtn.disabled = inputEmpty || isAuto();
    if (el.clearBtn) el.clearBtn.disabled = inputEmpty;
    if (el.copyAllBtn) el.copyAllBtn.disabled = noOutput;
    if (el.exportJsonBtn) el.exportJsonBtn.disabled = noOutput;
  }

  function updateCounterUI() {
    if (!el.useNumbering) return;
    const on = !!el.useNumbering.checked;

    if (el.counterPlacement) {
      el.counterPlacement.style.display = on ? '' : 'none';
      const maybeText = el.counterPlacement.nextElementSibling;
      if (maybeText && maybeText.tagName === 'SPAN') {
        maybeText.style.display = on ? '' : 'none';
      }
    }

    const advRow = document.querySelector('.counter-adv');
    if (advRow) advRow.style.display = on ? 'inline-flex' : 'none';
  }

  function updatePerPartUI() {
    const usePerPart = !!(el.perPartMaxOverride && el.perPartMaxOverride.checked);
    document.body.classList.toggle('per-part-on', usePerPart);
  }

  function updateAutoHint() {
    if (!el.autoHint) return;
    if (isAuto()) {
      el.autoHint.textContent = 'Text is split automatically while you type.';
    } else {
      el.autoHint.textContent = 'Click Split button to split the text.';
    }
  }

  // ======================================
  // Run split
  // ======================================
  function run() {
    saveOpts();

    // URL length mode (URLs as 23 chars or not)
    useUrl23 = !!(el.urlAs23 && el.urlAs23.checked);

    const placement = (el.counterPlacement && el.counterPlacement.value === 'before') ? 'prefix' : 'suffix';

    const useContinuation = !!(el.useContinuation && el.useContinuation.checked);
    let continuationChar = '';
    if (useContinuation && el.continuationMarker) {
      continuationChar = el.continuationMarker.value === 'ellipsis' ? '…' : '→';
    }

    const rawGlobal = Number(el.maxChars && el.maxChars.value);
    let globalMax = Number.isFinite(rawGlobal) ? rawGlobal : 280;

    // Apply shared minimum and reflect it back into the input if clamped
    if (globalMax < MIN_CHARS) {
      globalMax = MIN_CHARS;
      if (el.maxChars) {
        el.maxChars.value = String(globalMax);
      }
    }

    // Reset overrides when global max changes
    if (lastGlobalMax != null && globalMax !== lastGlobalMax) {
      partMaxOverrides = [];
    }
    lastGlobalMax = globalMax;

    const usePerPart = !!(el.perPartMaxOverride && el.perPartMaxOverride.checked);
    const overridesForSplit = usePerPart ? partMaxOverrides : [];

    const opts = {
      text: normalize(el.input.value),
      maxChars: globalMax,

      useNumbering: !!(el.useNumbering && el.useNumbering.checked),
      placement,
      parens: !!(el.counterParens && el.counterParens.checked),
      newline: !!(el.counterNewline && el.counterNewline.checked),

      doubleBreakNewPost: !!(el.doubleBreakNewPost && el.doubleBreakNewPost.checked),

      useContinuation,
      continuationChar
    };

    if (!opts.text) {
      lastChunks = [];
      render([]);
      updateButtons();
      return;
    }

    lastChunks = splitGreedy(opts, overridesForSplit);

    // Keep overrides array aligned with number of parts
    if (usePerPart) {
      if (partMaxOverrides.length < lastChunks.length) {
        const len0 = partMaxOverrides.length;
        for (let i = len0; i < lastChunks.length; i++) {
          partMaxOverrides[i] = null;
        }
      } else if (partMaxOverrides.length > lastChunks.length) {
        partMaxOverrides.length = lastChunks.length;
      }
    }

    render(lastChunks);
    updateButtons();
  }

  // ======================================
  // Events
  // ======================================
  if (el.splitBtn) el.splitBtn.addEventListener('click', run);

  if (el.autoBtn) {
    el.autoBtn.addEventListener('click', () => {
      const next = el.autoBtn.getAttribute('aria-pressed') !== 'true';
      el.autoBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
      saveOpts();
      updateAutoHint();
      if (next) run();
      updateButtons();
    });
  }

  if (el.advBtn) {
    el.advBtn.addEventListener('click', () => {
      const next = el.advBtn.getAttribute('aria-pressed') !== 'true';
      el.advBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
      document.body.classList.toggle('advanced', next);
      saveOpts();
    });
  }

  ['input', 'keyup'].forEach(evt => {
    if (el.input) {
      el.input.addEventListener(evt, () => {
        if (isAuto()) run();
        updateButtons();
      });
    }
  });

  const optNodes = [
    'maxChars', 'useNumbering', 'counterPlacement', 'counterParens', 'counterNewline',
    'doubleBreakNewPost',
    'useContinuation', 'continuationMarker',
    'perPartMaxOverride',
    'urlAs23'
  ];
  for (const k of optNodes) {
    const node = el[k];
    if (!node) continue;
    node.addEventListener('change', () => {
      if (k === 'useNumbering') updateCounterUI();
      if (k === 'perPartMaxOverride') {
        // When turning override OFF, reset all overrides to global
        if (!el.perPartMaxOverride.checked) {
          partMaxOverrides = [];
        }
        updatePerPartUI();
      }
      run();
    });
  }

  if (el.copyAllBtn) {
    el.copyAllBtn.addEventListener('click', async () => {
      if (!lastChunks.length) return;
      await navigator.clipboard.writeText(lastChunks.join('\n\n'));
      flash(el.copyAllBtn, 'Copied all');
    });
  }

  if (el.exportJsonBtn) {
    el.exportJsonBtn.addEventListener('click', () => {
      if (!lastChunks.length) return;
      const blob = new Blob([JSON.stringify(lastChunks, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'thread.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  if (el.clearBtn) {
    el.clearBtn.addEventListener('click', () => {
      el.input.value = '';
      lastChunks = [];
      partMaxOverrides = [];
      render([]);
      updateButtons();
      saveOpts();
    });
  }

  if (el.optionsResetBtn) {
    el.optionsResetBtn.addEventListener('click', () => {
      if (el.maxChars) el.maxChars.value = String(OPTION_DEFAULTS.maxChars);
      if (el.useNumbering) el.useNumbering.checked = OPTION_DEFAULTS.useNumbering;
      if (el.counterPlacement) el.counterPlacement.value = OPTION_DEFAULTS.counterPlacement;
      if (el.counterParens) el.counterParens.checked = OPTION_DEFAULTS.counterParens;
      if (el.counterNewline) el.counterNewline.checked = OPTION_DEFAULTS.counterNewline;
      if (el.doubleBreakNewPost) el.doubleBreakNewPost.checked = OPTION_DEFAULTS.doubleBreakNewPost;
      if (el.useContinuation) el.useContinuation.checked = OPTION_DEFAULTS.useContinuation;
      if (el.continuationMarker) el.continuationMarker.value = OPTION_DEFAULTS.continuationMarker;
      if (el.perPartMaxOverride) el.perPartMaxOverride.checked = OPTION_DEFAULTS.perPartMaxOverride;
      if (el.urlAs23) el.urlAs23.checked = OPTION_DEFAULTS.urlAs23;
      if (el.advBtn) el.advBtn.setAttribute('aria-pressed', OPTION_DEFAULTS.advOn ? 'true' : 'false');
      document.body.classList.toggle('advanced', OPTION_DEFAULTS.advOn);

      partMaxOverrides = [];
      updateCounterUI();
      updatePerPartUI();
      run();
    });
  }

  function flash(button, text) {
    const prev = button.textContent;
    button.textContent = text;
    setTimeout(() => button.textContent = prev, 900);
  }

  // ======================================
  // Initial UI sync
  // ======================================
  updateCounterUI();
  updatePerPartUI();
  updateAutoHint();
  render([]);
  updateButtons();
})();
