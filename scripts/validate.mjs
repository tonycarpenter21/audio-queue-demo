/**
 * Runs every check of the demo and prints a summary: npm run validate
 *   (npm run validate -- --skip-e2e to leave out the browser walkthrough)
 *
 * Checks, in order: the installed audioq version, compiler strictness, lint strictness,
 * formatting, lint (zero warnings), stylelint, types, unit tests, unused modules, the build and
 * the Chromium end-to-end walkthrough.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skipE2e = process.argv.includes('--skip-e2e');
const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));

const run = (command, args, env = {}) => {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', env: { ...process.env, ...env } });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  return { ok: result.status === 0, output };
};

const tail = (text, lines = 25) => text.trim().split('\n').slice(-lines).join('\n');

/** Compiler options that must stay on (and off). */
const REQUIRED_ON = [
  'strict',
  'noUncheckedIndexedAccess',
  'exactOptionalPropertyTypes',
  'noImplicitOverride',
  'noImplicitReturns',
  'noPropertyAccessFromIndexSignature',
  'noUnusedLocals',
  'noUnusedParameters',
  'noFallthroughCasesInSwitch',
  'forceConsistentCasingInFileNames',
  'isolatedModules'
];
const REQUIRED_OFF = ['allowJs', 'allowUnreachableCode', 'allowUnusedLabels'];

/** Strict preset rules that may be off, and why (anything else off or a warning fails). */
const ALLOWED_OFF = {
  '@typescript-eslint/no-confusing-void-expression': 'readability: `() => doThing()` shorthands',
  '@typescript-eslint/no-inferrable-types': 'house style: explicit types',
  '@typescript-eslint/non-nullable-type-assertion-style': 'conflicts with no-non-null-assertion'
};

const sourceFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts') ? [path] : [];
  });

const checks = [
  [
    'audioq version',
    () => {
      const version = readJson('node_modules/audioq/package.json').version;
      return version.startsWith('3.')
        ? { ok: true, summary: `audioq ${version}` }
        : {
            ok: false,
            output:
              `node_modules has audioq ${version}; the demo needs 3.x. Until it is published, install ` +
              'a packed build: npm install --no-save /tmp/audioq-pack/audioq-3.0.0.tgz (another ' +
              'npm install removes it again).'
          };
    }
  ],
  [
    'compiler strictness',
    () => {
      const options = readJson('tsconfig.json').compilerOptions;
      const problems = [
        ...REQUIRED_ON.filter((flag) => options[flag] !== true).map((flag) => `"${flag}" must be true`),
        ...REQUIRED_OFF.filter((flag) => options[flag] !== false).map((flag) => `"${flag}" must be false`)
      ];
      return problems.length === 0
        ? { ok: true, summary: `${REQUIRED_ON.length + REQUIRED_OFF.length} flags` }
        : { ok: false, output: problems.join('\n') };
    }
  ],
  [
    'lint strictness',
    async () => {
      // ESLint 8's default class reads legacy .eslintrc config; load the flat config lint uses.
      const { loadESLint } = await import('eslint');
      const ESLint = await loadESLint({ useFlatConfig: true });
      const tseslint = (await import('typescript-eslint')).default;
      const preset = [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked];
      const rules = new Set(
        preset.flatMap((config) =>
          Object.entries(config.rules ?? {})
            .filter(([, setting]) => (Array.isArray(setting) ? setting[0] : setting) !== 'off')
            .map(([rule]) => rule)
        )
      );
      rules.add('react-hooks/rules-of-hooks');
      rules.add('react-hooks/exhaustive-deps');
      const config = await new ESLint({ cwd: root }).calculateConfigForFile(join(root, 'src/App.tsx'));
      const problems = [...rules].filter((rule) => {
        const setting = config.rules?.[rule];
        const level = Array.isArray(setting) ? setting[0] : setting;
        return level !== 2 && level !== 'error' && !(rule in ALLOWED_OFF);
      });
      return problems.length === 0
        ? { ok: true, summary: `${rules.size} rules enforced` }
        : { ok: false, output: problems.map((rule) => `${rule} is not "error"`).join('\n') };
    }
  ],
  ['formatting', () => run('npx', ['prettier', '--check', 'src', 'scripts'])],
  ['lint', () => run('npx', ['eslint', 'src', '--max-warnings', '0'])],
  ['stylelint', () => run('npx', ['stylelint', 'src/**/*.css'])],
  ['types', () => run('npx', ['tsc', '--noEmit', '-p', '.'])],
  ['unit tests', () => run('npx', ['react-scripts', 'test', '--watchAll=false'], { CI: 'true' })],
  [
    'no unused modules',
    () => {
      // Every module must be reachable from the entry point or be a test.
      const files = sourceFiles(join(root, 'src'));
      const reachable = new Set();
      const visit = (file) => {
        if (reachable.has(file)) return;
        reachable.add(file);
        const text = readFileSync(file, 'utf8');
        for (const [, spec] of text.matchAll(/(?:import|export)[^'"]*?from\s+'(\.[^']+)'|import\s+'(\.[^']+)'/g)) {
          if (!spec) continue;
          const base = resolve(dirname(file), spec);
          const target = ['.ts', '.tsx', '/index.ts', '/index.tsx', ''].map((ext) => base + ext).find((path) => files.includes(path));
          if (target) visit(target);
        }
      };
      visit(join(root, 'src/index.tsx'));
      const unused = files.filter((file) => !reachable.has(file) && !/\.test\.tsx?$/.test(file) && !file.endsWith('setupTests.ts'));
      return unused.length === 0
        ? { ok: true, summary: `${reachable.size} modules reachable` }
        : { ok: false, output: unused.map((file) => `${relative(root, file)} is not imported anywhere`).join('\n') };
    }
  ],
  ['build', () => run('npx', ['react-scripts', 'build'], { CI: 'true' })],
  ...(skipE2e ? [] : [['end-to-end', () => run('node', ['scripts/e2e/run.js'])]])
];

let failed = 0;
for (const [name, check] of checks) {
  const started = Date.now();
  const result = await check();
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`${result.ok ? '✔' : '✖'} ${name.padEnd(20)} ${seconds.padStart(5)}s  ${result.summary ?? ''}`);
  if (!result.ok) {
    failed++;
    console.log(tail(result.output ?? '').replace(/^/gm, '      '));
  }
}
console.log(failed === 0 ? `\nPASSED: ${checks.length} checks` : `\nFAILED: ${failed} of ${checks.length} checks`);
process.exit(failed === 0 ? 0 : 1);
