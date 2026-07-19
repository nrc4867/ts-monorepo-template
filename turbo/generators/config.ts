import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { PlopTypes } from '@turbo/gen';

interface RootTsconfig {
  references?: { path: string }[];
  [key: string]: unknown;
}

function addTsconfigReference(relativePath: string): string {
  const tsconfigPath = join(process.cwd(), 'tsconfig.json');
  const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8')) as RootTsconfig;
  tsconfig.references ??= [];

  if (!tsconfig.references.some((ref) => ref.path === relativePath)) {
    tsconfig.references.push({ path: relativePath });
    writeFileSync(tsconfigPath, `${JSON.stringify(tsconfig, null, 2)}\n`);
    // JSON.stringify's formatting doesn't match Prettier's (it always
    // expands objects); reformat immediately instead of leaving it for the
    // pre-commit hook, so `pnpm format:check` passes right after `pnpm gen`.
    execFileSync('npx', ['prettier', '--write', tsconfigPath], { stdio: 'ignore', shell: true });
    return `Added "${relativePath}" to tsconfig.json references`;
  }

  return `tsconfig.json already references "${relativePath}"`;
}

function nameValidator(input: string): boolean | string {
  return /^[a-z][a-z0-9-]*$/.test(input) || 'Use lowercase kebab-case, e.g. date-utils';
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('package', {
    description: 'Add a new library in packages/<name>',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Package name (kebab-case):',
        validate: nameValidator,
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: 'packages/{{name}}/',
        base: 'templates/package',
        templateFiles: 'templates/package/**',
      },
      (answers) => addTsconfigReference(`packages/${(answers as { name: string }).name}`),
      () => 'Run `pnpm install` to link the new workspace member.',
    ],
  });
}
