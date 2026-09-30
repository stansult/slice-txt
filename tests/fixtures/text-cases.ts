export const textCases = {
  wordBoundary: {
    name: 'word boundary input',
    input: 'one two three four five six seven eight nine ten eleven',
  },
  justOver280: {
    name: 'ASCII input just over 280 characters',
    input: 'x'.repeat(281),
  },
  urlNearWeightedLimit: {
    name: 'URL input just over 280 when URLs count as 23',
    input: `${'x'.repeat(258)} https://example.com`,
    requiredSubstrings: ['https://example.com'],
  },
} as const;

export const optionScenarios = {
  minimumWithoutExtras: {
    name: '50-character limit without numbering or continuation',
    maxChars: 50,
    useNumbering: false,
    useContinuation: false,
    counterNewline: false,
  },
  minimumWithCounterNewline: {
    name: '50-character limit with counter on a new line',
    maxChars: 50,
    useNumbering: true,
    useContinuation: false,
    counterNewline: true,
  },
  standardWithoutExtras: {
    name: '280-character limit without numbering or continuation',
    maxChars: 280,
    useNumbering: false,
    useContinuation: false,
    counterNewline: false,
  },
  standardWithArrow: {
    name: '280-character limit with arrow continuation',
    maxChars: 280,
    useNumbering: false,
    useContinuation: true,
    continuationMarker: 'arrow',
    counterNewline: false,
  },
  standardWithCounterNewline: {
    name: '280-character limit with counter on a new line',
    maxChars: 280,
    useNumbering: true,
    useContinuation: false,
    counterNewline: true,
  },
  standardWithArrowAndCounterNewline: {
    name: '280-character limit with arrow and counter on a new line',
    maxChars: 280,
    useNumbering: true,
    useContinuation: true,
    continuationMarker: 'arrow',
    counterNewline: true,
  },
  standardWithParentheticalPrefixCounter: {
    name: '280-character limit with parenthetical counter before text',
    maxChars: 280,
    useNumbering: true,
    counterPlacement: 'before',
    counterParens: true,
    useContinuation: false,
    counterNewline: false,
  },
  standardWithEllipsis: {
    name: '280-character limit with ellipsis continuation',
    maxChars: 280,
    useNumbering: false,
    useContinuation: true,
    continuationMarker: 'ellipsis',
    counterNewline: false,
  },
  standardWithUrlAs23: {
    name: '280-character limit with URL-as-23 counting',
    maxChars: 280,
    useNumbering: false,
    useContinuation: false,
    counterNewline: false,
    urlAs23: true,
  },
} as const;

export const splittingRuns = [
  {
    name: 'minimum word-boundary split',
    data: textCases.wordBoundary,
    options: optionScenarios.minimumWithoutExtras,
    expectedParts: [
      'one two three four five six seven eight nine ten',
      'eleven',
    ],
  },
  {
    name: 'minimum word-boundary split with counter newline',
    data: textCases.wordBoundary,
    options: optionScenarios.minimumWithCounterNewline,
  },
  {
    name: 'standard 280-character boundary',
    data: textCases.justOver280,
    options: optionScenarios.standardWithoutExtras,
  },
  {
    name: '280-character boundary with continuation marker',
    data: textCases.justOver280,
    options: optionScenarios.standardWithArrow,
  },
  {
    name: '280-character boundary with counter newline',
    data: textCases.justOver280,
    options: optionScenarios.standardWithCounterNewline,
  },
  {
    name: '280-character boundary with continuation marker and counter newline',
    data: textCases.justOver280,
    options: optionScenarios.standardWithArrowAndCounterNewline,
  },
  {
    name: '280-character boundary with parenthetical prefix counter',
    data: textCases.justOver280,
    options: optionScenarios.standardWithParentheticalPrefixCounter,
  },
  {
    name: '280-character boundary with ellipsis continuation',
    data: textCases.justOver280,
    options: optionScenarios.standardWithEllipsis,
  },
  {
    name: 'weighted URL boundary',
    data: textCases.urlNearWeightedLimit,
    options: optionScenarios.standardWithUrlAs23,
  },
];
