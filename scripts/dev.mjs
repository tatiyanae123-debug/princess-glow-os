import { spawn } from 'node:child_process';

const forwarded = process.argv.slice(2);
const nextArgs = ['node_modules/next/dist/bin/next', 'dev'];

for (let index = 0; index < forwarded.length; index += 1) {
  const argument = forwarded[index];
  if (argument === '--strictPort') continue;
  if (argument === '--host') {
    nextArgs.push('-H', forwarded[index + 1] ?? '0.0.0.0');
    index += 1;
    continue;
  }
  if (argument === '--port') {
    nextArgs.push('-p', forwarded[index + 1] ?? '3000');
    index += 1;
    continue;
  }
  nextArgs.push(argument);
}

const child = spawn(process.execPath, nextArgs, { stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
