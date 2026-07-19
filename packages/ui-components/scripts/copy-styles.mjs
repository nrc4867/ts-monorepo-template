// `tsc -b` only emits .js/.d.ts — .module.scss files have no TS role, so they
// need a manual copy into dist/ to sit next to the compiled component that
// imports them. Consumers (e.g. apps/web's Vite build) resolve CSS Modules by
// filename convention regardless of whether the file lives in node_modules,
// so shipping the source .scss unmodified is enough — no compile step here.
import { cpSync, statSync } from 'node:fs';
import { join } from 'node:path';

const srcDir = join(import.meta.dirname, '..', 'src');
const distDir = join(import.meta.dirname, '..', 'dist');

cpSync(srcDir, distDir, {
  recursive: true,
  filter: (source) => statSync(source).isDirectory() || source.endsWith('.module.scss'),
});
