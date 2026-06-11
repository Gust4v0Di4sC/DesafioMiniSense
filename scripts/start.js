const { spawn } = require('node:child_process');
const path = require('node:path');

const args = process.argv.slice(2);
const devFlags = new Set(['dev', '--dev', '--watch', '-w']);
const isDevMode = args.some((arg) => devFlags.has(arg));
const passthroughArgs = args.filter((arg) => !devFlags.has(arg));
const nestCli = path.join(
  __dirname,
  '..',
  'node_modules',
  '@nestjs',
  'cli',
  'bin',
  'nest.js',
);

const nestArgs = ['start'];

if (isDevMode) {
  nestArgs.push('--watch');
}

nestArgs.push(...passthroughArgs);

const child = spawn(process.execPath, [nestCli, ...nestArgs], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});
