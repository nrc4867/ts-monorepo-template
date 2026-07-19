// Enforces the "Components and styling" convention from AGENTS.md: inside
// any src/components/**, tests live under __specs__/ and stylesheets live
// under styles/ — not colocated next to the component file. ESLint can't
// express "this file must be in that folder" for non-JS files (.scss isn't
// even linted), so this is a small standalone check instead of an ESLint rule.
import { readdirSync, statSync } from 'node:fs';
import { relative } from 'node:path';

const componentsRoots = ['apps/web/src/components', 'packages/ui-components/src/components'];

/** @type {{ pattern: RegExp; expectedDir: string }[]} */
const rules = [
  { pattern: /\.test\.tsx?$/, expectedDir: '__specs__' },
  { pattern: /\.module\.scss$/, expectedDir: 'styles' },
];

/**
 * @param {string} dir
 * @param {string[]} violations
 */
function walk(dir, violations) {
  for (const entry of readdirSync(dir)) {
    const fullPath = `${dir}/${entry}`;
    if (statSync(fullPath).isDirectory()) {
      walk(fullPath, violations);
      continue;
    }

    for (const { pattern, expectedDir } of rules) {
      if (pattern.test(entry) && !fullPath.split('/').includes(expectedDir)) {
        violations.push(
          `${relative(process.cwd(), fullPath)} must be inside a "${expectedDir}/" directory`,
        );
      }
    }
  }
}

/** @type {string[]} */
const violations = [];

for (const root of componentsRoots) {
  try {
    walk(root, violations);
  } catch (error) {
    const isMissingDirectory =
      error !== null && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';
    if (!isMissingDirectory) {
      throw error;
    }
  }
}

if (violations.length > 0) {
  console.error(`Component layout violations:\n${violations.map((v) => `  - ${v}`).join('\n')}`);
  process.exit(1);
}
