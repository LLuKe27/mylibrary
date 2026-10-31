import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════════');
console.log('\x1b[1m\x1b[34m%s\x1b[0m', '  Biblioteca Digital Semântica — Inicializando Ambiente (Grupo 9)');
console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════════');

function run(name, dir, color) {
  const child = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.join(root, dir),
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  const prefix = `${color}[${name}]\x1b[0m `;
  child.stdout.on('data', (d) => process.stdout.write(prefix + d.toString().replace(/\n/g, '\n' + prefix)));
  child.stderr.on('data', (d) => process.stderr.write(prefix + d.toString().replace(/\n/g, '\n' + prefix)));
  child.on('close', (code) => console.log(`${prefix} processo finalizado com código ${code}`));
  return child;
}

const backend = run('Backend (Next.js :3001)', 'JavaScript/Backend', '\x1b[35m');
const frontend = run('Frontend (Vite :5173)  ', 'JavaScript/Frontend', '\x1b[32m');

function cleanup() {
  console.log('\nFinalizando serviços...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

