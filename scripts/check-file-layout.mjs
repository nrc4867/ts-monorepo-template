// Enforces the layout convention from AGENTS.md, uniformly across every
// app/package's src/ (not just components): tests live under __specs__/ and
// stylesheets live under styles/ — never colocated next to the file they
// belong to. One rule, applied the same way everywhere, is the point — it's
// what keeps any two packages easy to navigate the same way. ESLint can't
// express "this file must be in that folder" for non-JS files (.scss isn't
// even linted), so this is a small standalone check instead of an ESLint rule.
import { readdirSync, statSync } from 'node:fs';
import { relative } from 'node:path';

/** @type {{ pattern: RegExp; expectedDir: string }[]} */
const rules = [
  { pattern: /\.test\.tsx?$/, expectedDir: '__specs__' },
  { pattern: /\.module\.scss$/, expectedDir: 'styles' },
];

/**
 * @param {string} dir
 * @returns {boolean}
 */
function isDirectory(dir) {
  try {
    return statSync(dir).isDirectory();
  } catch (error) {
    if (error !== null && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

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

for (const group of ['apps', 'packages']) {
  if (!isDirectory(group)) {
    continue;
  }

  for (const name of readdirSync(group)) {
    const srcDir = `${group}/${name}/src`;
    if (isDirectory(srcDir)) {
      walk(srcDir, violations);
    }
  }
}

if (violations.length > 0) {
  console.error(`File layout violations:\n${violations.map((v) => `  - ${v}`).join('\n')}`);
  process.exit(1);
}
